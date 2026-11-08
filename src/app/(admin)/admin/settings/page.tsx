"use client";

import { useRef, useState } from "react";
import { Box, Button, Flex, Input, Tabs, Text, Textarea, VStack } from "@chakra-ui/react";
import { LuGlobe, LuShield, LuUser } from "react-icons/lu";
import toast from "react-hot-toast";
import FileUploadInput from "@/components/admin/FileUploadInput";
import {
    FormBanner,
    FormField,
    FormSkeleton,
    PageHeader,
    Panel,
    SectionTitle,
    SwitchRow,
    TrackedForm,
    controlProps,
    primaryButton,
} from "@/components/admin/AdminUI";
import { emailError, hasErrors, maxLengthError, submitFailure, type FieldErrors } from "@/components/admin/forms";
import { formatDate } from "@/components/admin/format";
import { ErrorState, errorMessage } from "@/components/ui/states";
import { useApi } from "@/hooks/useApi";
import { invalidatePublicSettings } from "@/hooks/usePublicSettings";
import {
    api,
    ApiError,
    type PasswordChangePayload,
    type ProfileUpdatePayload,
    type SiteSettings,
    type SiteSettingsUpdate,
    type UserResponse,
} from "@/lib/api";
import { useAuthStore } from "@/store/auth";

const USERNAME_RE = /^[\p{L}\p{N}_-]+$/u;

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

const PROFILE_FIELDS = ["full_name", "email", "username", "bio", "profile_image"] as const;

function ProfileForm({ account, onSaved }: { account: UserResponse; onSaved: (u: UserResponse) => void }) {
    const setStoreUser = useAuthStore((s) => s.setUser);
    const [fullName, setFullName] = useState(account.full_name ?? "");
    const [email, setEmail] = useState(account.email);
    const [username, setUsername] = useState(account.username);
    const [bio, setBio] = useState(account.bio ?? "");
    const [profileImage, setProfileImage] = useState<string | null>(account.profile_image ?? null);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [banner, setBanner] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const lock = useRef(false);

    const validate = (): FieldErrors => {
        const u = username.trim();
        return {
            full_name: maxLengthError(fullName, 100),
            email: !email.trim() ? "Email is required" : emailError(email),
            username:
                u.length < 3
                    ? "Use at least 3 characters"
                    : u.length > 50
                      ? "Keep it under 50 characters"
                      : !USERNAME_RE.test(u)
                        ? "Use letters, numbers, _ and - only"
                        : undefined,
            bio: maxLengthError(bio, 500),
        };
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (lock.current) return;
        const found = validate();
        setErrors(found);
        if (hasErrors(found)) {
            setBanner(null);
            return;
        }
        lock.current = true;
        setSaving(true);
        setBanner(null);
        const payload: ProfileUpdatePayload = {
            full_name: fullName.trim() || null,
            email: email.trim(),
            username: username.trim(),
            bio: bio.trim() || null,
            profile_image: profileImage || null,
        };
        try {
            const updated = await api.patch<UserResponse>("/auth/me", payload);
            // Show server truth (it may normalise values).
            setFullName(updated.full_name ?? "");
            setEmail(updated.email);
            setUsername(updated.username);
            setBio(updated.bio ?? "");
            setProfileImage(updated.profile_image ?? null);
            onSaved(updated);
            setStoreUser({
                id: updated.id,
                username: updated.username,
                email: updated.email,
                full_name: updated.full_name,
            });
            toast.success("Profile saved");
        } catch (err) {
            const { fields, banner: message } = submitFailure(err, PROFILE_FIELDS, "Couldn't save your profile.");
            setErrors(fields);
            setBanner(message);
        } finally {
            lock.current = false;
            setSaving(false);
        }
    };

    return (
        <Panel>
            <TrackedForm onSubmit={submit}>
                <SectionTitle title="Public profile" description="This information is shown on your portfolio." />
                <FormBanner message={banner} />
                <VStack align="stretch" gap={6}>
                    <Box maxW="sm">
                        <FileUploadInput
                            kind="image"
                            label="Profile photo"
                            value={profileImage}
                            onChange={setProfileImage}
                            helperText="Square images look best."
                            error={errors.profile_image}
                            disabled={saving}
                        />
                    </Box>
                    <FormField label="Full name" error={errors.full_name}>
                        <Input {...controlProps} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Victor Mbugua" disabled={saving} />
                    </FormField>
                    <Flex direction={{ base: "column", sm: "row" }} gap={5}>
                        <Box flex={1}>
                            <FormField label="Email" required error={errors.email}>
                                <Input {...controlProps} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" disabled={saving} />
                            </FormField>
                        </Box>
                        <Box flex={1}>
                            <FormField label="Username" required helper="Letters, numbers, _ and - only." error={errors.username}>
                                <Input {...controlProps} autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="victor" disabled={saving} />
                            </FormField>
                        </Box>
                    </Flex>
                    <FormField label="Bio / tagline" helper="A short line shown on your profile. Up to 500 characters." error={errors.bio}>
                        <Textarea {...controlProps} value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Full Stack Developer & UI/UX Designer" disabled={saving} />
                    </FormField>

                    <Text textStyle="meta" color="text.secondary">
                        Role: {account.is_superuser ? "Administrator" : "User"} · Member since {formatDate(account.created_at)}
                    </Text>

                    <Box>
                        <Button type="submit" {...primaryButton} loading={saving} loadingText="Saving">
                            Save changes
                        </Button>
                    </Box>
                </VStack>
            </TrackedForm>
        </Panel>
    );
}

// ---------------------------------------------------------------------------
// Portfolio / site settings
// ---------------------------------------------------------------------------

const SITE_FIELDS = ["professional_title", "meta_title", "meta_description", "show_freelance", "available_for_work"] as const;

function SiteForm({ settings, onSaved }: { settings: SiteSettings; onSaved: (s: SiteSettings) => void }) {
    const [professionalTitle, setProfessionalTitle] = useState(settings.professional_title ?? "");
    const [metaTitle, setMetaTitle] = useState(settings.meta_title ?? "");
    const [metaDescription, setMetaDescription] = useState(settings.meta_description ?? "");
    const [showFreelance, setShowFreelance] = useState(settings.show_freelance);
    const [availableForWork, setAvailableForWork] = useState(settings.available_for_work);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [banner, setBanner] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const lock = useRef(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (lock.current) return;
        const found: FieldErrors = {
            professional_title: maxLengthError(professionalTitle, 150),
            meta_title: maxLengthError(metaTitle, 255),
            meta_description: maxLengthError(metaDescription, 500),
        };
        setErrors(found);
        if (hasErrors(found)) {
            setBanner(null);
            return;
        }
        lock.current = true;
        setSaving(true);
        setBanner(null);
        const payload: SiteSettingsUpdate = {
            professional_title: professionalTitle.trim() || null,
            meta_title: metaTitle.trim() || null,
            meta_description: metaDescription.trim() || null,
            show_freelance: showFreelance,
            available_for_work: availableForWork,
        };
        try {
            const saved = await api.put<SiteSettings>("/settings/", payload);
            setProfessionalTitle(saved.professional_title ?? "");
            setMetaTitle(saved.meta_title ?? "");
            setMetaDescription(saved.meta_description ?? "");
            setShowFreelance(saved.show_freelance);
            setAvailableForWork(saved.available_for_work);
            onSaved(saved);
            // Public nav and badges read a shared cache; refresh it now.
            void invalidatePublicSettings();
            toast.success("Portfolio settings saved");
        } catch (err) {
            const { fields, banner: message } = submitFailure(err, SITE_FIELDS, "Couldn't save the settings.");
            setErrors(fields);
            setBanner(message);
        } finally {
            lock.current = false;
            setSaving(false);
        }
    };

    return (
        <TrackedForm onSubmit={submit}>
            <FormBanner message={banner} />
            <VStack align="stretch" gap={6}>
                <Panel>
                    <SectionTitle
                        title="SEO configuration"
                        description="Controls how your portfolio appears in search results and browser tabs. The public site picks up changes within 5 minutes."
                    />
                    <VStack align="stretch" gap={6}>
                        <FormField label="Professional title" helper="Your public headline." error={errors.professional_title}>
                            <Input {...controlProps} value={professionalTitle} onChange={(e) => setProfessionalTitle(e.target.value)} placeholder="Full Stack Developer & UI/UX Designer" disabled={saving} />
                        </FormField>
                        <FormField label="Meta title" error={errors.meta_title}>
                            <Input {...controlProps} value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Victor Mbugua | Developer Portfolio" disabled={saving} />
                        </FormField>
                        <FormField label="Meta description" helper="Up to 500 characters." error={errors.meta_description}>
                            <Textarea {...controlProps} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={3} placeholder="Explore the portfolio of Victor Mbugua" disabled={saving} />
                        </FormField>
                    </VStack>
                </Panel>

                <Panel>
                    <SectionTitle title="Visibility" description="Toggle public sections of your portfolio." />
                    <VStack align="stretch" gap={5}>
                        <SwitchRow
                            label="Show services section"
                            description="Display the services and packages section on the home page"
                            checked={showFreelance}
                            onChange={setShowFreelance}
                            disabled={saving}
                        />
                        <Box h="1px" bg="border" />
                        <SwitchRow
                            label="Available for work"
                            description='Show an "Open to work" badge in the nav'
                            checked={availableForWork}
                            onChange={setAvailableForWork}
                            disabled={saving}
                        />
                    </VStack>
                </Panel>

                <Box>
                    <Button type="submit" {...primaryButton} loading={saving} loadingText="Saving">
                        Save settings
                    </Button>
                </Box>
            </VStack>
        </TrackedForm>
    );
}

// ---------------------------------------------------------------------------
// Security
// ---------------------------------------------------------------------------

function passwordStrengthError(value: string): string | undefined {
    if (!value) return "Enter a new password";
    if (value.length < 8) return "Use at least 8 characters";
    if (value.length > 100) return "Keep it under 100 characters";
    if (!/[A-Z]/.test(value)) return "Add an uppercase letter";
    if (!/[a-z]/.test(value)) return "Add a lowercase letter";
    if (!/\d/.test(value)) return "Add a number";
    return undefined;
}

function PasswordForm() {
    const [currentPwd, setCurrentPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [errors, setErrors] = useState<FieldErrors>({});
    const [banner, setBanner] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const lock = useRef(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (lock.current) return;
        const found: FieldErrors = {
            current_password: currentPwd ? undefined : "Enter your current password",
            new_password: passwordStrengthError(newPwd),
            confirm: confirmPwd !== newPwd ? "Passwords don't match" : undefined,
        };
        setErrors(found);
        if (hasErrors(found)) {
            setBanner(null);
            return;
        }
        lock.current = true;
        setSaving(true);
        setBanner(null);
        const payload: PasswordChangePayload = { current_password: currentPwd, new_password: newPwd };
        try {
            await api.post("/auth/change-password", payload);
            setCurrentPwd("");
            setNewPwd("");
            setConfirmPwd("");
            setErrors({});
            toast.success("Password changed");
        } catch (err) {
            if (err instanceof ApiError && err.status === 400) {
                // Wrong current password (400, not 401, so the session stays).
                setErrors({ current_password: err.message || "Current password is incorrect" });
            } else {
                const { fields, banner: message } = submitFailure(err, ["current_password", "new_password"], "Couldn't change the password.");
                setErrors(fields);
                setBanner(Object.keys(fields).length ? null : message);
            }
        } finally {
            lock.current = false;
            setSaving(false);
        }
    };

    return (
        <Panel>
            <TrackedForm onSubmit={submit}>
                <SectionTitle title="Change password" description="Use a strong password you don't use elsewhere." />
                <FormBanner message={banner} />
                <VStack align="stretch" gap={6} maxW="md">
                    <FormField label="Current password" required error={errors.current_password}>
                        <Input {...controlProps} type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} autoComplete="current-password" disabled={saving} />
                    </FormField>
                    <FormField label="New password" required helper="At least 8 characters, with upper, lower and a number." error={errors.new_password}>
                        <Input {...controlProps} type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} autoComplete="new-password" disabled={saving} />
                    </FormField>
                    <FormField label="Confirm new password" required error={errors.confirm}>
                        <Input {...controlProps} type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} autoComplete="new-password" disabled={saving} />
                    </FormField>
                    <Box>
                        <Button type="submit" {...primaryButton} loading={saving} loadingText="Updating">
                            Update password
                        </Button>
                    </Box>
                </VStack>
            </TrackedForm>
        </Panel>
    );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const TAB_TRIGGER = {
    gap: 2,
    fontWeight: 500,
    color: "text.secondary",
    focusRingColor: "primary.500",
    _hover: { color: "text.primary" },
    css: {
        "&[data-selected]": {
            color: "var(--chakra-colors-primary-700)",
            "--indicator-color": "var(--chakra-colors-primary-500)",
        },
    },
} as const;

export default function AdminSettingsPage() {
    const me = useApi<UserResponse>("/auth/me");
    const site = useApi<SiteSettings>("/settings/");

    return (
        <Box maxW="4xl">
            <PageHeader title="Account settings" description="Manage your profile, portfolio configuration, and security." />

            <Tabs.Root defaultValue="profile" variant="line">
                <Tabs.List mb={6} flexWrap="wrap">
                    <Tabs.Trigger value="profile" {...TAB_TRIGGER}>
                        <LuUser aria-hidden /> Profile information
                    </Tabs.Trigger>
                    <Tabs.Trigger value="portfolio" {...TAB_TRIGGER}>
                        <LuGlobe aria-hidden /> Portfolio settings
                    </Tabs.Trigger>
                    <Tabs.Trigger value="security" {...TAB_TRIGGER}>
                        <LuShield aria-hidden /> Security
                    </Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="profile" p={0}>
                    {me.error && !me.data ? (
                        <ErrorState title="Couldn't load your account" description={errorMessage(me.error)} onRetry={me.reload} retrying={me.refreshing} />
                    ) : me.loading || !me.data ? (
                        <FormSkeleton fields={5} label="Loading your profile" />
                    ) : (
                        <ProfileForm key={me.data.id} account={me.data} onSaved={me.setData} />
                    )}
                </Tabs.Content>

                <Tabs.Content value="portfolio" p={0}>
                    {site.error && !site.data ? (
                        <ErrorState title="Couldn't load the site settings" description={errorMessage(site.error)} onRetry={site.reload} retrying={site.refreshing} />
                    ) : site.loading || !site.data ? (
                        <FormSkeleton fields={4} label="Loading site settings" />
                    ) : (
                        <SiteForm key="site" settings={site.data} onSaved={site.setData} />
                    )}
                </Tabs.Content>

                <Tabs.Content value="security" p={0}>
                    <PasswordForm />
                </Tabs.Content>
            </Tabs.Root>
        </Box>
    );
}

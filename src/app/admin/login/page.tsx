"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import toast from "react-hot-toast";
import { Box, Button, Flex, Heading, Input, Spinner, Text, VStack } from "@chakra-ui/react";
import { LuArrowLeft, LuCircleAlert, LuEye, LuEyeOff, LuLock, LuMail } from "react-icons/lu";
import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { errorMessage } from "@/components/ui/states";
import { CheckboxField, FormField, Panel, TrackedForm, controlProps, primaryButton } from "@/components/admin/AdminUI";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const loginSchema = z
    .object({
        identifier: z.string().trim().min(1, "Enter your email or username"),
        password: z.string().min(1, "Enter your password"),
    })
    .superRefine((val, ctx) => {
        // Only enforce email formatting when the identifier looks like an email.
        if (val.identifier.includes("@") && !EMAIL_RE.test(val.identifier)) {
            ctx.addIssue({ code: "custom", path: ["identifier"], message: "Enter a valid email address" });
        }
    });

type FieldErrors = { identifier?: string; password?: string };
type LoginError = { title: string; message: string };

const emptySubscribe = () => () => {};

function describeLoginError(err: unknown): LoginError {
    if (err instanceof ApiError) {
        if (/locked/i.test(err.message)) {
            return { title: "Account locked", message: `${err.message}. Wait a few minutes, then try again.` };
        }
        if (err.status === 401) return { title: "Couldn't sign you in", message: err.message || "Invalid credentials" };
        if (err.status === 429) return { title: "Too many attempts", message: err.message || "Wait a minute, then try again." };
        return { title: "Couldn't sign you in", message: err.message || "Something went wrong. Try again." };
    }
    return { title: "Can't reach the server", message: errorMessage(err) };
}

export default function LoginPage() {
    const router = useRouter();
    const setAuth = useAuthStore((s) => s.setAuth);
    const token = useAuthStore((s) => s.token);
    // False during SSR and the hydration render (zustand serves the
    // non-persisted initial state then), true afterwards. Only trust `token`
    // once this is true.
    const checked = useSyncExternalStore(emptySubscribe, () => true, () => false);

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(true);
    const [error, setError] = useState<LoginError | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [loading, setLoading] = useState(false);
    const submitting = useRef(false);

    const signedIn = checked && !!token;

    // Already signed in: go straight to the dashboard. Skipped while a submit is
    // in flight, because handleSubmit navigates itself once the login resolves.
    useEffect(() => {
        if (signedIn && !submitting.current) router.replace("/admin");
    }, [signedIn, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting.current) return;
        setError(null);

        const parsed = loginSchema.safeParse({ identifier, password });
        if (!parsed.success) {
            const fe: FieldErrors = {};
            for (const issue of parsed.error.issues) {
                const key = issue.path[0] as keyof FieldErrors | undefined;
                if (key && !fe[key]) fe[key] = issue.message;
            }
            setFieldErrors(fe);
            return;
        }
        setFieldErrors({});

        const id = parsed.data.identifier;
        submitting.current = true;
        setLoading(true);
        try {
            const { access_token } = await api.login(id, password);
            setAuth(access_token, { username: id }, remember);

            // Verify the token and store the full user (best effort).
            let name = id;
            try {
                const u = await api.me();
                setAuth(access_token, u, remember);
                name = u.full_name || u.username || name;
            } catch {
                /* the token already works; skip enrichment */
            }

            toast.success(`Signed in as ${name}`);
            router.push("/admin");
            // Keep the button in its loading state until the route changes.
        } catch (err) {
            setError(describeLoginError(err));
            submitting.current = false;
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        toast("Contact the site administrator to reset your password.");
    };

    return (
        <Flex minH="100vh" bg="background" align="center" justify="center" px={4} py={12}>
            <Box as="main" w="full" maxW="md">
                <VStack gap={3} mb={6} textAlign="center">
                    <Flex
                        w={10}
                        h={10}
                        rounded="lg"
                        bg="primary.500"
                        color="white"
                        align="center"
                        justify="center"
                        fontWeight={600}
                        fontSize="lg"
                        aria-hidden
                    >
                        V
                    </Flex>
                    <Box>
                        <Text fontWeight={600} color="text.primary">
                            Victor Mbugua
                        </Text>
                        <Text fontSize="sm" color="text.secondary">
                            Portfolio CMS
                        </Text>
                    </Box>
                </VStack>

                <Panel p={{ base: 6, md: 8 }} boxShadow="sm">
                    <Heading as="h1" textStyle="adminTitle" color="text.primary" mb={6}>
                        Admin portal access
                    </Heading>

                    {signedIn && !loading ? (
                        <Flex align="center" gap={3} py={6} role="status" aria-live="polite">
                            <Spinner size="sm" color="primary.500" />
                            <Text fontSize="sm" color="text.secondary">
                                You&apos;re already signed in. Opening the dashboard
                            </Text>
                        </Flex>
                    ) : (
                        <TrackedForm onSubmit={handleSubmit}>
                            <VStack gap={5} align="stretch">
                                {error ? (
                                    <Flex
                                        role="alert"
                                        gap={2.5}
                                        align="flex-start"
                                        px={4}
                                        py={3}
                                        rounded="lg"
                                        bg="red.50"
                                        border="1px solid"
                                        borderColor="red.200"
                                        color="red.800"
                                        fontSize="sm"
                                    >
                                        <Box as="span" mt="2px" flexShrink={0} aria-hidden>
                                            <LuCircleAlert />
                                        </Box>
                                        <Box>
                                            <Text fontWeight={500}>{error.title}</Text>
                                            <Text>{error.message}</Text>
                                        </Box>
                                    </Flex>
                                ) : null}

                                <FormField label="Email or username" error={fieldErrors.identifier}>
                                    <Box position="relative" w="full">
                                        <Flex position="absolute" insetY={0} left={3} align="center" pointerEvents="none" color="text.muted" zIndex={1} aria-hidden>
                                            <LuMail size={16} />
                                        </Flex>
                                        <Input
                                            {...controlProps}
                                            pl={9}
                                            placeholder="you@example.com"
                                            type="text"
                                            autoComplete="username"
                                            autoCapitalize="none"
                                            spellCheck={false}
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            disabled={loading}
                                        />
                                    </Box>
                                </FormField>

                                <FormField label="Password" error={fieldErrors.password}>
                                    <Box position="relative" w="full">
                                        <Flex position="absolute" insetY={0} left={3} align="center" pointerEvents="none" color="text.muted" zIndex={1} aria-hidden>
                                            <LuLock size={16} />
                                        </Flex>
                                        <Input
                                            {...controlProps}
                                            pl={9}
                                            pr={11}
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="current-password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={loading}
                                        />
                                        <Button
                                            type="button"
                                            position="absolute"
                                            top="50%"
                                            right={1}
                                            transform="translateY(-50%)"
                                            size="xs"
                                            variant="ghost"
                                            rounded="md"
                                            zIndex={1}
                                            color="text.secondary"
                                            focusRingColor="primary.500"
                                            _hover={{ bg: "gray.100", color: "text.primary" }}
                                            onClick={() => setShowPassword((v) => !v)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            aria-pressed={showPassword}
                                        >
                                            {showPassword ? <LuEyeOff /> : <LuEye />}
                                        </Button>
                                    </Box>
                                </FormField>

                                <Flex align="center" justify="space-between" gap={3} wrap="wrap">
                                    <CheckboxField checked={remember} onChange={setRemember} disabled={loading}>
                                        Remember this device
                                    </CheckboxField>
                                    <Button
                                        type="button"
                                        variant="plain"
                                        onClick={handleForgotPassword}
                                        h="auto"
                                        p={0}
                                        minW={0}
                                        fontSize="sm"
                                        fontWeight={500}
                                        color="primary.600"
                                        focusRingColor="primary.500"
                                        _hover={{ color: "primary.700", textDecoration: "underline" }}
                                    >
                                        Forgot password?
                                    </Button>
                                </Flex>

                                <Button type="submit" size="lg" {...primaryButton} loading={loading} loadingText="Signing in">
                                    Log in
                                </Button>
                            </VStack>
                        </TrackedForm>
                    )}
                </Panel>

                <Flex justify="center" mt={6}>
                    <Box
                        asChild
                        display="inline-flex"
                        alignItems="center"
                        gap={1.5}
                        fontSize="sm"
                        fontWeight={500}
                        color="text.secondary"
                        rounded="md"
                        transition="color 0.15s ease-out"
                        _hover={{ color: "text.primary" }}
                    >
                        <Link href="/">
                            <LuArrowLeft aria-hidden />
                            Back to portfolio
                        </Link>
                    </Box>
                </Flex>
            </Box>
        </Flex>
    );
}

"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input, SimpleGrid, Text, Textarea } from "@chakra-ui/react";
import toast from "react-hot-toast";
import FileUploadInput from "./FileUploadInput";
import { CheckboxField, FormActions, FormField, FormShell, controlProps, focusFirstInvalid } from "./AdminUI";
import { hasErrors, integerError, maxLengthError, splitLines, splitList, submitFailure, urlError, type FieldErrors } from "./forms";
import { useMountedRef } from "./hooks";
import { api, mediaUrl, type WorkExperience } from "@/lib/api";

const FIELDS = [
    "position",
    "company",
    "location",
    "start_date",
    "end_date",
    "description",
    "responsibilities",
    "technologies",
    "company_website",
    "company_logo_url",
    "order",
] as const;
const BACK = { href: "/admin/experience", label: "Back to experience" };

export default function ExperienceForm({ initial }: { initial?: WorkExperience | null }) {
    const router = useRouter();
    const mounted = useMountedRef();
    const formRef = useRef<HTMLFormElement>(null);
    const lock = useRef(false);
    const isEdit = !!initial;

    const [position, setPosition] = useState(initial?.position ?? "");
    const [company, setCompany] = useState(initial?.company ?? "");
    const [location, setLocation] = useState(initial?.location ?? "");
    const [startDate, setStartDate] = useState(initial?.start_date ?? "");
    const [endDate, setEndDate] = useState(initial?.end_date ?? "");
    const [isCurrent, setIsCurrent] = useState(initial?.is_current ?? false);
    const [description, setDescription] = useState(initial?.description ?? "");
    const [responsibilities, setResponsibilities] = useState((initial?.responsibilities ?? []).join("\n"));
    const [technologies, setTechnologies] = useState((initial?.technologies ?? []).join(", "));
    const [companyWebsite, setCompanyWebsite] = useState(initial?.company_website ?? "");
    const [companyLogo, setCompanyLogo] = useState<string | null>(initial?.company_logo_url ?? null);
    const [order, setOrder] = useState(String(initial?.order ?? 0));
    const [errors, setErrors] = useState<FieldErrors>({});
    const [banner, setBanner] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const validate = (): FieldErrors => ({
        position: !position.trim() ? "Position is required" : maxLengthError(position, 100),
        company: !company.trim() ? "Company is required" : maxLengthError(company, 100),
        location: maxLengthError(location, 100),
        start_date: !startDate ? "Start date is required" : undefined,
        end_date: !isCurrent && startDate && endDate && endDate < startDate ? "End date must be after the start date" : undefined,
        description: maxLengthError(description, 2000),
        company_website: urlError(companyWebsite),
        order: integerError(order),
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (lock.current || uploading) return;
        const found = validate();
        setErrors(found);
        setBanner(null);
        if (hasErrors(found)) {
            focusFirstInvalid(formRef.current);
            return;
        }
        lock.current = true;
        setSaving(true);

        const payload: Record<string, unknown> = {
            position: position.trim(),
            company: company.trim(),
            location: location.trim() || null,
            start_date: startDate,
            end_date: isCurrent ? null : endDate || null,
            is_current: isCurrent,
            description: description.trim() || null,
            responsibilities: splitLines(responsibilities),
            technologies: splitList(technologies),
            // HttpUrl fields: null when empty; the uploaded logo path is made absolute.
            company_website: companyWebsite.trim() || null,
            company_logo_url: companyLogo ? mediaUrl(companyLogo) : null,
            order: Number(order.trim() || 0),
        };

        try {
            if (isEdit && initial) {
                await api.put<WorkExperience>(`/work-experience/${initial.id}`, payload);
                toast.success("Experience saved");
            } else {
                await api.post<WorkExperience>("/work-experience/", payload);
                toast.success("Experience created");
            }
            if (mounted.current) router.push("/admin/experience");
        } catch (err) {
            const { fields, banner: message } = submitFailure(err, FIELDS, "Couldn't save the experience.");
            setErrors(fields);
            setBanner(message);
            lock.current = false;
            setSaving(false);
            focusFirstInvalid(formRef.current);
        }
    };

    return (
        <FormShell title={isEdit ? "Edit experience" : "New experience"} back={BACK} formRef={formRef} onSubmit={handleSubmit} banner={banner}>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                <FormField label="Position" required error={errors.position}>
                    <Input {...controlProps} value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Senior software engineer" />
                </FormField>
                <FormField label="Company" required error={errors.company}>
                    <Input {...controlProps} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Tech Corp Inc." />
                </FormField>
            </SimpleGrid>

            <FormField label="Location" helper="City, country or “Remote”." error={errors.location}>
                <Input {...controlProps} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Nairobi, Kenya" />
            </FormField>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                <FormField label="Start date" required error={errors.start_date}>
                    <Input {...controlProps} type="date" value={startDate ?? ""} onChange={(e) => setStartDate(e.target.value)} />
                </FormField>
                <FormField label="End date" helper={isCurrent ? "Not used while you work here." : undefined} error={errors.end_date} disabled={isCurrent}>
                    <Input {...controlProps} type="date" value={isCurrent ? "" : (endDate ?? "")} onChange={(e) => setEndDate(e.target.value)} />
                </FormField>
            </SimpleGrid>

            <CheckboxField checked={isCurrent} onChange={setIsCurrent}>
                I currently work here (no end date)
            </CheckboxField>

            <FormField label="Description" helper="Up to 2,000 characters." error={errors.description}>
                <Textarea {...controlProps} value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Summarise the role, scope, and impact" />
            </FormField>

            <FormField label="Responsibilities and achievements" helper="One per line." error={errors.responsibilities}>
                <Textarea
                    {...controlProps}
                    value={responsibilities}
                    onChange={(e) => setResponsibilities(e.target.value)}
                    rows={5}
                    placeholder={"Led a team of 5 engineers\nArchitected the payments platform\nReduced build times by 40%"}
                />
            </FormField>

            <FormField label="Technologies" helper="Comma-separated." error={errors.technologies}>
                <Input {...controlProps} value={technologies} onChange={(e) => setTechnologies(e.target.value)} placeholder="Python, FastAPI, React, AWS" />
            </FormField>

            <FormField label="Company website" helper="Full URL, including https://" error={errors.company_website}>
                <Input {...controlProps} type="url" inputMode="url" value={companyWebsite} onChange={(e) => setCompanyWebsite(e.target.value)} placeholder="https://techcorp.example.com" />
            </FormField>

            <FileUploadInput
                kind="image"
                label="Company logo (optional)"
                value={companyLogo}
                onChange={setCompanyLogo}
                helperText="Shown beside the role on the public experience timeline."
                error={errors.company_logo_url}
                onUploadingChange={setUploading}
            />

            <FormField label="Display order" helper="Lower numbers appear first." error={errors.order}>
                <Input {...controlProps} type="number" inputMode="numeric" min={0} step={1} value={order} onChange={(e) => setOrder(e.target.value)} w="32" />
            </FormField>

            <Text fontSize="sm" color="text.secondary">
                New entries are public by default. Use the visibility and feature toggles on the experience list to control where they appear.
            </Text>

            <FormActions
                submitting={saving}
                submitLabel={isEdit ? "Save changes" : "Create experience"}
                cancelHref={BACK.href}
                disabled={uploading}
                note={uploading ? "Waiting for the upload to finish" : undefined}
            />
        </FormShell>
    );
}

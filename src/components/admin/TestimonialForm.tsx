"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Input, SimpleGrid, Text, Textarea } from "@chakra-ui/react";
import toast from "react-hot-toast";
import FileUploadInput from "./FileUploadInput";
import { CheckboxField, FormActions, FormField, FormShell, SelectField, controlProps, focusFirstInvalid } from "./AdminUI";
import { emailError, hasErrors, integerError, maxLengthError, submitFailure, type FieldErrors } from "./forms";
import { useMountedRef } from "./hooks";
import { api, mediaUrl, type Testimonial } from "@/lib/api";
import { useTestimonialBadge } from "@/store/testimonialBadge";

const RATINGS = [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} ${n === 1 ? "star" : "stars"}` }));

const FIELDS = [
    "client_name",
    "client_email",
    "client_company",
    "client_position",
    "client_photo_url",
    "rating",
    "content",
    "order",
] as const;
const BACK = { href: "/admin/testimonials", label: "Back to testimonials" };

export default function TestimonialForm({ initial }: { initial?: Testimonial | null }) {
    const router = useRouter();
    const mounted = useMountedRef();
    const formRef = useRef<HTMLFormElement>(null);
    const lock = useRef(false);
    const isEdit = !!initial;

    const [clientName, setClientName] = useState(initial?.client_name ?? "");
    const [clientEmail, setClientEmail] = useState(initial?.client_email ?? "");
    const [clientCompany, setClientCompany] = useState(initial?.client_company ?? "");
    const [clientPosition, setClientPosition] = useState(initial?.client_position ?? "");
    const [rating, setRating] = useState(String(initial?.rating ?? 5));
    const [content, setContent] = useState(initial?.content ?? "");
    const [photo, setPhoto] = useState<string | null>(initial?.client_photo_url ?? null);
    const [isFeatured, setIsFeatured] = useState(initial?.is_featured ?? false);
    const [order, setOrder] = useState(String(initial?.order ?? 0));
    const [errors, setErrors] = useState<FieldErrors>({});
    const [banner, setBanner] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const validate = (): FieldErrors => {
        const len = content.trim().length;
        return {
            client_name: !clientName.trim() ? "Client name is required" : maxLengthError(clientName, 100),
            client_email: emailError(clientEmail),
            client_company: maxLengthError(clientCompany, 100),
            client_position: maxLengthError(clientPosition, 100),
            content: len < 10 ? `Write at least 10 characters (now ${len})` : maxLengthError(content, 2000),
            order: integerError(order),
        };
    };

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
            client_name: clientName.trim(),
            // Optional EmailStr / HttpUrl fields: null when empty; uploaded photo made absolute.
            client_email: clientEmail.trim() || null,
            client_company: clientCompany.trim() || null,
            client_position: clientPosition.trim() || null,
            client_photo_url: photo ? mediaUrl(photo) : null,
            rating: Number(rating),
            content: content.trim(),
            is_featured: isFeatured,
            order: Number(order.trim() || 0),
            // `status` is left out on purpose: approve/reject happens on the list.
        };

        try {
            if (isEdit && initial) {
                await api.put<Testimonial>(`/testimonials/${initial.id}`, payload);
                toast.success("Testimonial saved");
            } else {
                await api.post<Testimonial>("/testimonials/", payload);
                toast.success("Testimonial created");
                // A new testimonial starts as pending: update the sidebar count.
                void useTestimonialBadge.getState().refresh();
            }
            if (mounted.current) router.push("/admin/testimonials");
        } catch (err) {
            const { fields, banner: message } = submitFailure(err, FIELDS, "Couldn't save the testimonial.");
            setErrors(fields);
            setBanner(message);
            lock.current = false;
            setSaving(false);
            focusFirstInvalid(formRef.current);
        }
    };

    return (
        <FormShell title={isEdit ? "Edit testimonial" : "New testimonial"} back={BACK} formRef={formRef} onSubmit={handleSubmit} banner={banner}>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                <FormField label="Client name" required error={errors.client_name}>
                    <Input {...controlProps} value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Sarah Johnson" />
                </FormField>
                <FormField label="Client email" helper="Optional." error={errors.client_email}>
                    <Input {...controlProps} type="email" inputMode="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="sarah@example.com" />
                </FormField>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                <FormField label="Company" helper="Optional." error={errors.client_company}>
                    <Input {...controlProps} value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} placeholder="Tech Startup Inc." />
                </FormField>
                <FormField label="Position" helper="Optional." error={errors.client_position}>
                    <Input {...controlProps} value={clientPosition} onChange={(e) => setClientPosition(e.target.value)} placeholder="Product manager" />
                </FormField>
            </SimpleGrid>

            <FormField label="Rating" error={errors.rating}>
                <SelectField value={rating} onChange={setRating} options={RATINGS} w="40" />
            </FormField>

            <FormField label="Testimonial" required helper="10 to 2,000 characters." error={errors.content}>
                <Textarea {...controlProps} value={content} onChange={(e) => setContent(e.target.value)} rows={5} placeholder="What did the client say about working with you?" />
            </FormField>

            <FileUploadInput
                kind="image"
                label="Client photo (optional)"
                value={photo}
                onChange={setPhoto}
                helperText="A headshot shown next to the testimonial on the public site."
                error={errors.client_photo_url}
                onUploadingChange={setUploading}
            />

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} alignItems="end">
                <FormField label="Display order" helper="Lower numbers appear first." error={errors.order}>
                    <Input {...controlProps} type="number" inputMode="numeric" min={0} step={1} value={order} onChange={(e) => setOrder(e.target.value)} w="32" />
                </FormField>
                <Box pb={2}>
                    <CheckboxField checked={isFeatured} onChange={setIsFeatured}>
                        Featured
                    </CheckboxField>
                </Box>
            </SimpleGrid>

            {!isEdit ? (
                <Text fontSize="sm" color="text.secondary">
                    New testimonials start as pending. Approve or reject them from the testimonials list.
                </Text>
            ) : null}

            <FormActions
                submitting={saving}
                submitLabel={isEdit ? "Save changes" : "Create testimonial"}
                cancelHref={BACK.href}
                disabled={uploading}
                note={uploading ? "Waiting for the upload to finish" : undefined}
            />
        </FormShell>
    );
}

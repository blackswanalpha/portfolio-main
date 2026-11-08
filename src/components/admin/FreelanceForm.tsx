"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input, SimpleGrid, Textarea } from "@chakra-ui/react";
import toast from "react-hot-toast";
import { CheckboxField, FormActions, FormField, FormShell, SelectField, controlProps, focusFirstInvalid } from "./AdminUI";
import { hasErrors, integerError, maxLengthError, slugify, splitList, submitFailure, urlError, type FieldErrors } from "./forms";
import { useMountedRef } from "./hooks";
import { api, type FreelanceStatus, type FreelanceWork, type PricingType } from "@/lib/api";

export const PRICING_TYPES: { value: PricingType; label: string }[] = [
    { value: "hourly", label: "Hourly" },
    { value: "fixed", label: "Fixed" },
    { value: "monthly", label: "Monthly" },
    { value: "project_based", label: "Project-based" },
];

export const FREELANCE_STATUSES: { value: FreelanceStatus; label: string }[] = [
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "discontinued", label: "Discontinued" },
];

const FIELDS = [
    "title",
    "slug",
    "short_description",
    "description",
    "pricing_type",
    "base_price",
    "currency",
    "technologies",
    "skills",
    "deliverables",
    "status",
    "thumbnail_url",
    "portfolio_url",
    "order",
    "estimated_delivery_days",
    "revisions_included",
] as const;
const BACK = { href: "/admin/freelance", label: "Back to freelance" };

/**
 * Create/edit a freelance service. Every field the backend persists is sent
 * and read back, including slug, skills, portfolio_url,
 * estimated_delivery_days and revisions_included.
 */
export default function FreelanceForm({ initial }: { initial?: FreelanceWork | null }) {
    const router = useRouter();
    const mounted = useMountedRef();
    const formRef = useRef<HTMLFormElement>(null);
    const lock = useRef(false);
    const isEdit = !!initial;

    const [title, setTitle] = useState(initial?.title ?? "");
    const [slug, setSlug] = useState(initial?.slug ?? "");
    const [shortDescription, setShortDescription] = useState(initial?.short_description ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [pricingType, setPricingType] = useState<PricingType>(initial?.pricing_type ?? "hourly");
    const [basePrice, setBasePrice] = useState(initial ? String(initial.base_price) : "");
    const [currency, setCurrency] = useState(initial?.currency ?? "USD");
    const [technologies, setTechnologies] = useState((initial?.technologies ?? []).join(", "));
    const [skills, setSkills] = useState((initial?.skills ?? []).join(", "));
    const [deliverables, setDeliverables] = useState((initial?.deliverables ?? []).join(", "));
    const [status, setStatus] = useState<FreelanceStatus>(initial?.status ?? "active");
    const [featured, setFeatured] = useState(initial?.featured ?? false);
    const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnail_url ?? "");
    const [portfolioUrl, setPortfolioUrl] = useState(initial?.portfolio_url ?? "");
    const [order, setOrder] = useState(String(initial?.order ?? 0));
    const [deliveryDays, setDeliveryDays] = useState(initial?.estimated_delivery_days != null ? String(initial.estimated_delivery_days) : "");
    const [revisions, setRevisions] = useState(String(initial?.revisions_included ?? 2));
    const [errors, setErrors] = useState<FieldErrors>({});
    const [banner, setBanner] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const validate = (): FieldErrors => {
        const price = Number(basePrice);
        const effectiveSlug = slug.trim() || slugify(title);
        return {
            title: !title.trim() ? "Title is required" : maxLengthError(title, 200),
            slug: title.trim() && !effectiveSlug ? "Add a slug using letters or numbers" : maxLengthError(slug, 200),
            short_description: maxLengthError(shortDescription, 300),
            description: maxLengthError(description, 5000),
            base_price: basePrice.trim() === "" ? "Base price is required" : Number.isNaN(price) || price < 0 ? "Use a number of 0 or more" : undefined,
            currency: /^[A-Za-z]{3}$/.test(currency.trim()) ? undefined : "Use a 3-letter code, e.g. USD",
            thumbnail_url: urlError(thumbnailUrl),
            portfolio_url: urlError(portfolioUrl),
            order: integerError(order),
            estimated_delivery_days: integerError(deliveryDays, { min: 1 }),
            revisions_included: integerError(revisions, { required: true }),
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (lock.current) return;
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
            title: title.trim(),
            slug: slug.trim() || slugify(title),
            short_description: shortDescription.trim() || null,
            description: description.trim() || null,
            pricing_type: pricingType,
            base_price: Number(basePrice),
            currency: currency.trim().toUpperCase(),
            technologies: splitList(technologies),
            skills: splitList(skills),
            deliverables: splitList(deliverables),
            status,
            featured,
            // HttpUrl fields: null when empty.
            thumbnail_url: thumbnailUrl.trim() || null,
            portfolio_url: portfolioUrl.trim() || null,
            order: Number(order.trim() || 0),
            estimated_delivery_days: deliveryDays.trim() ? Number(deliveryDays) : null,
            revisions_included: Number(revisions),
        };

        try {
            if (isEdit && initial) {
                await api.put<FreelanceWork>(`/freelance/${initial.id}`, payload);
                toast.success("Service saved");
            } else {
                await api.post<FreelanceWork>("/freelance/", payload);
                toast.success("Service created");
            }
            if (mounted.current) router.push("/admin/freelance");
        } catch (err) {
            const { fields, banner: message } = submitFailure(err, FIELDS, "Couldn't save the service.");
            setErrors(fields);
            setBanner(message);
            lock.current = false;
            setSaving(false);
            focusFirstInvalid(formRef.current);
        }
    };

    return (
        <FormShell
            title={isEdit ? "Edit freelance service" : "New freelance service"}
            back={BACK}
            formRef={formRef}
            onSubmit={handleSubmit}
            banner={banner}
        >
            <FormField label="Title" required error={errors.title}>
                <Input {...controlProps} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Full-stack web development" />
            </FormField>

            <FormField label="Slug" helper="Leave blank to generate it from the title." error={errors.slug}>
                <Input {...controlProps} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="fullstack-web-development" />
            </FormField>

            <FormField label="Short description" helper="Up to 300 characters." error={errors.short_description}>
                <Input {...controlProps} value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="End-to-end web application development" />
            </FormField>

            <FormField label="Description" error={errors.description}>
                <Textarea {...controlProps} value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe the service offering" />
            </FormField>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
                <FormField label="Pricing type" error={errors.pricing_type}>
                    <SelectField value={pricingType} onChange={(v) => setPricingType(v as PricingType)} options={PRICING_TYPES} />
                </FormField>
                <FormField label="Base price" required error={errors.base_price}>
                    <Input {...controlProps} type="number" inputMode="decimal" min={0} step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="75" />
                </FormField>
                <FormField label="Currency" helper="ISO code, e.g. USD." error={errors.currency}>
                    <Input {...controlProps} value={currency} onChange={(e) => setCurrency(e.target.value)} maxLength={3} placeholder="USD" textTransform="uppercase" />
                </FormField>
            </SimpleGrid>

            <FormField label="Technologies" helper="Comma-separated." error={errors.technologies}>
                <Input {...controlProps} value={technologies} onChange={(e) => setTechnologies(e.target.value)} placeholder="React, FastAPI, PostgreSQL" />
            </FormField>

            <FormField label="Skills" helper="Comma-separated." error={errors.skills}>
                <Input {...controlProps} value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Frontend development, API design" />
            </FormField>

            <FormField label="Deliverables" helper="Comma-separated." error={errors.deliverables}>
                <Input {...controlProps} value={deliverables} onChange={(e) => setDeliverables(e.target.value)} placeholder="Source code, Documentation, 30 days support" />
            </FormField>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                <FormField label="Thumbnail URL" helper="Full URL, including https://" error={errors.thumbnail_url}>
                    <Input {...controlProps} type="url" inputMode="url" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://cdn.example.com/service.png" />
                </FormField>
                <FormField label="Portfolio URL" helper="Full URL, including https://" error={errors.portfolio_url}>
                    <Input {...controlProps} type="url" inputMode="url" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://example.com/portfolio" />
                </FormField>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
                <FormField label="Status" error={errors.status}>
                    <SelectField value={status} onChange={(v) => setStatus(v as FreelanceStatus)} options={FREELANCE_STATUSES} />
                </FormField>
                <FormField label="Est. delivery (days)" helper="Leave blank if it varies." error={errors.estimated_delivery_days}>
                    <Input {...controlProps} type="number" inputMode="numeric" min={1} step={1} value={deliveryDays} onChange={(e) => setDeliveryDays(e.target.value)} placeholder="14" />
                </FormField>
                <FormField label="Revisions included" required error={errors.revisions_included}>
                    <Input {...controlProps} type="number" inputMode="numeric" min={0} step={1} value={revisions} onChange={(e) => setRevisions(e.target.value)} placeholder="2" />
                </FormField>
            </SimpleGrid>

            <FormField label="Display order" helper="Lower numbers appear first." error={errors.order}>
                <Input {...controlProps} type="number" inputMode="numeric" min={0} step={1} value={order} onChange={(e) => setOrder(e.target.value)} w="32" />
            </FormField>

            <CheckboxField checked={featured} onChange={setFeatured}>
                Featured service
            </CheckboxField>

            <FormActions submitting={saving} submitLabel={isEdit ? "Save changes" : "Create service"} cancelHref={BACK.href} />
        </FormShell>
    );
}

"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Flex, Input, SimpleGrid, Textarea } from "@chakra-ui/react";
import toast from "react-hot-toast";
import FileUploadInput from "./FileUploadInput";
import { CheckboxField, FormActions, FormField, FormShell, SelectField, controlProps, focusFirstInvalid } from "./AdminUI";
import {
    hasErrors,
    integerError,
    maxLengthError,
    slugify,
    splitList,
    submitFailure,
    urlError,
    type FieldErrors,
} from "./forms";
import { useMountedRef } from "./hooks";
import { api, mediaUrl, type Project, type ProjectCategory } from "@/lib/api";

export const PROJECT_CATEGORIES: { value: ProjectCategory; label: string }[] = [
    { value: "web_app", label: "Web app" },
    { value: "mobile_app", label: "Mobile app" },
    { value: "desktop_app", label: "Desktop app" },
    { value: "api", label: "API" },
    { value: "library", label: "Library" },
    { value: "tool", label: "Tool" },
    { value: "other", label: "Other" },
];

const FIELDS = [
    "title",
    "slug",
    "short_description",
    "description",
    "category",
    "technologies",
    "tags",
    "start_date",
    "end_date",
    "demo_url",
    "source_code_url",
    "thumbnail_url",
    "order",
] as const;

const BACK = { href: "/admin/projects", label: "Back to projects" };

export default function ProjectForm({ initial }: { initial?: Project | null }) {
    const router = useRouter();
    const mounted = useMountedRef();
    const formRef = useRef<HTMLFormElement>(null);
    const lock = useRef(false);
    const isEdit = !!initial;

    const [title, setTitle] = useState(initial?.title ?? "");
    const [slug, setSlug] = useState(initial?.slug ?? "");
    const [shortDescription, setShortDescription] = useState(initial?.short_description ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [category, setCategory] = useState<ProjectCategory>(initial?.category ?? "web_app");
    const [technologies, setTechnologies] = useState((initial?.technologies ?? []).join(", "));
    const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
    const [startDate, setStartDate] = useState(initial?.start_date ?? "");
    const [endDate, setEndDate] = useState(initial?.end_date ?? "");
    const [isOngoing, setIsOngoing] = useState(initial?.is_ongoing ?? false);
    const [demoUrl, setDemoUrl] = useState(initial?.demo_url ?? "");
    const [sourceCodeUrl, setSourceCodeUrl] = useState(initial?.source_code_url ?? "");
    const [thumbnail, setThumbnail] = useState<string | null>(initial?.thumbnail_url ?? null);
    const [order, setOrder] = useState(String(initial?.order ?? 0));
    const [isPublished, setIsPublished] = useState((initial?.status ?? "draft") === "published");
    const [featured, setFeatured] = useState(initial?.featured ?? false);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [banner, setBanner] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const validate = (): FieldErrors => {
        const effectiveSlug = slug.trim() || slugify(title);
        return {
            title: !title.trim() ? "Title is required" : maxLengthError(title, 200),
            slug: title.trim() && !effectiveSlug ? "Add a slug using letters or numbers" : maxLengthError(slug, 200),
            short_description: maxLengthError(shortDescription, 300),
            description: maxLengthError(description, 5000),
            demo_url: urlError(demoUrl),
            source_code_url: urlError(sourceCodeUrl),
            end_date: !isOngoing && startDate && endDate && endDate < startDate ? "End date must be after the start date" : undefined,
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
            title: title.trim(),
            slug: slug.trim() || slugify(title),
            short_description: shortDescription.trim() || null,
            description: description.trim() || null,
            technologies: splitList(technologies),
            category,
            // Always send both: the backend's status=published branch resets
            // featured, and the later `featured` value wins.
            status: isPublished ? "published" : "draft",
            featured,
            start_date: startDate || null,
            end_date: isOngoing ? null : endDate || null,
            is_ongoing: isOngoing,
            // HttpUrl fields: null when empty; uploaded (relative) paths are made absolute.
            demo_url: demoUrl.trim() || null,
            source_code_url: sourceCodeUrl.trim() || null,
            thumbnail_url: thumbnail ? mediaUrl(thumbnail) : null,
            order: Number(order.trim() || 0),
            tags: splitList(tags),
        };

        try {
            if (isEdit && initial) {
                await api.put<Project>(`/projects/${initial.id}`, payload);
                toast.success("Project saved");
            } else {
                await api.post<Project>("/projects/", payload);
                toast.success("Project created");
            }
            // Stay locked until the route changes so a second click can't resubmit.
            if (mounted.current) router.push("/admin/projects");
        } catch (err) {
            const { fields, banner: message } = submitFailure(err, FIELDS, "Couldn't save the project.");
            setErrors(fields);
            setBanner(message);
            lock.current = false;
            setSaving(false);
            focusFirstInvalid(formRef.current);
        }
    };

    return (
        <FormShell title={isEdit ? "Edit project" : "New project"} back={BACK} formRef={formRef} onSubmit={handleSubmit} banner={banner}>
            <FormField label="Title" required error={errors.title}>
                <Input {...controlProps} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E-commerce platform" />
            </FormField>

            <FormField label="Slug" helper="Leave blank to generate it from the title." error={errors.slug}>
                <Input {...controlProps} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="ecommerce-platform" />
            </FormField>

            <FormField label="Category" error={errors.category}>
                <SelectField value={category} onChange={(v) => setCategory(v as ProjectCategory)} options={PROJECT_CATEGORIES} />
            </FormField>

            <FormField label="Short description" helper="One-line summary shown on project cards. Up to 300 characters." error={errors.short_description}>
                <Input {...controlProps} value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="A full-stack e-commerce solution with payments" />
            </FormField>

            <FormField label="Description" error={errors.description}>
                <Textarea {...controlProps} value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Describe the project, your role, and the outcome" />
            </FormField>

            <FileUploadInput
                kind="image"
                label="Thumbnail (optional)"
                value={thumbnail}
                onChange={setThumbnail}
                helperText="Shown as the cover image on the public projects grid."
                error={errors.thumbnail_url}
                onUploadingChange={setUploading}
            />

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                <FormField label="Demo URL" helper="Full URL, including https://" error={errors.demo_url}>
                    <Input {...controlProps} type="url" inputMode="url" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} placeholder="https://demo.example.com" />
                </FormField>
                <FormField label="Source code URL" helper="Full URL, including https://" error={errors.source_code_url}>
                    <Input {...controlProps} type="url" inputMode="url" value={sourceCodeUrl} onChange={(e) => setSourceCodeUrl(e.target.value)} placeholder="https://github.com/you/project" />
                </FormField>
            </SimpleGrid>

            <FormField label="Technologies" helper="Comma-separated." error={errors.technologies}>
                <Input {...controlProps} value={technologies} onChange={(e) => setTechnologies(e.target.value)} placeholder="React, FastAPI, PostgreSQL" />
            </FormField>

            <FormField label="Tags" helper="Comma-separated." error={errors.tags}>
                <Input {...controlProps} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e-commerce, payments" />
            </FormField>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                <FormField label="Start date" error={errors.start_date}>
                    <Input {...controlProps} type="date" value={startDate ?? ""} onChange={(e) => setStartDate(e.target.value)} />
                </FormField>
                <FormField label="End date" helper={isOngoing ? "Not used for ongoing projects." : undefined} error={errors.end_date} disabled={isOngoing}>
                    <Input {...controlProps} type="date" value={isOngoing ? "" : (endDate ?? "")} onChange={(e) => setEndDate(e.target.value)} />
                </FormField>
            </SimpleGrid>

            <CheckboxField checked={isOngoing} onChange={setIsOngoing}>
                Ongoing project (no end date)
            </CheckboxField>

            <FormField label="Display order" helper="Lower numbers appear first." error={errors.order}>
                <Input {...controlProps} type="number" inputMode="numeric" min={0} step={1} value={order} onChange={(e) => setOrder(e.target.value)} w="32" />
            </FormField>

            <Flex gap={8} wrap="wrap">
                <CheckboxField checked={isPublished} onChange={setIsPublished}>
                    Published (visible on the public site)
                </CheckboxField>
                <CheckboxField checked={featured} onChange={setFeatured}>
                    Featured
                </CheckboxField>
            </Flex>

            <FormActions
                submitting={saving}
                submitLabel={isEdit ? "Save changes" : "Create project"}
                cancelHref={BACK.href}
                disabled={uploading}
                note={uploading ? "Waiting for the upload to finish" : undefined}
            />
        </FormShell>
    );
}

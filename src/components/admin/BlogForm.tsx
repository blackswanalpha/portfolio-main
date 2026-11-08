"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Field, Flex, Input, Text, Textarea } from "@chakra-ui/react";
import toast from "react-hot-toast";
import FileUploadInput from "./FileUploadInput";
import Markdown from "@/components/Markdown";
import { CheckboxField, FilterTabs, FormActions, FormField, FormShell, controlProps, focusFirstInvalid } from "./AdminUI";
import { hasErrors, maxLengthError, slugify, splitList, submitFailure, type FieldErrors } from "./forms";
import { useMountedRef } from "./hooks";
import { api, type BlogPost } from "@/lib/api";

const FIELDS = ["title", "slug", "excerpt", "content", "cover_image", "tags"] as const;
const BACK = { href: "/admin/blog", label: "Back to blog" };
const MODES = [
    { value: "write", label: "Write" },
    { value: "preview", label: "Preview" },
] as const;

export default function BlogForm({ initial }: { initial?: BlogPost | null }) {
    const router = useRouter();
    const mounted = useMountedRef();
    const formRef = useRef<HTMLFormElement>(null);
    const lock = useRef(false);
    const isEdit = !!initial;

    const [title, setTitle] = useState(initial?.title ?? "");
    const [slug, setSlug] = useState(initial?.slug ?? "");
    const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
    const [coverImage, setCoverImage] = useState<string | null>(initial?.cover_image ?? null);
    const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
    const [content, setContent] = useState(initial?.content ?? "");
    const [isPublished, setIsPublished] = useState(initial?.is_published ?? false);
    const [mode, setMode] = useState<"write" | "preview">("write");
    const [errors, setErrors] = useState<FieldErrors>({});
    const [banner, setBanner] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const validate = (): FieldErrors => ({
        title: !title.trim() ? "Title is required" : maxLengthError(title, 200),
        slug: slug.trim() && !slugify(slug) ? "Use letters, numbers and dashes" : maxLengthError(slug, 200),
        excerpt: maxLengthError(excerpt, 500),
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (lock.current || uploading) return;
        const found = validate();
        setErrors(found);
        setBanner(null);
        if (hasErrors(found)) {
            setMode("write");
            focusFirstInvalid(formRef.current);
            return;
        }
        lock.current = true;
        setSaving(true);

        const payload: Record<string, unknown> = {
            title: title.trim(),
            excerpt: excerpt.trim() || null,
            content,
            // Plain string field: a relative upload path is fine here.
            cover_image: coverImage || null,
            tags: splitList(tags),
            is_published: isPublished,
        };
        if (slug.trim()) payload.slug = slug.trim();

        try {
            if (isEdit && initial) {
                await api.put<BlogPost>(`/blog/${initial.id}`, payload);
                toast.success("Article saved");
            } else {
                await api.post<BlogPost>("/blog/", payload);
                toast.success("Article created");
            }
            if (mounted.current) router.push("/admin/blog");
        } catch (err) {
            const { fields, banner: message } = submitFailure(err, FIELDS, "Couldn't save the article.");
            setErrors(fields);
            setBanner(message);
            if (fields.content) setMode("write");
            lock.current = false;
            setSaving(false);
            focusFirstInvalid(formRef.current);
        }
    };

    return (
        <FormShell title={isEdit ? "Edit article" : "New article"} back={BACK} formRef={formRef} onSubmit={handleSubmit} banner={banner}>
            <FormField label="Title" required error={errors.title}>
                <Input {...controlProps} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My article title" />
            </FormField>

            <FormField label="Slug" helper="Leave blank to generate it from the title." error={errors.slug}>
                <Input {...controlProps} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="my-article-title" />
            </FormField>

            <FormField label="Excerpt" helper="Short summary shown on the blog listing. Up to 500 characters." error={errors.excerpt}>
                <Textarea {...controlProps} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} placeholder="A one or two sentence teaser" />
            </FormField>

            <FileUploadInput
                kind="image"
                label="Cover image"
                value={coverImage}
                onChange={setCoverImage}
                error={errors.cover_image}
                onUploadingChange={setUploading}
            />

            <FormField label="Tags" helper="Comma-separated, e.g. ai, design, workflow." error={errors.tags}>
                <Input {...controlProps} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="ai, design" />
            </FormField>

            <Field.Root invalid={!!errors.content} gap={1.5}>
                <Flex justify="space-between" align="center" w="full" gap={3}>
                    <Field.Label textStyle="label" color="text.secondary">
                        Content (Markdown)
                    </Field.Label>
                    <FilterTabs label="Editor view" options={[...MODES]} value={mode} onChange={setMode} mb={0} />
                </Flex>
                {mode === "preview" ? (
                    <Box border="1px solid" borderColor="gray.300" rounded="lg" p={5} minH="320px" bg="surface" w="full">
                        {content.trim() ? <Markdown>{content}</Markdown> : <Text color="text.secondary">Nothing to preview yet.</Text>}
                    </Box>
                ) : (
                    <Textarea
                        {...controlProps}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={16}
                        fontFamily="mono"
                        fontSize="sm"
                        placeholder={"# Heading\n\nWrite your article in **markdown**"}
                    />
                )}
                {errors.content ? (
                    <Field.ErrorText fontSize="sm" color="red.700">
                        {errors.content}
                    </Field.ErrorText>
                ) : null}
            </Field.Root>

            <CheckboxField checked={isPublished} onChange={setIsPublished}>
                Published (visible on the public blog)
            </CheckboxField>

            <FormActions
                submitting={saving}
                submitLabel={isEdit ? "Save changes" : "Create article"}
                cancelHref={BACK.href}
                disabled={uploading}
                note={uploading ? "Waiting for the upload to finish" : undefined}
            />
        </FormShell>
    );
}

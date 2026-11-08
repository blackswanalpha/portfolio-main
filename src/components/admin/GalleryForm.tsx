"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@chakra-ui/react";
import toast from "react-hot-toast";
import FileUploadInput from "./FileUploadInput";
import { CheckboxField, FormActions, FormField, FormShell, SelectField, controlProps, focusFirstInvalid } from "./AdminUI";
import { hasErrors, maxLengthError, slugify, splitList, submitFailure, type FieldErrors } from "./forms";
import { useMountedRef } from "./hooks";
import { api, type GalleryItem, type GalleryMediaType } from "@/lib/api";

const MEDIA_TYPES: { value: GalleryMediaType; label: string }[] = [
    { value: "image", label: "Art (image)" },
    { value: "video", label: "Video" },
    { value: "audio", label: "Music (audio)" },
];

const KIND_NOUN: Record<GalleryMediaType, string> = { image: "an image", video: "a video", audio: "an audio file" };

const EXT_KIND: Record<string, GalleryMediaType> = {
    jpg: "image",
    jpeg: "image",
    png: "image",
    gif: "image",
    webp: "image",
    mp4: "video",
    webm: "video",
    mov: "video",
    mkv: "video",
    mp3: "audio",
    wav: "audio",
    ogg: "audio",
    m4a: "audio",
    aac: "audio",
    flac: "audio",
};

/** Media kind from a stored URL's extension, when it can be told. */
function kindOf(url: string | null): GalleryMediaType | null {
    if (!url) return null;
    const ext = url.split(/[?#]/)[0].split(".").pop()?.toLowerCase();
    return ext ? (EXT_KIND[ext] ?? null) : null;
}

const FIELDS = ["title", "slug", "description", "media_type", "media_url", "thumbnail_url", "category", "tags"] as const;
const BACK = { href: "/admin/gallery", label: "Back to gallery" };

export default function GalleryForm({ initial }: { initial?: GalleryItem | null }) {
    const router = useRouter();
    const mounted = useMountedRef();
    const formRef = useRef<HTMLFormElement>(null);
    const lock = useRef(false);
    const isEdit = !!initial;

    const [title, setTitle] = useState(initial?.title ?? "");
    const [slug, setSlug] = useState(initial?.slug ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [mediaType, setMediaType] = useState<GalleryMediaType>(initial?.media_type ?? "image");
    const [mediaUrlValue, setMediaUrlValue] = useState<string | null>(initial?.media_url ?? null);
    const [thumbnail, setThumbnail] = useState<string | null>(initial?.thumbnail_url ?? null);
    const [category, setCategory] = useState(initial?.category ?? "");
    const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
    const [isPublished, setIsPublished] = useState(initial?.is_published ?? false);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [banner, setBanner] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploadingMedia, setUploadingMedia] = useState(false);
    const [uploadingThumb, setUploadingThumb] = useState(false);
    const uploading = uploadingMedia || uploadingThumb;

    const mediaKind = kindOf(mediaUrlValue);

    const validate = (): FieldErrors => ({
        title: !title.trim() ? "Title is required" : maxLengthError(title, 200),
        slug: slug.trim() && !slugify(slug) ? "Use letters, numbers and dashes" : maxLengthError(slug, 200),
        description: maxLengthError(description, 5000),
        media_url: !mediaUrlValue
            ? "Upload a media file"
            : mediaKind && mediaKind !== mediaType
              ? `This file is ${KIND_NOUN[mediaKind]}. Upload ${KIND_NOUN[mediaType]} or change the media type.`
              : maxLengthError(mediaUrlValue, 500),
        thumbnail_url: thumbnail ? maxLengthError(thumbnail, 500) : undefined,
        category: maxLengthError(category, 50),
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
            title: title.trim(),
            description: description.trim() || null,
            media_type: mediaType,
            // Plain string fields: relative upload paths are fine here.
            media_url: mediaUrlValue,
            thumbnail_url: thumbnail || null,
            category: category.trim() || null,
            tags: splitList(tags),
            is_published: isPublished,
        };
        if (slug.trim()) payload.slug = slug.trim();

        try {
            if (isEdit && initial) {
                await api.put<GalleryItem>(`/gallery/${initial.id}`, payload);
                toast.success("Gallery item saved");
            } else {
                await api.post<GalleryItem>("/gallery/", payload);
                toast.success("Gallery item created");
            }
            if (mounted.current) router.push("/admin/gallery");
        } catch (err) {
            const { fields, banner: message } = submitFailure(err, FIELDS, "Couldn't save the gallery item.");
            setErrors(fields);
            setBanner(message);
            lock.current = false;
            setSaving(false);
            focusFirstInvalid(formRef.current);
        }
    };

    return (
        <FormShell title={isEdit ? "Edit gallery item" : "New gallery item"} back={BACK} formRef={formRef} onSubmit={handleSubmit} banner={banner}>
            <FormField label="Title" required error={errors.title}>
                <Input {...controlProps} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Neon dreamscape" />
            </FormField>

            <FormField label="Slug" helper="Leave blank to generate it from the title." error={errors.slug}>
                <Input {...controlProps} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="neon-dreamscape" />
            </FormField>

            <FormField label="Media type" error={errors.media_type}>
                <SelectField value={mediaType} onChange={(v) => setMediaType(v as GalleryMediaType)} options={MEDIA_TYPES} />
            </FormField>

            {/* Keyed by type: switching type mid-upload drops the stale result. */}
            <FileUploadInput
                key={mediaType}
                kind={mediaType}
                label={`Media file (${mediaType})`}
                value={mediaUrlValue}
                onChange={(url) => {
                    setMediaUrlValue(url);
                    setErrors((prev) => ({ ...prev, media_url: undefined }));
                }}
                error={errors.media_url}
                onUploadingChange={setUploadingMedia}
            />

            <FileUploadInput
                kind="image"
                label="Thumbnail or cover (optional)"
                value={thumbnail}
                onChange={setThumbnail}
                helperText="Used as the poster for video and audio items."
                error={errors.thumbnail_url}
                onUploadingChange={setUploadingThumb}
            />

            <FormField label="Category" helper="Free-form, e.g. music, animation, portrait. Up to 50 characters." error={errors.category}>
                <Input {...controlProps} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="music" />
            </FormField>

            <FormField label="Tags" helper="Comma-separated." error={errors.tags}>
                <Input {...controlProps} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="ambient, generative" />
            </FormField>

            <FormField label="Description" error={errors.description}>
                <Textarea {...controlProps} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe this piece" />
            </FormField>

            <CheckboxField checked={isPublished} onChange={setIsPublished}>
                Published (visible in the public gallery)
            </CheckboxField>

            <FormActions
                submitting={saving}
                submitLabel={isEdit ? "Save changes" : "Create item"}
                cancelHref={BACK.href}
                disabled={uploading}
                note={uploading ? "Waiting for the upload to finish" : undefined}
            />
        </FormShell>
    );
}

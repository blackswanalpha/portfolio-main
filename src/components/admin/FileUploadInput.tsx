"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Box, Button, Flex, HStack, Image, Spinner, Text, chakra } from "@chakra-ui/react";
import { LuCircleAlert, LuFileAudio, LuFileVideo, LuImageOff, LuTrash2, LuUpload, LuX } from "react-icons/lu";
import { api, mediaUrl } from "@/lib/api";
import { errorMessage } from "@/components/ui/states";
import { ghostButton, secondaryButton } from "./AdminUI";

const DropButton = chakra("button");

export type UploadKind = "image" | "video" | "audio";

const MB = 1024 * 1024;

// Mirrors the backend limits (app/core/config.py: ALLOWED_*_TYPES,
// MAX_FILE_SIZE = 5 MB for images, MAX_MEDIA_FILE_SIZE = 100 MB for video/audio).
const CONFIG: Record<UploadKind, { path: string; types: string[]; accept: string; maxBytes: number; formats: string; noun: string }> = {
    image: {
        path: "/upload/image",
        types: ["image/jpeg", "image/png", "image/gif", "image/webp"],
        accept: "image/jpeg,image/png,image/gif,image/webp",
        maxBytes: 5 * MB,
        formats: "JPEG, PNG, GIF or WebP",
        noun: "image",
    },
    video: {
        path: "/upload/video",
        types: ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"],
        accept: "video/mp4,video/webm,video/quicktime,video/x-matroska,.mkv",
        maxBytes: 100 * MB,
        formats: "MP4, WebM, MOV or MKV",
        noun: "video",
    },
    audio: {
        path: "/upload/audio",
        types: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/ogg", "audio/mp4", "audio/aac", "audio/flac"],
        accept: "audio/mpeg,audio/wav,audio/x-wav,audio/ogg,audio/mp4,audio/aac,audio/flac,.mp3,.m4a,.flac",
        maxBytes: 100 * MB,
        formats: "MP3, WAV, OGG, M4A, AAC or FLAC",
        noun: "audio file",
    },
};

function formatBytes(bytes: number): string {
    if (bytes >= MB) return bytes % MB === 0 ? `${bytes / MB} MB` : `${(bytes / MB).toFixed(1)} MB`;
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

interface Props {
    kind: UploadKind;
    label: string;
    /** Current stored URL (relative backend path, absolute URL, or empty). */
    value?: string | null;
    onChange: (url: string | null) => void;
    helperText?: string;
    /** Error from the parent form (e.g. server validation). */
    error?: string;
    disabled?: boolean;
    /** Reports upload start/end so the parent can hold its submit button. */
    onUploadingChange?: (uploading: boolean) => void;
}

interface Pending {
    name: string;
    size: number;
    /** Object URL for a local image preview (revoked when no longer shown). */
    previewUrl: string | null;
}

/**
 * Click-to-upload control. Validates type and size locally, uploads to the
 * matching /upload/* endpoint and returns the stored URL via onChange. A newer
 * pick, Remove or unmount makes any in-flight result stale, so it is ignored.
 */
export default function FileUploadInput({ kind, label, value, onChange, helperText, error, disabled, onUploadingChange }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const requestId = useRef(0);
    const mounted = useRef(false);
    const previewUrl = useRef<string | null>(null);
    const uploadingRef = useRef(false);
    const reportRef = useRef(onUploadingChange);
    const [pending, setPending] = useState<Pending | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);
    const [brokenUrl, setBrokenUrl] = useState<string | null>(null);
    const labelId = useId();
    const hintId = useId();

    const cfg = CONFIG[kind];
    const hint = `${cfg.formats}, up to ${formatBytes(cfg.maxBytes)}`;

    useEffect(() => {
        reportRef.current = onUploadingChange;
    }, [onUploadingChange]);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
            if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
            previewUrl.current = null;
            // Never leave the parent thinking an upload is still running.
            if (uploadingRef.current) reportRef.current?.(false);
            uploadingRef.current = false;
        };
    }, []);

    const setUploading = (next: boolean) => {
        if (uploadingRef.current === next) return;
        uploadingRef.current = next;
        reportRef.current?.(next);
    };

    const replacePreview = (next: string | null) => {
        if (previewUrl.current && previewUrl.current !== next) URL.revokeObjectURL(previewUrl.current);
        previewUrl.current = next;
    };

    const finish = () => {
        replacePreview(null);
        setPending(null);
        setUploading(false);
    };

    const checkFile = (file: File): string | null => {
        if (file.type && !cfg.types.includes(file.type)) return `That file type isn't supported. Use ${cfg.formats}.`;
        if (file.size > cfg.maxBytes) return `That file is ${formatBytes(file.size)}. The limit is ${formatBytes(cfg.maxBytes)}.`;
        return null;
    };

    const handleFile = async (file: File | undefined) => {
        if (inputRef.current) inputRef.current.value = "";
        if (!file) return;
        const problem = checkFile(file);
        if (problem) {
            setLocalError(problem);
            return;
        }
        setLocalError(null);
        const id = ++requestId.current;
        const objectUrl = kind === "image" ? URL.createObjectURL(file) : null;
        replacePreview(objectUrl);
        setPending({ name: file.name, size: file.size, previewUrl: objectUrl });
        setUploading(true);
        try {
            const res = await api.uploadFile(cfg.path, file);
            if (!mounted.current || id !== requestId.current) return;
            setBrokenUrl(null);
            onChange(res.file.url);
        } catch (err) {
            if (!mounted.current || id !== requestId.current) return;
            setLocalError(errorMessage(err, "Upload failed. Try again."));
        } finally {
            if (mounted.current && id === requestId.current) finish();
        }
    };

    const cancelUpload = () => {
        requestId.current += 1; // the in-flight result is now stale
        finish();
    };

    const remove = () => {
        requestId.current += 1;
        finish();
        setLocalError(null);
        onChange(null);
    };

    const pick = () => inputRef.current?.click();

    const resolved = mediaUrl(value);
    const shownError = localError ?? error;
    const busy = pending !== null;
    const KindIcon = kind === "video" ? LuFileVideo : kind === "audio" ? LuFileAudio : LuUpload;

    return (
        <Box role="group" aria-labelledby={labelId} aria-describedby={hintId}>
            <Text id={labelId} textStyle="label" color="text.secondary" mb={1.5}>
                {label}
            </Text>

            <input
                ref={inputRef}
                type="file"
                accept={cfg.accept}
                hidden
                tabIndex={-1}
                aria-hidden
                onChange={(e) => void handleFile(e.target.files?.[0])}
            />

            {busy ? (
                <Box border="1px solid" borderColor="gray.300" rounded="lg" p={3} bg="surface" role="status" aria-live="polite">
                    {pending.previewUrl ? (
                        <Box position="relative" w="fit-content" maxW="full">
                            <Image src={pending.previewUrl} alt="" maxH="180px" rounded="md" objectFit="cover" opacity={0.5} />
                            <Flex position="absolute" inset={0} align="center" justify="center">
                                <Spinner color="primary.500" />
                            </Flex>
                        </Box>
                    ) : null}
                    <HStack mt={pending.previewUrl ? 3 : 0} gap={3} justify="space-between">
                        <HStack gap={2} minW={0}>
                            {pending.previewUrl ? null : <Spinner size="sm" color="primary.500" />}
                            <Text fontSize="sm" color="text.secondary" truncate>
                                Uploading {pending.name} ({formatBytes(pending.size)})
                            </Text>
                        </HStack>
                        <Button size="xs" {...ghostButton} onClick={cancelUpload}>
                            <LuX aria-hidden /> Cancel
                        </Button>
                    </HStack>
                </Box>
            ) : value ? (
                <Box border="1px solid" borderColor={shownError ? "red.300" : "gray.300"} rounded="lg" p={3} bg="surface">
                    {kind === "image" &&
                        (brokenUrl === resolved ? (
                            <Flex h="120px" align="center" justify="center" gap={2} bg="gray.50" rounded="md" color="text.secondary" fontSize="sm">
                                <LuImageOff aria-hidden /> Preview unavailable
                            </Flex>
                        ) : (
                            <Image
                                src={resolved}
                                alt={`${label} preview`}
                                maxH="180px"
                                rounded="md"
                                objectFit="cover"
                                onError={() => setBrokenUrl(resolved)}
                            />
                        ))}
                    {kind === "video" && (
                        <video src={resolved} controls preload="metadata" style={{ width: "100%", maxHeight: 220, borderRadius: 6 }} />
                    )}
                    {kind === "audio" && <audio src={resolved} controls preload="metadata" style={{ width: "100%" }} />}
                    <HStack mt={3} gap={2}>
                        <Button size="xs" {...secondaryButton} onClick={pick} disabled={disabled}>
                            <LuUpload aria-hidden /> Replace
                        </Button>
                        <Button
                            size="xs"
                            {...ghostButton}
                            _hover={{ bg: "red.50", color: "red.700" }}
                            onClick={remove}
                            disabled={disabled}
                        >
                            <LuTrash2 aria-hidden /> Remove
                        </Button>
                    </HStack>
                </Box>
            ) : (
                <DropButton
                    type="button"
                    onClick={pick}
                    disabled={disabled}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    gap={1.5}
                    w="full"
                    py={6}
                    px={4}
                    border="1px dashed"
                    borderColor={shownError ? "red.400" : "gray.300"}
                    rounded="lg"
                    color="text.secondary"
                    bg="gray.50"
                    cursor="pointer"
                    transition="background-color 0.15s ease-out, border-color 0.15s ease-out, color 0.15s ease-out"
                    focusRingColor="primary.500"
                    focusVisibleRing="outside"
                    _hover={{ borderColor: "primary.400", color: "primary.700", bg: "primary.50" }}
                    _active={{ bg: "primary.100" }}
                    _disabled={{ cursor: "not-allowed", opacity: 0.6 }}
                >
                    <KindIcon size={20} aria-hidden />
                    <Text as="span" fontSize="sm" fontWeight={500}>
                        Upload {cfg.noun}
                    </Text>
                </DropButton>
            )}

            {shownError ? (
                <Flex role="alert" gap={1.5} align="flex-start" mt={1.5} fontSize="sm" color="red.700">
                    <Box as="span" mt="3px" flexShrink={0} aria-hidden>
                        <LuCircleAlert size={14} />
                    </Box>
                    {shownError}
                </Flex>
            ) : null}
            <Text id={hintId} fontSize="sm" color="text.secondary" mt={1.5}>
                {helperText ? `${helperText} ` : ""}
                {hint}.
            </Text>
        </Box>
    );
}

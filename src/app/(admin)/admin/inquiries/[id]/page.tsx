"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Button, Flex, Link as ChakraLink, Separator, SimpleGrid, Skeleton, Text, VisuallyHidden } from "@chakra-ui/react";
import { LuArchive, LuMail, LuTrash2, LuTriangleAlert } from "react-icons/lu";
import toast from "react-hot-toast";
import {
    BackLink,
    ConfirmDialog,
    NotFoundState,
    PageHeader,
    Panel,
    StatusBadge,
    ghostButton,
    secondaryButton,
} from "@/components/admin/AdminUI";
import { useConfirmAction, useMountedRef } from "@/components/admin/hooks";
import { formatDateTime } from "@/components/admin/format";
import { parseId, urlError } from "@/components/admin/forms";
import { ErrorState, errorMessage } from "@/components/ui/states";
import { useApi } from "@/hooks/useApi";
import { api, type InquiryDetail, type InquiryStatus } from "@/lib/api";
import { INQUIRY_STATUS_LABEL, INQUIRY_STATUS_TONE, REASON_LABEL } from "../labels";

const BACK = { href: "/admin/inquiries", label: "Back to inquiries" };

// One mark-read request per message id for this browser session, shared by
// every mounted instance of the page. A failed request is forgotten so a
// later visit can retry.
const markReadRequests = new Map<number, Promise<InquiryStatus>>();

function markReadOnce(id: number): Promise<InquiryStatus> {
    let request = markReadRequests.get(id);
    if (!request) {
        request = api.patch<{ id: number; status: InquiryStatus }>(`/contact/${id}/read`).then((res) => res.status);
        markReadRequests.set(id, request);
        request.catch(() => markReadRequests.delete(id));
    }
    return request;
}

function MetaRow({ label, children }: { label: string; children?: React.ReactNode }) {
    if (children === null || children === undefined || children === "") return null;
    return (
        <Box minW={0}>
            <Text textStyle="label" color="text.secondary">
                {label}
            </Text>
            <Text fontSize="sm" color="text.primary" wordBreak="break-word" mt={0.5}>
                {children}
            </Text>
        </Box>
    );
}

function DetailSkeleton() {
    return (
        <Box role="status" aria-live="polite" maxW="3xl">
            <VisuallyHidden>Loading the message</VisuallyHidden>
            <Box aria-hidden>
                <Skeleton h={7} w="60%" rounded="sm" />
                <Skeleton h={4} w="35%" rounded="sm" mt={2} mb={6} />
                <Panel>
                    <SimpleGrid columns={{ base: 1, sm: 2 }} gap={5} mb={6}>
                        {Array.from({ length: 4 }, (_, i) => (
                            <Box key={i}>
                                <Skeleton h={3.5} w="30%" rounded="sm" />
                                <Skeleton h={4} w="70%" rounded="sm" mt={2} />
                            </Box>
                        ))}
                    </SimpleGrid>
                    <Skeleton h={24} w="full" rounded="md" />
                </Panel>
            </Box>
        </Box>
    );
}

export default function InquiryDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const id = parseId(params?.id);
    const { data: item, error, loading, notFound, refreshing, reload, setData } = useApi<InquiryDetail>(
        id === null ? null : `/contact/${id}`,
    );
    const mounted = useMountedRef();
    const archiveLock = useRef(false);
    const [archiving, setArchiving] = useState(false);
    const confirmDelete = useConfirmAction<InquiryDetail>();

    // Opening a new message marks it read. markReadOnce shares one request per
    // id, so Strict Mode re-runs and remounts can't send a second PATCH.
    useEffect(() => {
        if (!item || item.status !== "new") return;
        const messageId = item.id;
        markReadOnce(messageId)
            .then((status) => setData((prev) => (prev && prev.id === messageId ? { ...prev, status } : prev)))
            .catch(() => {
                /* stays "new"; it can still be marked from the list */
            });
    }, [item, setData]);

    const archive = async () => {
        if (!item || archiveLock.current) return;
        archiveLock.current = true;
        setArchiving(true);
        try {
            const res = await api.patch<{ id: number; status: InquiryStatus }>(`/contact/${item.id}/archive`);
            setData((prev) => (prev ? { ...prev, status: res.status } : prev));
            toast.success("Inquiry archived");
            if (mounted.current) router.push("/admin/inquiries");
        } catch (err) {
            toast.error(errorMessage(err, "Couldn't archive the message."));
        } finally {
            archiveLock.current = false;
            if (mounted.current) setArchiving(false);
        }
    };

    const remove = () =>
        confirmDelete.confirm(async (target) => {
            await api.del(`/contact/${target.id}`);
            toast.success("Inquiry deleted");
            if (mounted.current) router.push("/admin/inquiries");
        });

    if (id === null || notFound) {
        return (
            <Box maxW="3xl">
                <PageHeader title="Inquiry" back={BACK} />
                <NotFoundState title="This inquiry doesn't exist" backHref={BACK.href} backLabel={BACK.label} />
            </Box>
        );
    }

    if (error && !item) {
        return (
            <Box maxW="3xl">
                <PageHeader title="Inquiry" back={BACK} />
                <ErrorState title="Couldn't load this message" description={errorMessage(error)} onRetry={reload} retrying={refreshing} />
            </Box>
        );
    }

    if (loading || !item) {
        return (
            <>
                <BackLink href={BACK.href}>{BACK.label}</BackLink>
                <DetailSkeleton />
            </>
        );
    }

    const busy = archiving || confirmDelete.pending;
    const websiteIsUrl = !!item.website && !urlError(item.website);

    return (
        <Box maxW="3xl">
            <PageHeader
                back={BACK}
                title={item.subject}
                description={
                    <>
                        {REASON_LABEL[item.contact_reason] ?? item.contact_reason} · {formatDateTime(item.created_at)}
                    </>
                }
                actions={
                    <>
                        <Button asChild size="sm" {...secondaryButton}>
                            <a href={`mailto:${item.email}?subject=${encodeURIComponent(`Re: ${item.subject}`)}`}>
                                <LuMail aria-hidden /> Reply
                            </a>
                        </Button>
                        {item.status !== "archived" ? (
                            <Button size="sm" {...ghostButton} onClick={archive} loading={archiving} loadingText="Archiving" disabled={busy}>
                                <LuArchive aria-hidden /> Archive
                            </Button>
                        ) : null}
                        <Button
                            size="sm"
                            {...ghostButton}
                            _hover={{ bg: "red.50", color: "red.700" }}
                            onClick={() => confirmDelete.ask(item)}
                            disabled={busy}
                        >
                            <LuTrash2 aria-hidden /> Delete
                        </Button>
                    </>
                }
            />

            <Flex gap={2} mb={4} wrap="wrap">
                <StatusBadge tone={INQUIRY_STATUS_TONE[item.status] ?? "neutral"}>{INQUIRY_STATUS_LABEL[item.status] ?? item.status}</StatusBadge>
                {item.is_spam && item.status !== "spam" ? (
                    <StatusBadge tone="danger">
                        <LuTriangleAlert aria-hidden /> Flagged as spam
                    </StatusBadge>
                ) : null}
            </Flex>

            <Panel>
                <SimpleGrid columns={{ base: 1, sm: 2 }} gap={5} mb={6}>
                    <MetaRow label="Name">{item.name}</MetaRow>
                    <MetaRow label="Email">
                        <ChakraLink href={`mailto:${item.email}`} color="primary.600" focusRingColor="primary.500">
                            {item.email}
                        </ChakraLink>
                    </MetaRow>
                    <MetaRow label="Phone">{item.phone}</MetaRow>
                    <MetaRow label="Company">{item.company}</MetaRow>
                    <MetaRow label="Website">
                        {item.website ? (
                            websiteIsUrl ? (
                                <ChakraLink href={item.website} target="_blank" rel="noopener noreferrer" color="primary.600" focusRingColor="primary.500">
                                    {item.website}
                                </ChakraLink>
                            ) : (
                                item.website
                            )
                        ) : null}
                    </MetaRow>
                    <MetaRow label="Budget">{item.budget_range}</MetaRow>
                    <MetaRow label="Timeline">{item.timeline}</MetaRow>
                    <MetaRow label="How they found you">{item.how_found}</MetaRow>
                </SimpleGrid>

                <Separator mb={6} borderColor="border" />

                <Text textStyle="label" color="text.secondary" mb={2}>
                    Message
                </Text>
                <Text color="text.primary" lineHeight={1.65} whiteSpace="pre-wrap" wordBreak="break-word">
                    {item.message}
                </Text>
            </Panel>

            <ConfirmDialog
                open={confirmDelete.open}
                title="Delete message?"
                description={confirmDelete.target ? `The message from ${confirmDelete.target.name} will be deleted. This can't be undone.` : undefined}
                confirmLabel="Delete message"
                pending={confirmDelete.pending}
                error={confirmDelete.error}
                onConfirm={remove}
                onCancel={confirmDelete.cancel}
            />
        </Box>
    );
}

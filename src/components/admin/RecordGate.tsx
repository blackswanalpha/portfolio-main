"use client";

import type { ReactNode } from "react";
import { Box } from "@chakra-ui/react";
import type { ApiQuery } from "@/hooks/useApi";
import { ErrorState, errorMessage } from "@/components/ui/states";
import { FormSkeleton, NotFoundState, PageHeader } from "./AdminUI";

interface RecordGateProps<T> {
    /** useApi result for the record (path null when the id is invalid). */
    query: Pick<ApiQuery<T>, "data" | "error" | "loading" | "notFound" | "refreshing" | "reload">;
    /** The route param wasn't a valid id ("abc", "0"). */
    invalidId: boolean;
    /** Page title while loading / on failure, e.g. "Edit project". */
    title: string;
    /** Lowercase noun for messages, e.g. "project". */
    noun: string;
    back: { href: string; label: string };
    /** Override for records that are found by scanning a list. */
    missing?: boolean;
    fields?: number;
    children: (data: T) => ReactNode;
}

/**
 * Loading, not-found and error states for edit routes. The form only mounts
 * once the record has loaded, so it can't be edited or submitted early.
 */
export function RecordGate<T>({ query, invalidId, title, noun, back, missing, fields = 6, children }: RecordGateProps<T>) {
    if (invalidId || query.notFound || (missing && !query.loading && !query.error)) {
        return (
            <Box maxW="3xl">
                <PageHeader title={title} back={back} />
                <NotFoundState title={`This ${noun} doesn't exist`} backHref={back.href} backLabel={back.label} />
            </Box>
        );
    }
    if (query.error && !query.data) {
        return (
            <Box maxW="3xl">
                <PageHeader title={title} back={back} />
                <ErrorState
                    title={`Couldn't load this ${noun}`}
                    description={errorMessage(query.error)}
                    onRetry={query.reload}
                    retrying={query.refreshing}
                />
            </Box>
        );
    }
    if (query.loading || query.data === undefined) {
        return (
            <Box maxW="3xl">
                <PageHeader title={title} back={back} />
                <FormSkeleton fields={fields} label={`Loading the ${noun}`} />
            </Box>
        );
    }
    return <>{children(query.data)}</>;
}

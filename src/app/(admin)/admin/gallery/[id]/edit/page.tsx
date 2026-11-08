"use client";

import { useParams } from "next/navigation";
import GalleryForm from "@/components/admin/GalleryForm";
import { RecordGate } from "@/components/admin/RecordGate";
import { parseId } from "@/components/admin/forms";
import { useApi } from "@/hooks/useApi";
import type { GalleryItem, Paginated } from "@/lib/api";

// There is no GET-by-id for gallery items (the public GET is by slug), so
// drafts are found in the owner's list. page_size is capped at 100.
const LIST_PATH = "/gallery/?published_only=false&page_size=100";

export default function EditGalleryItemPage() {
    const params = useParams<{ id: string }>();
    const id = parseId(params?.id);
    const query = useApi<Paginated<GalleryItem>>(id === null ? null : LIST_PATH);
    const item = query.data?.items.find((g) => g.id === id);

    return (
        <RecordGate
            query={{ ...query, data: item }}
            invalidId={id === null}
            missing={!!query.data && !item}
            title="Edit gallery item"
            noun="gallery item"
            back={{ href: "/admin/gallery", label: "Back to gallery" }}
        >
            {(g) => <GalleryForm key={g.id} initial={g} />}
        </RecordGate>
    );
}

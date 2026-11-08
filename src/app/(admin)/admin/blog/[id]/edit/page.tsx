"use client";

import { useParams } from "next/navigation";
import BlogForm from "@/components/admin/BlogForm";
import { RecordGate } from "@/components/admin/RecordGate";
import { parseId } from "@/components/admin/forms";
import { useApi } from "@/hooks/useApi";
import type { BlogPost, Paginated } from "@/lib/api";

// There is no GET-by-id for posts (the public GET is by slug), so drafts are
// found in the owner's list. page_size is capped at 100 by the backend.
const LIST_PATH = "/blog/?published_only=false&page_size=100";

export default function EditBlogPostPage() {
    const params = useParams<{ id: string }>();
    const id = parseId(params?.id);
    const query = useApi<Paginated<BlogPost>>(id === null ? null : LIST_PATH);
    const post = query.data?.items.find((p) => p.id === id);

    return (
        <RecordGate
            query={{ ...query, data: post }}
            invalidId={id === null}
            missing={!!query.data && !post}
            title="Edit article"
            noun="article"
            back={{ href: "/admin/blog", label: "Back to blog" }}
        >
            {(p) => <BlogForm key={p.id} initial={p} />}
        </RecordGate>
    );
}

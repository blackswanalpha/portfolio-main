import { LuImage, LuMusic, LuVideo } from "react-icons/lu";
import type { GalleryItem, GalleryMediaType } from "@/lib/api";
import { yearOf } from "@/components/projects/shared";

export { formatMonth } from "@/components/projects/shared";

export const TYPE_META: Record<GalleryMediaType, { label: string; icon: typeof LuImage }> = {
    image: { label: "Art", icon: LuImage },
    video: { label: "Video", icon: LuVideo },
    audio: { label: "Music", icon: LuMusic },
};

export function galleryYear(item: GalleryItem): string {
    return yearOf(item.published_at ?? item.created_at);
}

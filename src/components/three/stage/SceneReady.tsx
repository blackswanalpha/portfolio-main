"use client";

import { useEffect } from "react";
import type { SlotId, Stage } from "./stage";

/**
 * Place inside a scene's Suspense boundary, next to its last asset. It mounts
 * only once everything above it has loaded, so the poster is never swapped for
 * a half-built frame.
 */
export default function SceneReady({ id, stage }: { id: SlotId; stage: Stage }) {
    useEffect(() => {
        stage.setSceneReady(id, true);
        return () => stage.setSceneReady(id, false);
    }, [id, stage]);
    return null;
}

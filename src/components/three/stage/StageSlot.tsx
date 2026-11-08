"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Box, type BoxProps } from "@chakra-ui/react";
import { useStage, type SlotId } from "./stage";

interface StageSlotProps extends Omit<BoxProps, "children"> {
    id: SlotId;
    /** Still render of the same scene, shown while loading and when WebGL is unavailable. */
    poster: string;
    /** `sizes` hint for the poster image. */
    posterSizes: string;
    /** Accessible description of what the view shows. */
    label: string;
    /** Report pointer movement (fine pointers) so the scene can respond. */
    trackPointer?: boolean;
}

const FADE = "opacity 320ms cubic-bezier(0.16, 1, 0.3, 1)";

/**
 * Inline frame for one 3D view. It takes its size from CSS (aspect ratio), so
 * the page never shifts when the 3D arrives. The poster stays until the shared
 * renderer has copied a first frame in, then the two crossfade.
 */
export default function StageSlot({ id, poster, posterSizes, label, trackPointer = false, ...boxProps }: StageSlotProps) {
    const stage = useStage();
    const frameRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const frame = frameRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!stage || !frame || !canvas || !ctx) return;

        let shown = false;
        const rect = frame.getBoundingClientRect();
        const unregister = stage.register(id, {
            canvas,
            ctx,
            width: rect.width,
            height: rect.height,
            visible: false,
            wanted: false,
            pointer: { x: 0, y: 0, active: false },
            onFrame: () => {
                if (shown) return;
                shown = true;
                setReady(true);
            },
            onLost: () => {
                shown = false;
                setReady(false);
            },
        });

        const resize = new ResizeObserver((entries) => {
            const { width, height } = entries[entries.length - 1].contentRect;
            stage.update(id, { width, height });
        });
        resize.observe(frame);

        // Load the 3D well before the view scrolls in; render only when it is close.
        const near = new IntersectionObserver(
            (entries) => {
                if (entries[entries.length - 1].isIntersecting) stage.update(id, { wanted: true });
            },
            { rootMargin: "600px 0px" },
        );
        near.observe(frame);
        const onScreen = new IntersectionObserver(
            (entries) => stage.update(id, { visible: entries[entries.length - 1].isIntersecting }),
            { rootMargin: "120px 0px" },
        );
        onScreen.observe(frame);

        return () => {
            resize.disconnect();
            near.disconnect();
            onScreen.disconnect();
            unregister();
        };
    }, [stage, id]);

    useEffect(() => {
        const frame = frameRef.current;
        if (!trackPointer || !stage || !frame) return;
        const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
        const onMove = (event: PointerEvent) => {
            const slot = stage.slots.get(id);
            if (!slot || !fine.matches || event.pointerType !== "mouse") return;
            const rect = frame.getBoundingClientRect();
            slot.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            slot.pointer.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
            slot.pointer.active = true;
            stage.invalidate();
        };
        const onLeave = () => {
            const slot = stage.slots.get(id);
            if (!slot) return;
            slot.pointer.active = false;
            stage.invalidate();
        };
        frame.addEventListener("pointermove", onMove);
        frame.addEventListener("pointerleave", onLeave);
        return () => {
            frame.removeEventListener("pointermove", onMove);
            frame.removeEventListener("pointerleave", onLeave);
        };
    }, [stage, id, trackPointer]);

    return (
        <Box ref={frameRef} position="relative" overflow="hidden" role="img" aria-label={label} data-ready={ready ? "" : undefined} {...boxProps}>
            <Image
                src={poster}
                alt=""
                fill
                sizes={posterSizes}
                draggable={false}
                style={{ objectFit: "contain", opacity: ready ? 0 : 1, transition: FADE }}
            />
            <canvas
                ref={canvasRef}
                aria-hidden="true"
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    opacity: ready ? 1 : 0,
                    transition: FADE,
                }}
            />
        </Box>
    );
}

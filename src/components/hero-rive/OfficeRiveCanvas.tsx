"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { Alignment, Fit, Layout, useRive } from "@rive-app/react-canvas";

const LAYOUT = new Layout({ fit: Fit.Cover, alignment: Alignment.Center });

interface OfficeRiveCanvasProps {
    onReady: () => void;
    style?: CSSProperties;
}

/** Plays the office loop while it is on screen and pauses it otherwise. */
export default function OfficeRiveCanvas({ onReady, style }: OfficeRiveCanvasProps) {
    const frameRef = useRef<HTMLDivElement>(null);
    const { rive, RiveComponent } = useRive({
        src: "/rive/office.riv",
        stateMachine: "office",
        autoplay: true,
        layout: LAYOUT,
        onLoad: onReady,
    });

    useEffect(() => {
        const frame = frameRef.current;
        if (!rive || !frame) return;
        const onScreen = new IntersectionObserver(
            (entries) => {
                if (entries[entries.length - 1].isIntersecting) rive.play();
                else rive.pause();
            },
            { rootMargin: "120px 0px" },
        );
        onScreen.observe(frame);
        return () => onScreen.disconnect();
    }, [rive]);

    return (
        <div ref={frameRef} aria-hidden="true" style={{ position: "absolute", inset: 0, ...style }}>
            <RiveComponent style={{ width: "100%", height: "100%" }} />
        </div>
    );
}

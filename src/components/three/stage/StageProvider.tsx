"use client";

import { Component, useState, useSyncExternalStore, type ErrorInfo, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Stage, StageContext } from "./stage";

// three.js, R3F and drei load only once a 3D view is about to scroll in.
const HomeStage = dynamic(() => import("./HomeStage"), { ssr: false, loading: () => null });

/** Any failure inside the 3D (no WebGL, a missing asset) leaves the posters in place. */
class StageBoundary extends Component<{ stage: Stage; children: ReactNode }, { failed: boolean }> {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        this.props.stage.fail();
        if (process.env.NODE_ENV !== "production") {
            console.warn("[home 3D] falling back to posters:", error.message, info.componentStack);
        }
    }

    render() {
        return this.state.failed ? null : this.props.children;
    }
}

function subscribeNever() {
    return () => {};
}

let webglSupport: boolean | null = null;

/**
 * One cached capability check (the same probe three.js uses), so a browser
 * without WebGL keeps the posters and never mounts the renderer or logs errors.
 */
function hasWebGL() {
    if (webglSupport !== null) return webglSupport;
    try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
        webglSupport = gl !== null;
        gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
        webglSupport = false;
    }
    return webglSupport;
}

/** Data Saver on: keep the stills, skip the 3D download. */
function prefersReducedData() {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    return connection?.saveData === true;
}

export default function StageProvider({ children }: { children: ReactNode }) {
    const [stage] = useState(() => new Stage());
    const wanted = useSyncExternalStore(stage.subscribe, stage.getWanted, () => false);
    const saveData = useSyncExternalStore(subscribeNever, prefersReducedData, () => false);
    // Checked only once a 3D view is near the screen (never during hydration).
    const enabled = wanted && !saveData && hasWebGL();

    return (
        <StageContext.Provider value={stage}>
            {children}
            {enabled ? (
                <StageBoundary stage={stage}>
                    <HomeStage stage={stage} />
                </StageBoundary>
            ) : null}
        </StageContext.Provider>
    );
}

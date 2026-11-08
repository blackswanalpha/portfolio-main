"use client";

import { createContext, useContext } from "react";

/*
 * One WebGL context for the whole home page.
 *
 * A single hidden R3F canvas renders every 3D view (the globe, the hobbies
 * still life) into its own region and copies the pixels into a plain 2D canvas
 * that sits inline in the page. The inline canvases scroll with the document,
 * so the 3D never drifts from its frame the way a fixed full-screen canvas
 * does, and a view that is off screen costs nothing.
 *
 * This registry is the only link between the DOM slots and the renderer.
 */

export type SlotId = "globe" | "hobbies";

export interface Slot {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    /** CSS pixel size of the slot. */
    width: number;
    height: number;
    /** On or near the screen: render it. */
    visible: boolean;
    /** Has been near the screen at least once: worth loading the 3D for. */
    wanted: boolean;
    /** Pointer position over the slot, -1..1 on each axis (fine pointers only). */
    pointer: { x: number; y: number; active: boolean };
    /** Called after a frame has been copied into the slot. */
    onFrame: () => void;
    /** Called when the renderer is gone and the poster must come back. */
    onLost: () => void;
}

type Listener = () => void;

export class Stage {
    readonly slots = new Map<SlotId, Slot>();
    private listeners = new Set<Listener>();
    private invalidator: (() => void) | null = null;
    private failedFlag = false;
    /** Scenes whose assets have all loaded; a view is only copied out once its scene is complete. */
    private readyScenes = new Set<SlotId>();
    /** Snapshot for useSyncExternalStore: changes whenever slot sizes or wants change. */
    private version = 0;

    subscribe = (listener: Listener) => {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    };

    getVersion = () => this.version;

    /** Primitive snapshots for useSyncExternalStore. */
    getSizeKey = () => {
        const { width, height } = this.maxSize;
        return `${width}x${height}`;
    };

    getWanted = () => this.wanted && !this.failedFlag;

    private emit() {
        this.version++;
        this.listeners.forEach((listener) => listener());
    }

    register(id: SlotId, slot: Slot) {
        this.slots.set(id, slot);
        this.emit();
        this.invalidate();
        return () => {
            if (this.slots.get(id) === slot) this.slots.delete(id);
            this.emit();
        };
    }

    update(id: SlotId, patch: Partial<Pick<Slot, "width" | "height" | "visible" | "wanted">>) {
        const slot = this.slots.get(id);
        if (!slot) return;
        const sizeChanged =
            (patch.width !== undefined && patch.width !== slot.width) ||
            (patch.height !== undefined && patch.height !== slot.height);
        const wantChanged = patch.wanted !== undefined && patch.wanted !== slot.wanted;
        Object.assign(slot, patch);
        if (sizeChanged || wantChanged) this.emit();
        this.invalidate();
    }

    /** True once any slot has come near the screen. */
    get wanted() {
        for (const slot of this.slots.values()) if (slot.wanted) return true;
        return false;
    }

    /** Largest slot, in CSS pixels: the hidden canvas must be at least this big. */
    get maxSize() {
        let width = 1;
        let height = 1;
        for (const slot of this.slots.values()) {
            width = Math.max(width, Math.ceil(slot.width));
            height = Math.max(height, Math.ceil(slot.height));
        }
        return { width, height };
    }

    setSceneReady(id: SlotId, ready: boolean) {
        if (ready) this.readyScenes.add(id);
        else this.readyScenes.delete(id);
        this.invalidate();
    }

    isSceneReady(id: SlotId) {
        return this.readyScenes.has(id);
    }

    setInvalidator(fn: (() => void) | null) {
        this.invalidator = fn;
        if (fn) fn();
    }

    invalidate() {
        this.invalidator?.();
    }

    get failed() {
        return this.failedFlag;
    }

    /** WebGL is unavailable or the context was lost: every slot keeps its poster. */
    fail() {
        if (this.failedFlag) return;
        this.failedFlag = true;
        this.invalidator = null;
        this.slots.forEach((slot) => slot.onLost());
        this.emit();
    }
}

export const StageContext = createContext<Stage | null>(null);

export function useStage() {
    return useContext(StageContext);
}

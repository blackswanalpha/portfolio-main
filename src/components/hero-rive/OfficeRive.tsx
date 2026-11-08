"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Box } from "@chakra-ui/react";
import { usePrefersReducedMotion } from "@/components/three/stage/usePrefersReducedMotion";

const OfficeRiveCanvas = dynamic(() => import("./OfficeRiveCanvas"), { ssr: false });

const FADE = "opacity 320ms cubic-bezier(0.16, 1, 0.3, 1)";
const LABEL =
    "Animated isometric illustration of a developer at a desk writing code, with the website they are building and a terminal on the second monitor, a cat napping on the rug and a neon code sign on the brick wall";

/**
 * Hero illustration. The poster is frame 0 of the Rive loop, so it is the LCP image,
 * the reduced-motion view and the fallback if the animation fails to load. Fills its
 * parent, which sets the size.
 */
export default function OfficeRive({ sizes }: { sizes: string }) {
    const reducedMotion = usePrefersReducedMotion();
    const [ready, setReady] = useState(false);
    const playing = ready && !reducedMotion;

    return (
        <Box position="absolute" inset="0" role="img" aria-label={LABEL}>
            <Image
                src="/images/home/office-hero.webp"
                alt=""
                fill
                preload
                sizes={sizes}
                draggable={false}
                style={{ objectFit: "cover", opacity: playing ? 0 : 1, transition: FADE }}
            />
            {reducedMotion ? null : (
                <OfficeRiveCanvas
                    onReady={() => setReady(true)}
                    style={{ opacity: playing ? 1 : 0, transition: FADE }}
                />
            )}
        </Box>
    );
}

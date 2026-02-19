"use client";

import { motion, useAnimation, Variant } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ReactNode, useEffect } from "react";

interface ScrollRevealProps {
    children: ReactNode;
    width?: "fit-content" | "100%";
    variants?: {
        hidden: Variant;
        visible: Variant;
    };
    transition?: {
        duration?: number;
        delay?: number;
        ease?: any;
    };
}

export default function ScrollReveal({
    children,
    width = "fit-content",
    variants,
    transition,
}: ScrollRevealProps) {
    const controls = useAnimation();
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    useEffect(() => {
        if (inView) {
            controls.start("visible");
        }
    }, [controls, inView]);

    const defaultVariants = {
        hidden: { opacity: 0, y: 75 },
        visible: { opacity: 1, y: 0 },
    };

    const defaultTransition = {
        duration: 0.5,
        delay: 0.25,
        ease: "easeOut",
    };

    return (
        <div ref={ref} style={{ position: "relative", width, overflow: "hidden" }}>
            <motion.div
                variants={variants || defaultVariants}
                initial="hidden"
                animate={controls}
                transition={transition || (defaultTransition as any)}
            >
                {children}
            </motion.div>
        </div>
    );
}

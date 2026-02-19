"use client";

import React from "react";
import ScrollReveal from "../ScrollReveal";

interface StaggeredListProps {
    children: React.ReactNode[];
    staggerDelay?: number;
    baseDelay?: number;
    width?: string;
    className?: string;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
    children,
    staggerDelay = 0.1,
    baseDelay = 0.2,
    width = "100%",
    className = "",
}) => {
    return (
        <div className={className} style={{ width }}>
            {React.Children.map(children, (child, index) => (
                <ScrollReveal
                    key={index}
                    width="100%"
                    transition={{ delay: baseDelay + index * staggerDelay }}
                >
                    {child}
                </ScrollReveal>
            ))}
        </div>
    );
};

export default StaggeredList;

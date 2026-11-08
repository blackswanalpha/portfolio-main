"use client";

import React from "react";

interface StaggeredListProps {
    children: React.ReactNode[];
    /** @deprecated Ignored. Items are no longer hidden until scrolled into view. */
    staggerDelay?: number;
    /** @deprecated Ignored. */
    baseDelay?: number;
    width?: string;
    className?: string;
}

/**
 * Formerly wrapped every child in a scroll-triggered fade, so items started
 * invisible and could stay that way. It now lays the children out as-is.
 */
export const StaggeredList: React.FC<StaggeredListProps> = ({ children, width = "100%", className = "" }) => {
    return (
        <div className={className} style={{ width }}>
            {children}
        </div>
    );
};

export default StaggeredList;

"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

interface ScrollableWithHintsProps {
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
}

export function ScrollableWithHints({
    children,
    className,
    containerClassName,
}: ScrollableWithHintsProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftHint, setShowLeftHint] = useState(false);
    const [showRightHint, setShowRightHint] = useState(false);

    useEffect(() => {
        const element = scrollRef.current;
        if (!element) return;

        const updateHints = () => {
            const hasOverflow = element.scrollWidth > element.clientWidth;
            if (!hasOverflow) {
                setShowLeftHint(false);
                setShowRightHint(false);
                return;
            }

            const atStart = element.scrollLeft <= 4;
            const atEnd =
                element.scrollLeft >= element.scrollWidth - element.clientWidth - 4;

            setShowLeftHint(!atStart);
            setShowRightHint(!atEnd);
        };

        updateHints();
        window.addEventListener("resize", updateHints);
        element.addEventListener("scroll", updateHints, { passive: true });

        return () => {
            window.removeEventListener("resize", updateHints);
            element.removeEventListener("scroll", updateHints);
        };
    }, []);

    return (
        <div className={cn("relative group", containerClassName)}>
            <div
                ref={scrollRef}
                className={cn(
                    "overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                    className
                )}
            >
                {children}
            </div>

            {showLeftHint && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-start bg-gradient-to-r from-background via-background/60 to-transparent pl-1 transition-opacity duration-300">
                    <ArrowIcon direction="left" />
                </div>
            )}

            {showRightHint && (
                <div className="pointer-events-none absolute inset-y-0 right-0 flex w-12 items-center justify-end bg-gradient-to-l from-background via-background/60 to-transparent pr-1 transition-opacity duration-300">
                    <ArrowIcon direction="right" />
                </div>
            )}
        </div>
    );
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 text-text-secondary animate-pulse"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {direction === "left" ? (
                <>
                    <path d="M15 19l-7-7 7-7" />
                </>
            ) : (
                <>
                    <path d="M9 5l7 7-7 7" />
                </>
            )}
        </svg>
    );
}

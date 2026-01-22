"use client";

import * as React from "react";
import { X } from "lucide-react";

interface PopoverProps {
    children: React.ReactNode;
    content: React.ReactNode;
    side?: "top" | "right" | "bottom" | "left";
    align?: "start" | "center" | "end";
}

export function Popover({ children, content, side = "bottom", align = "center" }: PopoverProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const popoverRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen]);

    const getSideClasses = () => {
        const base = "absolute z-50";
        switch (side) {
            case "top":
                return `${base} bottom-full mb-2`;
            case "bottom":
                return `${base} top-full mt-2`;
            case "left":
                return `${base} right-full mr-2`;
            case "right":
                return `${base} left-full ml-2`;
        }
    };

    const getAlignClasses = () => {
        if (side === "top" || side === "bottom") {
            switch (align) {
                case "start":
                    return "left-0";
                case "end":
                    return "right-0";
                case "center":
                default:
                    return "left-1/2 -translate-x-1/2";
            }
        } else {
            switch (align) {
                case "start":
                    return "top-0";
                case "end":
                    return "bottom-0";
                case "center":
                default:
                    return "top-1/2 -translate-y-1/2";
            }
        }
    };

    return (
        <div className="relative inline-block" ref={popoverRef}>
            <div onClick={() => setIsOpen(!isOpen)}>{children}</div>

            {isOpen && (
                <div
                    className={`${getSideClasses()} ${getAlignClasses()} w-72 sm:w-80 bg-slate-900 text-white rounded-lg shadow-2xl border border-slate-700 p-4 animate-in fade-in-0 zoom-in-95`}
                >
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-2 right-2 p-1 hover:bg-slate-800 rounded transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    {content}
                </div>
            )}
        </div>
    );
}

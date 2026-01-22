"use client";

import * as React from "react";

interface TooltipProps {
    children: React.ReactNode;
    content: string | React.ReactNode;
    side?: "top" | "right" | "bottom" | "left";
}

export function Tooltip({ children, content, side = "top" }: TooltipProps) {
    const [isVisible, setIsVisible] = React.useState(false);

    return (
        <div className="relative inline-block">
            <div
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onFocus={() => setIsVisible(true)}
                onBlur={() => setIsVisible(false)}
            >
                {children}
            </div>
            {isVisible && (
                <div
                    className={`absolute z-50 px-3 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg shadow-lg whitespace-nowrap pointer-events-none
            ${side === "top" ? "bottom-full left-1/2 -translate-x-1/2 mb-2" : ""}
            ${side === "bottom" ? "top-full left-1/2 -translate-x-1/2 mt-2" : ""}
            ${side === "left" ? "right-full top-1/2 -translate-y-1/2 mr-2" : ""}
            ${side === "right" ? "left-full top-1/2 -translate-y-1/2 ml-2" : ""}
          `}
                >
                    {content}
                    <div
                        className={`absolute w-2 h-2 bg-slate-900 transform rotate-45
              ${side === "top" ? "bottom-[-4px] left-1/2 -translate-x-1/2" : ""}
              ${side === "bottom" ? "top-[-4px] left-1/2 -translate-x-1/2" : ""}
              ${side === "left" ? "right-[-4px] top-1/2 -translate-y-1/2" : ""}
              ${side === "right" ? "left-[-4px] top-1/2 -translate-y-1/2" : ""}
            `}
                    />
                </div>
            )}
        </div>
    );
}

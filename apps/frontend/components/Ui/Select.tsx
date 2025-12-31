"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

export interface SelectOption {
    label: string;
    value: string;
}

interface SelectProps {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    containerClassName?: string;
}

export function Select({
    options,
    value,
    onChange,
    placeholder = "Select an option",
    className,
    containerClassName,
}: SelectProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div
            ref={containerRef}
            className={cn("relative w-full", containerClassName)}
        >
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex h-11 w-full items-center justify-between rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-text-secondary shadow-sm transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 cursor-pointer",
                    isOpen && "border-brand ring-2 ring-brand/20",
                    className
                )}
            >
                <span className="truncate">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    className={cn(
                        "ml-2 h-4 w-4 shrink-0 text-text-secondary transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 4, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-2xl border border-border bg-background p-1 shadow-xl backdrop-blur-3xl dark:bg-slate-900/95"
                    >
                        <div className="flex flex-col gap-1">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "flex w-full items-center justify-between rounded-xl px-4 py-2 text-left text-sm font-medium transition-colors",
                                        value === option.value
                                            ? "bg-brand/10 text-brand dark:bg-brand/20 dark:text-indigo-400"
                                            : "text-text-secondary hover:bg-surface hover:text-text-primary dark:hover:bg-slate-800",
                                        "cursor-pointer"
                                    )}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {value === option.value && (
                                        <Check className="h-4 w-4 shrink-0 text-brand dark:text-indigo-400" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

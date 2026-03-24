"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Check, ChevronDown, Loader2 } from "lucide-react";

type ComboboxOption = {
    value: string;
    label: string;
    description?: string;
    metadata?: any;
};

type ComboboxProps = {
    options: ComboboxOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    loading?: boolean;
    disabled?: boolean;
    className?: string;
    emptyMessage?: string;
};

export function Combobox({
    options,
    value,
    onChange,
    placeholder = "Select an option",
    searchPlaceholder = "Search...",
    loading = false,
    disabled = false,
    className = "",
    emptyMessage = "No options found",
}: ComboboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Filter options based on search term
    const filteredOptions = options.filter(
        (option) =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            option.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get selected option
    const selectedOption = options.find((opt) => opt.value === value);

    // Close dropdown when clicking outside
    useEffect(() => {
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

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm("");
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
                disabled={disabled || loading}
                className="w-full flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm text-text-primary hover:bg-surface focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span className={selectedOption ? "text-text-primary" : "text-text-secondary"}>
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading...
                        </span>
                    ) : selectedOption ? (
                        selectedOption.label
                    ) : (
                        placeholder
                    )}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-text-secondary transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {/* Dropdown */}
            {isOpen && !loading && (
                <div className="absolute z-[9999] mt-2 w-full max-h-[300px] flex flex-col rounded-2xl border border-border bg-background shadow-xl backdrop-blur-3xl dark:bg-slate-900/95 animate-in fade-in-0 zoom-in-95">
                    {/* Search Input */}
                    <div className="p-2 border-b border-border">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-secondary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div
                        className="overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent flex-1 flex flex-col gap-1"
                        onWheel={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                    >
                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-6 text-center text-sm text-text-secondary">
                                {emptyMessage}
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className={`w-full flex cursor-pointer items-start gap-2 px-3 py-2 text-left rounded-xl transition-colors ${
                                        value === option.value
                                            ? "bg-brand/10 text-brand dark:bg-brand/20 dark:text-indigo-400"
                                            : "text-text-secondary hover:bg-surface hover:text-text-primary dark:hover:bg-slate-800"
                                    }`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-sm font-medium truncate ${value === option.value ? "text-brand dark:text-indigo-400" : "text-text-primary"}`}>
                                            {option.label}
                                        </div>
                                        {option.description && (
                                            <div className={`text-xs truncate mt-0.5 ${value === option.value ? "text-brand/80 dark:text-indigo-400/80" : "text-text-secondary"}`}>
                                                {option.description}
                                            </div>
                                        )}
                                    </div>
                                    {value === option.value && (
                                        <Check className="w-4 h-4 shrink-0 mt-0.5" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


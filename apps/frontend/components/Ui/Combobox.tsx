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
                    className={`w-4 h-4 text-text-secondary transition-transform ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            {/* Dropdown */}
            {isOpen && !loading && (
                <div className="absolute z-[100] mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 shadow-2xl animate-in fade-in-0 zoom-in-95">
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
                                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-700 bg-slate-900 text-white placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto p-1">
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
                                    className={`w-full flex cursor-pointer items-start gap-2 px-3 py-2 text-left rounded-lg hover:bg-slate-800 transition-colors ${value === option.value ? "bg-indigo-500/20" : ""
                                        }`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-slate-200 truncate">
                                            {option.label}
                                        </div>
                                        {option.description && (
                                            <div className="text-xs text-slate-400 truncate mt-0.5">
                                                {option.description}
                                            </div>
                                        )}
                                    </div>
                                    {value === option.value && (
                                        <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
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

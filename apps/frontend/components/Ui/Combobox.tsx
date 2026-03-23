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
                className="w-full flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md px-4 py-3 text-sm text-white hover:bg-white/5 hover:border-white/20 focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-inner"
            >
                <span className={selectedOption ? "text-white font-medium" : "text-slate-400"}>
                    {loading ? (
                        <span className="flex items-center gap-2 text-slate-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading repositories...
                        </span>
                    ) : selectedOption ? (
                        selectedOption.label
                    ) : (
                        placeholder
                    )}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {/* Dropdown */}
            {isOpen && !loading && (
                <div className="absolute z-[200] mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden animate-in fade-in-0 zoom-in-95">
                    {/* Search Input */}
                    <div className="p-2.5 border-b border-white/10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div
                        className="max-h-64 overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                        onWheel={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                    >
                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-8 text-center text-sm text-slate-500">
                                {emptyMessage}
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className={`w-full flex cursor-pointer items-start gap-3 px-3 py-2.5 text-left rounded-xl hover:bg-white/5 transition-colors group ${
                                        value === option.value ? "bg-brand/10 border border-brand/20" : ""
                                    }`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-sm font-semibold truncate ${value === option.value ? "text-brand" : "text-white group-hover:text-white"}`}>
                                            {option.label}
                                        </div>
                                        {option.description && (
                                            <div className="text-xs text-slate-500 truncate mt-0.5">
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


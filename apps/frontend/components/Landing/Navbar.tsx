"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Github, Menu, X } from "lucide-react";

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogin = () => {
        window.location.href = "/auth/github/login";
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? "bg-background/95 backdrop-blur-xl border-b border-border/30 py-3 shadow-lg"
                : "bg-background/85 backdrop-blur-xl py-5"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-1">
                    <img src="/logo.svg" alt="DevLens" className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16" />
                    <span className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-text-primary" style={{ fontFamily: 'var(--font-logo)' }}>
                        DevLens
                    </span>
                </Link>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-6">
                    <Link
                        href="/features"
                        className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                    >
                        Features
                    </Link>
                    <Link
                        href="/pricing"
                        className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                    >
                        Pricing
                    </Link>
                    <Link
                        href="/how-it-works"
                        className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                    >
                        How it works
                    </Link>
                    <button
                        onClick={handleLogin}
                        className="flex items-center gap-2 bg-white hover:bg-slate-200 text-slate-900 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                    >
                        <Github className="w-4 h-4" />
                        Login with GitHub
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-text-secondary"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <>
                    {/* Backdrop overlay with blur - covers entire screen behind menu */}
                    <div
                        className="md:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[45]"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    {/* Menu container - Dark blurred background */}
                    <div className="md:hidden absolute top-full left-0 right-0 border-b border-white/10 shadow-2xl z-[50] animate-in slide-in-from-top-5 overflow-hidden bg-slate-900/95 backdrop-blur-3xl">
                        {/* Content */}
                        <div className="relative p-4 flex flex-col gap-4">
                            <Link
                                href="/features"
                                className="text-left text-sm font-medium text-slate-300 hover:text-white transition-colors py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Features
                            </Link>
                            <Link
                                href="/pricing"
                                className="text-left text-sm font-medium text-slate-300 hover:text-white transition-colors py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Pricing
                            </Link>
                            <Link
                                href="/how-it-works"
                                className="text-left text-sm font-medium text-slate-300 hover:text-white transition-colors py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                How it works
                            </Link>
                            <button
                                onClick={handleLogin}
                                className="flex items-center justify-center gap-2 bg-white hover:bg-slate-200 text-slate-900 px-4 py-3 rounded-xl text-sm font-bold w-full cursor-pointer transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                <Github className="w-5 h-5" />
                                Login with GitHub
                            </button>
                        </div>
                    </div>
                </>
            )}
        </nav>
    );
}

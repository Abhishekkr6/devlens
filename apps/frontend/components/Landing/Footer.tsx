"use client";

import React from "react";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-background border-t border-border py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                    <img src="/logo.svg" alt="DevLens" className="w-9 h-9" />
                    <span className="font-bold text-text-primary">DevLens</span>
                </div>

                <p className="text-text-secondary text-sm">
                    © {new Date().getFullYear()} DevLens. Built for engineers.
                </p>

                <div className="flex flex-wrap justify-center gap-6 text-sm text-text-secondary">
                    <Link href="/privacy" className="hover:text-text-primary transition-colors">
                        Privacy
                    </Link>
                    <Link href="/terms" className="hover:text-text-primary transition-colors">
                        Terms
                    </Link>
                    <Link href="/github" className="hover:text-text-primary transition-colors">
                        GitHub
                    </Link>
                    <a href="mailto:support.devlens@gmail.com" className="hover:text-text-primary transition-colors flex items-center gap-1">
                        Contact
                    </a>
                </div>
            </div>
        </footer>
    );
}

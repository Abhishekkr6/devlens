"use client";

import React from "react";
import Link from "next/link";
import { Activity } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-background border-t border-border py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                    <div className="bg-white text-slate-900 p-1 rounded-md">
                        <Activity className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-text-primary">TeamPulse</span>
                </div>

                <p className="text-text-secondary text-sm">
                    © {new Date().getFullYear()} TeamPulse. Built for engineers.
                </p>

                <div className="flex gap-6 text-sm text-text-secondary">
                    <Link href="/privacy" className="hover:text-text-primary transition-colors">
                        Privacy
                    </Link>
                    <Link href="/terms" className="hover:text-text-primary transition-colors">
                        Terms
                    </Link>
                    <Link href="/github" className="hover:text-text-primary transition-colors">
                        GitHub
                    </Link>
                </div>
            </div>
        </footer>
    );
}

"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "../../components/Landing/Navbar";
import { Footer } from "../../components/Landing/Footer";
import { Github, ArrowRight, Code2 } from "lucide-react";
import { Button } from "../../components/Ui/Button";

export default function GitHubPage() {
    return (
        <main className="min-h-screen bg-background text-text-primary pt-24">
            <Navbar />

            {/* Hero Section */}
            <section className="py-20 text-center px-4">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl mb-4">
                        <Github className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                        Built for Developers, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-slate-100">Open for Everyone.</span>
                    </h1>
                    <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
                        DevLens is proudly open source. We believe in transparency, community collaboration, and building tools that developers love to use and improve.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <a href="https://github.com/Abhishekkr6/DevLens" target="_blank" rel="noopener noreferrer">
                            <Button className="border border-slate-800 h-12 px-8 text-base text-slate-900 cursor-pointer">
                                <Github className="mr-2 w-5 h-5" /> Star on GitHub
                            </Button>
                        </a>
                        <Link href="/how-it-works">
                            <Button variant="secondary" className="h-12 px-8 text-base border border-slate-800 bg-slate-900/50 hover:bg-slate-800 cursor-pointer">
                                How Integration Works
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats / Community Section */}
            <section className="py-16 bg-surface/30 border-y border-border">
                <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8 text-center">
                    <div className="p-6">
                        <div className="text-4xl font-bold text-text-primary mb-2">100%</div>
                        <div className="text-text-secondary font-medium">Open Source Code</div>
                    </div>
                    <div className="p-6">
                        <div className="text-4xl font-bold text-text-primary mb-2">MIT</div>
                        <div className="text-text-secondary font-medium">Licensed for Freedom</div>
                    </div>
                    <div className="p-6">
                        <div className="text-4xl font-bold text-text-primary mb-2">Community</div>
                        <div className="text-text-secondary font-medium">Driven Development</div>
                    </div>
                </div>
            </section>

            {/* Deployment Section */}
            <section className="py-24 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl border border-slate-800 p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 shadow-2xl">
                        <div className="flex-1 space-y-6">
                            <h2 className="text-3xl font-bold text-white">Self-Host in Minutes</h2>
                            <p className="text-slate-400 text-lg">
                                Prefer to keep your data on your own infrastructure? You can deploy DevLens via Docker or Kubernetes with a single command.
                            </p>
                            <div className="bg-black/50 rounded-xl p-4 font-mono text-sm text-emerald-400 border border-slate-800 overflow-x-auto">
                                git clone https://github.com/Abhishekkr6/DevLens.git<br />
                                cd DevLens && docker-compose up -d
                            </div>
                            <div className="pt-2">
                                <a href="https://github.com/Abhishekkr6/DevLens" target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:text-indigo-400 transition-colors inline-flex items-center">
                                    Read Deployment Docs <ArrowRight className="ml-2 w-4 h-4" />
                                </a>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
                            <Code2 className="w-48 h-48 text-indigo-500 relative z-10 opacity-80" />
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

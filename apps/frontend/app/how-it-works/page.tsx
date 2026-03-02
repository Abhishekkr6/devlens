"use client";

import React from "react";
import Link from "next/link";
import { Activity, Github, Cpu, Radio, BarChart3, ArrowRight } from "lucide-react";
import { Button } from "../../components/Ui/Button";
import { Navbar } from "../../components/Landing/Navbar";



export default function HowItWorksPage() {
    return (
        <main className="min-h-screen bg-background pt-24 text-text-primary">
            <Navbar />

            <section className="py-20 text-center px-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                        From Commit to Insight <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">in Milliseconds</span>
                    </h1>
                    <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
                        DevLens processes thousands of engineering events per second to give you real-time visibility without slowing down your workflow.
                    </p>
                </div>
            </section>

            {/* Workflow Steps */}
            <section className="py-12 px-4 relative">
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-border -z-10 hidden md:block" />

                <div className="max-w-5xl mx-auto space-y-24">
                    <Step
                        number="01"
                        align="left"
                        title="Connect your Repository"
                        desc="One-click integration with GitHub. We automatically install webhooks with granular permission scopes. No heavy CI/CD configuration required."
                        icon={Github}
                    />
                    <Step
                        number="02"
                        align="right"
                        title="Event Capture & Queuing"
                        desc="Webhooks are instantly captured and pushed to our high-throughput Redis event queue. Your workflow is never blocked, ensuring 100% reliability."
                        icon={Radio}
                    />
                    <Step
                        number="03"
                        align="left"
                        title="Worker Processing"
                        desc="Our distributed graph of worker nodes picks up events, analyzes code complexity, calculates risk scores, and updates developer metrics in parallel."
                        icon={Cpu}
                    />
                    <Step
                        number="04"
                        align="right"
                        title="Live Dashboard Updates"
                        desc="Insights are pushed to the frontend via WebSockets. The moment a PR is merged, your velocity metrics reflect it instantly."
                        icon={BarChart3}
                    />
                </div>
            </section>

            {/* CTA */}
            <section className="py-32 text-center">
                <div className="max-w-xl mx-auto px-4 space-y-8 p-12 bg-surface/30 rounded-3xl border border-border">
                    <h2 className="text-3xl font-bold">See the magic yourself</h2>
                    <p className="text-text-secondary text-lg">Try our interactive demo with simulated real-time data.</p>
                    <Link href="/demo" className="inline-block">
                        <Button className="cursor-pointer h-14 px-8 text-lg w-full sm:w-auto shadow-xl shadow-brand/20">
                            Launch Interactive Demo <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                </div>
            </section>
        </main>
    );
}

function Step({ number, align, title, desc, icon: Icon }: { number: string, align: 'left' | 'right', title: string, desc: string, icon: any }) {
    return (
        <div className={`flex flex-col md:flex-row items-center gap-12 ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>
            <div className="flex-1 text-center md:text-left space-y-4 relative">
                <div className={`hidden md:flex items-center absolute top-8 ${align === 'left' ? '-right-[53px]' : '-left-[53px]'}`}>
                    <div className="w-4 h-4 rounded-full bg-brand border-4 border-background" />
                    <div className={`h-0.5 w-12 bg-border ${align === 'left' ? '' : '-order-1'}`} />
                </div>
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface border border-border text-brand font-bold text-xl mb-4 shadow-lg ${align === 'right' && 'md:ml-auto'}`}>
                    {number}
                </div>
                <h3 className={`text-3xl font-bold text-text-primary ${align === 'right' && 'md:text-right'}`}>{title}</h3>
                <p className={`text-text-secondary text-lg leading-relaxed ${align === 'right' && 'md:text-right'}`}>{desc}</p>
            </div>

            <div className="flex-1 w-full bg-surface border border-border rounded-2xl h-[300px] flex items-center justify-center p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Icon className="w-32 h-32 text-slate-700/50 group-hover:text-brand/20 transition-colors duration-500 scale-110" />
            </div>
        </div>
    )
}

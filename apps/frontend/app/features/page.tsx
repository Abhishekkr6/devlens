"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/Landing/Navbar";
import { Activity, ShieldAlert, Zap, Cpu, GitCommit, GitPullRequest, LayoutDashboard, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "../../components/Ui/Button";


export default function FeaturesPage() {
    const router = useRouter();

    const handleLogin = () => {
        window.location.href = "/auth/github/login";
    };

    return (
        <main className="min-h-screen bg-background pt-24 text-text-primary">
            <Navbar />

            {/* Hero */}
            <section className="py-20 text-center px-4">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider mx-auto border border-indigo-500/20">
                        <Zap className="w-3 h-3" />
                        Comprehensive Toolset
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                        Everything you need to build <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">High-Performance Teams</span>
                    </h1>
                    <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
                        TeamPulse aggregates data from your entire engineering stack to provide actionable insights, automated risk detection, and real-time velocity metrics.
                    </p>
                </div>
            </section>

            {/* Main Grid */}
            <section className="py-16 px-4">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={ShieldAlert}
                        title="Risk Detection"
                        desc="Automatically identify high-risk pull requests based on size, complexity, and file patterns before they merge."
                        color="rose"
                    />
                    <FeatureCard
                        icon={Activity}
                        title="Velocity Tracking"
                        desc="Measure team throughput and cycle time without manual reporting. Spot bottlenecks instantly."
                        color="emerald"
                    />
                    <FeatureCard
                        icon={GitCommit}
                        title="Commit Analytics"
                        desc="Deep dive into commit habits. See who is overworking, who needs help, and code churn trends."
                        color="blue"
                    />
                    <FeatureCard
                        icon={Cpu}
                        title="Technical Debt"
                        desc="Track legacy code interaction and refactoring efforts over time. Keep your codebase healthy."
                        color="amber"
                    />
                    <FeatureCard
                        icon={GitPullRequest}
                        title="Review Efficiency"
                        desc="Monitor PR pickup times and review depth. Ensure code reviews are thorough yet fast."
                        color="purple"
                    />
                    <FeatureCard
                        icon={LayoutDashboard}
                        title="Real-time Dashboard"
                        desc="A live view of your engineering floor. See every merge, build, and deployment as it happens."
                        color="cyan"
                    />
                </div>
            </section>

            {/* Deep Dive Section */}
            <section className="py-24 bg-surface/50 border-y border-border">
                <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <h2 className="text-3xl font-bold">Engineered for Scale</h2>
                        <div className="space-y-6">
                            <Point title="Zero-Config Integration" desc="Connect your GitHub organization in seconds. We handle webhooks, permissions, and historical data backfilling securely." />
                            <Point title="Enterprise Grade Security" desc="SOC2 compliant infrastructure. Your code never leaves your secure environment; we only analyze metadata." />
                            <Point title="Customizable Alerts" desc="Set thresholds for PR size, review time, and more. Get notified via Slack or Email when metrics slip." />
                        </div>
                    </div>
                    {/* Visual Placeholder */}
                    <div className="relative h-[500px] bg-background border border-border rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
                        <div className="text-center p-8 relative z-10">
                            <div className="w-24 h-24 bg-surface rounded-2xl border border-border flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500">
                                <Cpu className="w-10 h-10 text-text-secondary" />
                            </div>
                            <h3 className="text-lg font-semibold text-text-primary">Powered by</h3>
                            <p className="text-sm text-text-secondary">Distributed Worker Grid</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 text-center">
                <div className="max-w-2xl mx-auto px-4 space-y-8">
                    <h2 className="text-3xl md:text-4xl font-bold">Ready to optimize your workflow?</h2>
                    <p className="text-text-secondary text-lg">Join 500+ engineering teams buildling better software with TeamPulse.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

                        <Button
                            onClick={handleLogin}
                            className="cursor-pointer h-12 px-8 text-base">Start Free Trial</Button>


                        <Button
                            onClick={() => router.push('/demo')}
                            className="cursor-pointer h-12 px-8 text-base border border-border">View Live Demo</Button>

                    </div>
                </div>
            </section>
        </main>
    );
}

function FeatureCard({ icon: Icon, title, desc, color }: { icon: any, title: string, desc: string, color: string }) {
    const colors: Record<string, string> = {
        rose: "text-rose-400 bg-rose-400/10",
        emerald: "text-emerald-400 bg-emerald-400/10",
        blue: "text-blue-400 bg-blue-400/10",
        amber: "text-amber-400 bg-amber-400/10",
        purple: "text-purple-400 bg-purple-400/10",
        cyan: "text-cyan-400 bg-cyan-400/10",
    };

    return (
        <div className="p-6 rounded-2xl bg-surface border border-border hover:border-text-secondary/20 transition-all hover:-translate-y-1 hover:shadow-lg group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${colors[color]}`}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-3">{title}</h3>
            <p className="text-text-secondary leading-relaxed">{desc}</p>
        </div>
    )
}

function Point({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="flex gap-4">
            <div className="mt-1">
                <CheckCircle2 className="w-6 h-6 text-brand" />
            </div>
            <div>
                <h4 className="font-bold text-text-primary text-lg">{title}</h4>
                <p className="text-text-secondary mt-1">{desc}</p>
            </div>
        </div>
    )
}

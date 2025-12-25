"use client";

import { motion } from "motion/react";
import { ShieldAlert, Activity, CheckCircle2 } from "lucide-react";

export function HeroVisual() {
    return (
        <div className="relative z-10 w-full font-sans">
            {/* Main Card */}
            <div className="relative z-10 bg-background/80 dark:bg-background/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-border p-6 w-full max-w-lg mx-auto rotate-1 transition-transform hover:rotate-0 duration-500">

                {/* Top Header - Activity Icon */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
                        <Activity className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold text-text-primary tracking-tight">TeamPulse</span>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: "Open PRs", value: "8" },
                        { label: "Active Developers", value: "17" },
                        { label: "Commits Today", value: "24" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-surface p-4 rounded-xl border border-border">
                            <p className="text-[10px] sm:text-xs font-medium text-text-secondary mb-1">{stat.label}</p>
                            <p className="text-xl sm:text-2xl font-bold text-text-primary">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Risk Overview Section */}
                <div className="mb-8 p-1">
                    <p className="text-sm font-semibold text-text-primary mb-4">PR Risk Overview</p>

                    {/* Risk Bar */}
                    <div className="h-3 w-full bg-surface rounded-full flex overflow-hidden mb-3">
                        <div className="w-[30%] bg-emerald-400 rounded-l-full" />
                        <div className="w-[45%] bg-amber-400 border-l-2 border-background" />
                        <div className="w-[15%] bg-rose-500 border-l-2 border-background" />
                        <div className="w-[10%] bg-surface border-l-2 border-background" />
                    </div>

                    {/* Risk Legend */}
                    <div className="flex items-center gap-6 text-xs text-text-secondary">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>Low 2</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                            <span>Med 4</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-rose-500" />
                            <span>High 2</span>
                        </div>
                    </div>
                </div>

                {/* Activity Feed mockup */}
                <div className="space-y-4 relative">
                    {/* Fake List Items */}
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 py-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            <div className="flex-1 space-y-2">
                                <div className="h-2 w-3/4 bg-surface rounded-full" />
                                {i === 1 && <div className="h-2 w-1/2 bg-surface rounded-full" />}
                            </div>
                        </div>
                    ))}

                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />

                    {/* Floating Alert Toast */}
                    <motion.div
                        initial={{ opacity: 0, x: 20, y: 0 }}
                        animate={{ opacity: 1, x: 0, y: -20 }}
                        transition={{ duration: 0.6, delay: 0.5, type: "spring" }}
                        className="absolute right-0 bottom-8 z-20 bg-background p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-border flex items-center gap-4 w-64"
                    >
                        <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center shrink-0">
                            <ShieldAlert className="w-5 h-5 text-rose-500" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-text-primary">High Risk PR Detected</p>
                            <p className="text-xs text-text-secondary">Just now</p>
                        </div>
                    </motion.div>

                </div>

                {/* Bottom Status */}
                <div className="mt-8 flex items-center gap-2 text-xs text-text-secondary">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    Processing GitHub events...
                </div>

            </div>
        </div>
    );
}

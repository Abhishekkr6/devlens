"use client";

import { motion } from "motion/react";
import { GitCommit } from "lucide-react";

export function CommitTrackingVisual() {
    const commits = [
        { message: "fix: update auth middleware", author: "alex", time: "just now" },
        { message: "feat: add real-time websocket", author: "sarah", time: "2m ago" },
        { message: "style: improve dashboard ui", author: "mike", time: "5m ago" },
        { message: "chore: update dependencies", author: "anna", time: "12m ago" },
    ];

    return (
        <div className="w-full h-full font-sans bg-background rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
            {/* Header with Pulse */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 dark:bg-indigo-500/20 p-1.5 rounded-lg">
                        <GitCommit className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
                    </div>
                    <h3 className="text-sm font-bold text-text-primary">Real-time Tracking</h3>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Live</span>
                </div>
            </div>

            {/* Content - Commit List */}
            <div className="flex-1 p-0">
                <div className="divide-y divide-border">
                    {commits.map((commit, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.15 }}
                            className="px-6 py-4 flex items-start gap-3 hover:bg-surface transition-colors"
                        >
                            <img
                                src={`https://i.pravatar.cc/150?u=${commit.author}`}
                                alt={commit.author}
                                className="w-8 h-8 rounded-full border border-border shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-primary truncate">
                                    {commit.message}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <p className="text-xs text-text-secondary">{commit.author}</p>
                                    <span className="text-text-secondary text-[10px]">•</span>
                                    <p className="text-xs text-text-secondary">{commit.time}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="px-6 py-3 bg-surface border-t border-border">
                <p className="text-xs text-text-secondary">
                    Watch commits and PRs flow in as they happen.
                </p>
            </div>
        </div>
    );
}

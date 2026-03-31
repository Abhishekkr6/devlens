"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert, GitPullRequest, Search, Zap } from "lucide-react";

export function HeroVisual() {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setStep((s) => (s + 1) % 3);
        }, 3500); // Wait 3.5s per step
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative z-10 w-full font-sans h-[380px] bg-background/60 backdrop-blur-2xl overflow-hidden flex flex-col pointer-events-none rounded-2xl border border-border shadow-2xl">
            {/* Fake Safari/Browser Header */}
            <div className="w-full bg-surface border-b border-border px-4 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80 shadow-sm" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-sm" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-sm" />
                </div>
                <div className="flex-1 mx-4 bg-background border border-border rounded-lg px-4 py-1.5 text-xs font-mono text-slate-500 flex items-center gap-2 shadow-inner">
                    <Search className="w-3.5 h-3.5" /> github.com/organization/api-service/pulls
                </div>
            </div>

            <div className="flex-1 relative p-6 md:p-8 bg-[radial-gradient(circle_at_center,rgba(74,93,255,0.03),transparent)]">
                <AnimatePresence mode="wait">
                    {/* STEP 1: PR Opened */}
                    {step === 0 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col gap-5 h-full justify-center"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                    <GitPullRequest className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">Feature: Complex memory optimization</h3>
                                    <p className="text-xs text-slate-400">#412 opened securely via CLI</p>
                                </div>
                            </div>
                            <div className="bg-surface rounded-xl border border-border p-5 space-y-3">
                                <div className="flex gap-3 items-center">
                                    <img src="https://i.pravatar.cc/100?u=dev1" className="w-6 h-6 rounded-full" />
                                    <div className="h-2 w-1/3 bg-slate-700/50 rounded-full" />
                                </div>
                                <div className="h-2 w-full bg-slate-800/50 rounded-full" />
                                <div className="h-2 w-3/4 bg-slate-800/50 rounded-full" />
                            </div>
                            <div className="text-xs font-medium text-emerald-400 flex items-center gap-2 mt-2 bg-emerald-500/10 px-3 py-2 rounded-lg w-fit">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Waiting for status checks...
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: DevLens Scanning */}
                    {step === 1 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col items-center justify-center h-full gap-5"
                        >
                            <div className="w-20 h-20 rounded-2xl bg-brand/10 border border-brand/40 shadow-[0_0_30px_rgba(74,93,255,0.2)] flex items-center justify-center relative">
                                <div className="absolute inset-0 border-2 border-brand/50 rounded-2xl animate-ping opacity-30" />
                                <img src="/logo.svg" className="w-14 h-14 animate-pulse drop-shadow-lg" alt="DevLens" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-extrabold text-white tracking-tight">DevLens AI Scanning</h3>
                                <p className="text-xs text-slate-400 mt-1">Analyzing 42 changed files + execution context...</p>
                            </div>
                            <div className="w-64 h-1.5 bg-surface rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                    className="h-full bg-gradient-to-r from-brand to-purple-500 shadow-[0_0_10px_rgba(74,93,255,0.5)]"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 2.5, ease: "linear" }}
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: Risk Caught */}
                    {step === 2 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="flex flex-col gap-4 h-full justify-center"
                        >
                            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 flex items-start gap-4 shadow-[0_20px_40px_rgba(244,63,94,0.1)] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-2xl rounded-full" />
                                <div className="bg-rose-500/20 p-2.5 rounded-xl border border-rose-500/20">
                                    <ShieldAlert className="w-7 h-7 text-rose-400" />
                                </div>
                                <div className="relative z-10">
                                    <h4 className="text-rose-400 font-extrabold text-lg mb-1 tracking-tight">High-Risk Bug Blocked!</h4>
                                    <p className="text-sm text-slate-300 leading-relaxed mb-4">
                                        DevLens detected an unhandled Promise rejection in <code className="bg-rose-950/80 text-rose-200 border border-rose-500/20 px-1.5 py-0.5 rounded ml-0.5 text-xs font-mono">auth.ts</code> that would cause a runtime crash on production.
                                    </p>
                                    <div className="flex gap-3">
                                        <button className="bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)] text-xs font-bold px-4 py-2 rounded-xl transition-colors">
                                            Auto-Fix Code
                                        </button>
                                        <button className="bg-surface hover:bg-surface/80 text-white text-xs font-bold px-4 py-2 rounded-xl border border-border transition-colors">
                                            View Diff
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                                className="bg-brand/10 border border-brand/30 rounded-xl p-4 flex items-center gap-3 backdrop-blur-md"
                            >
                                <Zap className="w-5 h-5 text-brand" />
                                <div>
                                    <p className="text-sm text-brand/90 font-bold">Developer Velocity Protected</p>
                                    <p className="text-xs text-slate-400">Estimated 4 hours of debugging prevented.</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

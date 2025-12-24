"use client";

import { motion } from "motion/react";
import { Github, Webhook, Layers, Cpu, LayoutDashboard, CheckCircle2 } from "lucide-react";

export function WorkerArchitectureVisual() {
    return (
        <div className="w-full h-full min-h-[320px] font-sans bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col relative">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-1.5 rounded-lg">
                        <Cpu className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Worker Architecture</h3>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100">
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">Async</span>
                </div>
            </div>

            {/* Flow Diagram */}
            <div className="flex-1 flex flex-col justify-center p-4 relative">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10 px-2">

                    {/* GitHub */}
                    <Node icon={Github} label="GitHub" delay={0} />
                    <FlowArrow delay={0} />

                    {/* Webhook */}
                    <Node icon={Webhook} label="Webhook" delay={0.5} />
                    <FlowArrow delay={0.5} />

                    {/* Workers */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="relative">
                            <motion.div
                                animate={{ y: [0, -4, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg z-10 relative"
                            >
                                <Cpu className="w-5 h-5" />
                            </motion.div>
                            <div className="absolute top-1 -right-1 w-10 h-10 bg-indigo-400 rounded-lg -z-10 opacity-50" />
                        </div>
                        <span className="text-[10px] font-semibold text-slate-600">Processing</span>
                    </div>
                    <FlowArrow delay={1} />

                    {/* Dashboard */}
                    <Node icon={LayoutDashboard} label="Dash" delay={1.5} />
                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Badge text="No dropped events" color="emerald" />
                    <Badge text="100% Reliability" color="blue" />
                </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100">
                <p className="text-xs text-slate-500">
                    Heavy processing happens in the background.
                </p>
            </div>
        </div>
    );
}

function Node({ icon: Icon, label }: { icon: any, label: string, delay: number }) {
    return (
        <div className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-700 shadow-sm">
                <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold text-slate-500">{label}</span>
        </div>
    )
}

function FlowArrow({ delay }: { delay: number }) {
    return (
        <div className="hidden md:flex flex-1 items-center justify-center text-slate-300 relative px-1">
            <div className="h-0.5 w-full bg-slate-100 rounded-full overflow-hidden max-w-[40px]">
                <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 1, repeat: Infinity, delay: delay, ease: "linear", repeatDelay: 0.5 }}
                    className="h-full w-full bg-indigo-400"
                />
            </div>
        </div>
    );
}

function Badge({ text, color }: { text: string, color: string }) {
    const colors: Record<string, string> = {
        emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
        blue: "bg-blue-50 text-blue-700 border-blue-100",
    }
    return (
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${colors[color]} shadow-sm`}>
            <CheckCircle2 className="w-3 h-3" />
            <span className="text-[10px] font-medium">{text}</span>
        </div>
    )
}

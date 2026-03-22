"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Navbar } from "../../components/Landing/Navbar";
import { Github, Cpu, Radio, BarChart3, ArrowRight } from "lucide-react";

function Step({
  number, align, title, desc, icon: Icon, delay = 0
}: {
  number: string; align: "left" | "right"; title: string; desc: string; icon: any; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px" }}
      transition={{ duration: 0.6, delay }}
      className={`flex flex-col md:flex-row items-center gap-8 md:gap-14 ${align === "right" ? "md:flex-row-reverse" : ""}`}
    >
      {/* Text */}
      <div className="flex-1 text-center md:text-left space-y-4 relative">
        {/* Timeline dot */}
        <div className={`hidden md:flex items-center absolute top-8 ${align === "left" ? "-right-[53px]" : "-left-[53px]"}`}>
          <div className="w-4 h-4 rounded-full bg-brand border-4 border-background shadow-[0_0_10px_rgba(74,93,255,0.6)]" />
          <div className={`h-0.5 w-12 bg-border ${align === "left" ? "" : "-order-1"}`} />
        </div>

        <div className={`inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-surface border border-border text-brand font-black text-xl md:text-2xl mb-2 shadow-sm ${align === "right" ? "md:ml-auto" : ""}`}>
          {number}
        </div>
        <h3 className={`text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight ${align === "right" ? "md:text-right" : ""}`}>{title}</h3>
        <p className={`text-text-secondary text-base md:text-lg leading-relaxed font-light ${align === "right" ? "md:text-right" : ""}`}>{desc}</p>
      </div>

      {/* Visual Box */}
      <div className="flex-1 w-full bg-surface rounded-2xl md:rounded-3xl h-[220px] md:h-[300px] flex items-center justify-center border border-border shadow-sm relative overflow-hidden group hover:border-brand/30 transition-colors duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <Icon className="w-20 h-20 md:w-28 md:h-28 text-border group-hover:text-brand/30 transition-colors duration-500" />
      </div>
    </motion.div>
  );
}

export default function HowItWorksPage() {
  const steps = [
    { number: "01", align: "left"  as const, title: "Connect your Repository",     icon: Github,   desc: "One-click integration with GitHub. We automatically install webhooks with granular permission scopes. No heavy CI/CD configuration required." },
    { number: "02", align: "right" as const, title: "Event Capture & Queuing",      icon: Radio,    desc: "Webhooks are instantly captured and pushed to our high-throughput Redis event queue. Your workflow is never blocked, ensuring 100% reliability." },
    { number: "03", align: "left"  as const, title: "Worker Processing",            icon: Cpu,      desc: "Our distributed graph of worker nodes picks up events, analyzes complexity, calculates risk scores, and updates developer metrics in parallel." },
    { number: "04", align: "right" as const, title: "Live Dashboard Updates",       icon: BarChart3, desc: "Insights are pushed to the frontend via WebSockets. The moment a PR is merged, your velocity metrics reflect it instantly." },
  ];

  return (
    <main className="min-h-screen bg-background pt-24 text-text-primary">
      <Navbar />

      {/* Hero */}
      <section className="py-20 md:py-24 text-center px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs md:text-sm font-semibold"
          >
            <BarChart3 className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Under the Hood
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1]"
          >
            From Commit to Insight{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              in Milliseconds
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed font-light"
          >
            DevLens processes thousands of engineering events per second to give you real-time visibility without slowing down your workflow.
          </motion.p>
        </div>
      </section>

      {/* Workflow Steps */}
      <section className="py-8 md:py-12 px-4 relative">
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-border -z-10 hidden md:block" />
        <div className="max-w-5xl mx-auto space-y-16 md:space-y-24">
          {steps.map((s, i) => (
            <Step key={i} {...s} delay={i * 0.1} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-xl mx-auto space-y-7 py-14 md:py-16 bg-surface/50 rounded-3xl md:rounded-[3rem] border border-border/80 shadow-lg px-8"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">See the magic yourself</h2>
          <p className="text-text-secondary text-base md:text-lg font-light">Try our interactive demo with simulated real-time data.</p>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 bg-text-primary text-background hover:bg-slate-200 px-8 py-4 rounded-2xl font-bold text-base md:text-lg transition-all active:scale-95 shadow-md"
          >
            Launch Interactive Demo <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>
    </main>
  );
}

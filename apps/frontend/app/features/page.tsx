"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Navbar } from "../../components/Landing/Navbar";
import {
  Activity, ShieldAlert, Zap, Cpu, GitCommit, GitPullRequest,
  LayoutDashboard, CheckCircle2, Sparkles, Github, ArrowRight
} from "lucide-react";

const colorMap: Record<string, { icon: string; bg: string; glow: string }> = {
  rose:    { icon: "text-rose-400",    bg: "bg-rose-400/10 border-rose-400/20",    glow: "group-hover:shadow-rose-400/10"    },
  emerald: { icon: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20", glow: "group-hover:shadow-emerald-400/10" },
  blue:    { icon: "text-blue-400",    bg: "bg-blue-400/10 border-blue-400/20",    glow: "group-hover:shadow-blue-400/10"    },
  amber:   { icon: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/20",   glow: "group-hover:shadow-amber-400/10"   },
  purple:  { icon: "text-purple-400",  bg: "bg-purple-400/10 border-purple-400/20",  glow: "group-hover:shadow-purple-400/10"  },
  cyan:    { icon: "text-cyan-400",    bg: "bg-cyan-400/10 border-cyan-400/20",    glow: "group-hover:shadow-cyan-400/10"    },
};

function FeatureCard({ icon: Icon, title, desc, color, delay = 0 }: {
  icon: any; title: string; desc: string; color: string; delay?: number;
}) {
  const c = colorMap[color] ?? colorMap.purple;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px" }}
      transition={{ duration: 0.5, delay }}
      className={`group p-6 md:p-8 rounded-2xl md:rounded-3xl bg-surface/50 border border-border hover:border-border/80 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${c.glow} relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      <div className={`relative z-10 w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-5 md:mb-6 border ${c.bg} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-6 h-6 md:w-7 md:h-7 ${c.icon}`} />
      </div>
      <h3 className="relative z-10 text-lg md:text-xl font-bold text-text-primary mb-2 md:mb-3">{title}</h3>
      <p className="relative z-10 text-text-secondary text-sm md:text-base leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function Point({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex gap-4 group">
      <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center group-hover:bg-brand/30 transition-colors">
        <CheckCircle2 className="w-4 h-4 text-brand" />
      </div>
      <div>
        <h4 className="font-bold text-text-primary text-base md:text-lg mb-1">{title}</h4>
        <p className="text-text-secondary text-sm md:text-base leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  const router = useRouter();
  const handleLogin = () => { window.location.href = "/auth/github/login"; };

  const features = [
    { icon: Sparkles,       title: "AI-Powered Analysis",  desc: "Leverage Gemini AI for intelligent code reviews, quality metrics, bug prediction, and security vulnerability detection.", color: "purple", delay: 0    },
    { icon: ShieldAlert,    title: "Risk Detection",        desc: "Automatically identify high-risk pull requests based on size, complexity, and file patterns before they merge.",            color: "rose",   delay: 0.05  },
    { icon: Activity,       title: "Velocity Tracking",     desc: "Measure team throughput and cycle time without manual reporting. Spot bottlenecks instantly.",                             color: "emerald",delay: 0.1   },
    { icon: GitCommit,      title: "Commit Analytics",      desc: "Deep dive into commit habits. See who is overworking, who needs help, and code churn trends.",                            color: "blue",   delay: 0.15  },
    { icon: Cpu,            title: "Technical Debt",        desc: "Track legacy code interaction and refactoring efforts over time. Keep your codebase healthy.",                             color: "amber",  delay: 0.2   },
    { icon: GitPullRequest, title: "Review Efficiency",     desc: "Monitor PR pickup times and review depth. Ensure code reviews are thorough yet fast.",                                   color: "purple", delay: 0.25  },
    { icon: LayoutDashboard, title: "Real-time Dashboard",  desc: "A live view of your engineering floor. See every merge, build, and deployment as it happens.",                            color: "cyan",   delay: 0.3   },
  ];

  return (
    <main className="min-h-screen bg-background pt-24 text-text-primary">
      <Navbar />

      {/* Hero */}
      <section className="py-20 md:py-24 text-center px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-brand/15 rounded-full blur-[100px] -z-10 pointer-events-none" />
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs md:text-sm font-semibold"
          >
            <Zap className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Comprehensive Toolset
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1]"
          >
            Everything you need to build{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-purple-400 to-pink-400">
              High-Performance Teams
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed font-light"
          >
            DevLens aggregates data from your entire engineering stack to provide actionable insights, automated risk detection, and real-time velocity metrics.
          </motion.p>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="pb-20 md:pb-24 px-4">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
          {features.map((f, i) => (
            <FeatureCard key={i} icon={f.icon} title={f.title} desc={f.desc} color={f.color} delay={f.delay} />
          ))}
        </div>
      </section>

      {/* Deep Dive */}
      <section className="py-20 md:py-28 px-4 bg-surface border-y border-border/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[80px] -z-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Engineered for Scale</h2>
            <div className="space-y-8">
              <Point title="Zero-Config Integration" desc="Connect your GitHub organization in seconds. We handle webhooks, permissions, and historical data backfilling securely." />
              <Point title="Enterprise Grade Security" desc="SOC2 compliant infrastructure. Your code never leaves your secure environment; we only analyze metadata." />
              <Point title="Customizable Alerts" desc="Set thresholds for PR size, review time, and more. Get notified when metrics slip." />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-[320px] md:h-[500px] bg-background border border-border rounded-2xl md:rounded-3xl overflow-hidden flex items-center justify-center group hover:border-brand/30 transition-colors duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="text-center p-8 relative z-10">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-surface rounded-2xl border border-border flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 group-hover:border-brand/30 transition-all duration-500">
                <Cpu className="w-9 h-9 md:w-10 md:h-10 text-brand" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-text-primary">Powered by</h3>
              <p className="text-sm md:text-base text-text-secondary mt-1">Distributed Worker Grid</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,93,255,0.08),transparent_60%)] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto px-4 space-y-8 py-14 md:py-16 bg-surface/50 rounded-3xl md:rounded-[3rem] border border-border/80 shadow-lg mx-4"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Ready to optimize your workflow?</h2>
          <p className="text-text-secondary text-base md:text-lg font-light">Join engineering teams building better software with DevLens.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 bg-text-primary text-background hover:bg-slate-200 px-8 py-3.5 rounded-2xl font-bold text-base md:text-lg transition-all active:scale-95 shadow-md cursor-pointer"
            >
              <Github className="w-5 h-5" /> Start Free Trial
            </button>
            <button
              onClick={() => router.push('/demo')}
              className="flex items-center gap-2 bg-surface border border-border text-text-primary hover:border-brand/40 px-8 py-3.5 rounded-2xl font-medium text-base md:text-lg transition-all cursor-pointer"
            >
              View Live Demo <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

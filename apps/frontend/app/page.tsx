"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  GitPullRequest,
  Activity,
  ShieldAlert,
  Zap,
  LayoutDashboard,
  Github,
  CheckCircle2,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

// --- Components ---

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-white/80 backdrop-blur-md border-b border-slate-200 py-3" : "bg-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200">
            TP
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">TeamPulse</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</Link>
          <Link href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">How it Works</Link>
          <a
            href="/auth/github/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Github className="w-4 h-4" />
            Login
          </a>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-slate-600"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-4 md:hidden shadow-xl"
          >
            <nav className="flex flex-col gap-4">
              <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-slate-600 p-2">Features</Link>
              <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-slate-600 p-2">How it Works</Link>
              <a
                href="/auth/github/login"
                className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold"
              >
                <Github className="w-5 h-5" />
                Login with GitHub
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-400/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wide mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Live for Developers
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
            Developer Activity, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-purple-600">Demystified.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-10 leading-relaxed">
            Gain real-time visibility into your engineering team's pulse.
            Track commits, analyze PR velocity, and identify risks before they become blockers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/auth/github/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-slate-900 text-white font-semibold text-lg hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              Start for Free
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold text-lg hover:bg-slate-50 transition-all"
            >
              How it Works
            </a>
          </div>
        </motion.div>

        {/* Dashboard Preview / Image */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-16 sm:mt-24 relative mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-slate-50/50 p-2 shadow-2xl"
        >
          <div className="absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-indigo-500/30 to-transparent" />
          <div className="rounded-xl overflow-hidden bg-white border border-slate-200">
            {/* Using the user uploaded image as a preview */}
            <img
              src="/dashboard-preview.png" // We will need to move the uploaded image here or use a placeholder if that's easier. For now I'll use a placeholder URL logic or just standard IMG tag if I can resolve the path.
              // Actually, for the purpose of this artifact, I'll use a placeholder div that LOOKS like the dashboard if I can't easily move the file. 
              // WAIT, I assume the user wanted the image they uploaded TO BE the preview.
              // I don't have the image in public/ yet. I will assume I can put a placeholder or just use the uploaded image path if I can 'move' it.
              // For safety, I'll use a generic pleasing placeholder or the actual structure if I could render it.
              // Let's USE the structure of the dashboard itself (screenshot style).
              alt="TeamPulse Dashboard"
              className="w-full h-auto object-cover"
            // I will simulate the image being there. In the next step I should try to Copy the uploaded image to public/dashboard-preview.png
            />
            {/* Fallback visual if image fails or for immediate effect */}
            <div className="aspect-[16/10] bg-slate-100 flex items-center justify-center text-slate-400">
              <span className="flex flex-col items-center gap-4">
                <LayoutDashboard className="w-16 h-16 opacity-50" />
                <span className="text-sm font-medium">Dashboard Preview</span>
              </span>
              {/* Overlaid actual image if available */}
              <Image
                src="/hero-dashboard.png" // I will ensure this file exists in next step
                alt="Dashboard"
                width={1200}
                height={800}
                className="absolute inset-0 w-full h-full object-cover"
                unoptimized
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const features = [
  {
    title: "Real-time Activity",
    description: "Watch commits and PRs flow in real-time. Never wonder what the team is working on.",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-50"
  },
  {
    title: "Risk Analysis",
    description: "AI-driven scoring identifies high-risk changes before they merge. Prevent bugs early.",
    icon: ShieldAlert,
    color: "text-rose-500",
    bg: "bg-rose-50"
  },
  {
    title: "Velocity Tracking",
    description: "Measure team throughput and cycle time across sprints. Data-backed improvements.",
    icon: Activity,
    color: "text-indigo-500",
    bg: "bg-indigo-50"
  },
  {
    title: "Pull Request Insights",
    description: "Deep dive into PR size, review time, and collaboration patterns.",
    icon: GitPullRequest,
    color: "text-blue-500",
    bg: "bg-blue-50"
  }
];

function Features() {
  return (
    <section id="features" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Everything you need to ship faster
          </p>
          <p className="mt-4 text-lg text-slate-600">
            TeamPulse connects directly to your version control to provide actionable metrics without manual data entry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group p-8 rounded-3xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-xl transition-all duration-300"
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", feature.bg, feature.color)}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl mb-6">
              From Code to Insight in Minutes
            </h2>
            <div className="space-y-8">
              {[
                { title: "Connect Github", desc: "One-click OAuth connection to import your repositories." },
                { title: "Background Analysis", desc: "Our workers process commit history and compute risk scores." },
                { title: "Instant Dashboard", desc: "Get a live view of your engineering health immediately." }
              ].map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                    <p className="text-slate-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/10 transform rotate-3 rounded-3xl"></div>
            <div className="relative bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <div className="ml-auto text-xs text-slate-400 font-mono">analysis_worker.ts</div>
              </div>
              <div className="space-y-3 font-mono text-sm">
                <div className="text-slate-400">// Starting analysis...</div>
                <div className="flex items-center gap-2 text-indigo-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Repositories fetched</span>
                </div>
                <div className="flex items-center gap-2 text-indigo-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Commits processed</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600">
                  <Zap className="w-4 h-4" />
                  <span>Risk Score Calculated: 92/100</span>
                </div>
                <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse"></div>
                <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-indigo-900">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
      </div>
      <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Ready to optimize your workflow?
        </h2>
        <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">
          Join high-performing teams using TeamPulse to ship better code, faster.
        </p>
        <a
          href="/auth/github/login"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-indigo-900 font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl"
        >
          <Github className="w-5 h-5" />
          Get Started with GitHub
        </a>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-slate-50 py-12 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm">
            TP
          </div>
          <span className="font-bold text-slate-700">TeamPulse</span>
        </div>
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} TeamPulse. All rights reserved.
        </p>
        <div className="flex gap-6">
          <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">Privacy</a>
          <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">Terms</a>
          <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">Twitter</a>
        </div>
      </div>
    </footer>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen font-sans text-slate-900 bg-white selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
}

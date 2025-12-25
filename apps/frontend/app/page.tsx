"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import {
  Github,
  Activity,
  GitPullRequest,
  Zap,
  ShieldAlert,
  LayoutDashboard,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  Code2,
  Cpu,
  GitCommit
} from "lucide-react";
import { HeroVisual } from "../components/Landing/HeroVisual";
import { CommitTrackingVisual } from "../components/Landing/FeatureVisuals/CommitTrackingVisual";
import { WorkerArchitectureVisual } from "../components/Landing/FeatureVisuals/WorkerArchitectureVisual";

// --- Components ---

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogin = () => {
    window.location.href = "/auth/github/login";
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-background/80 backdrop-blur-md border-b border-border py-3 shadow-sm"
        : "bg-transparent py-5"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 dark:bg-white p-1.5 rounded-lg">
            <Activity className="text-white dark:text-slate-900 w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-text-primary tracking-tight">
            TeamPulse
          </span>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-6">
          <button className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
            Features
          </button>
          <button className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
            How it works
          </button>
          <button
            onClick={handleLogin}
            className="flex items-center gap-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
          >
            <Github className="w-4 h-4" />
            Login with GitHub
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-text-secondary"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-5">
          <button className="text-left text-sm font-medium text-text-secondary">
            Features
          </button>
          <button className="text-left text-sm font-medium text-text-secondary">
            How it works
          </button>
          <button
            onClick={handleLogin}
            className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 rounded-lg text-sm font-medium w-full cursor-pointer"
          >
            <Github className="w-4 h-4" />
            Login with GitHub
          </button>
        </div>
      )}
    </nav>
  );
}

function Hero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  const handleLogin = () => {
    window.location.href = "/auth/github/login";
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-50/50 rounded-full blur-3xl opacity-60 mix-blend-multiply" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl opacity-60 mix-blend-multiply" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* Left Content */}
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-text-primary leading-[1.15] tracking-tight mb-6">
              Understand Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-blue-600 dark:from-indigo-300 dark:to-cyan-300 pb-2">
                Engineering Team
              </span>{" "}
              <br />
              In Real Time
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-text-secondary mb-8 leading-relaxed max-w-lg"
          >
            TeamPulse gives engineering teams real-time insights into commits,
            pull requests, risk signals, and developer activity — all in one
            dashboard.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={handleLogin}
              className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-xl hover:-translate-y-1 cursor-pointer"
            >
              <Github className="w-5 h-5" />
              Continue with GitHub
            </button>
            <button className="flex items-center justify-center gap-2 bg-surface text-text-primary border border-border px-8 py-4 rounded-xl text-lg font-medium hover:brightness-95 transition-colors cursor-pointer">
              <LayoutDashboard className="w-5 h-5 text-text-secondary" />
              View Dashboard Demo
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex items-center gap-4 text-sm text-text-secondary"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  src={`https://i.pravatar.cc/100?u=user${i}`}
                  alt={`User ${i}`}
                  className="w-8 h-8 rounded-full border-2 border-background object-cover"
                />
              ))}
            </div>
            <p>Trusted by modern engineering teams</p>
          </motion.div>
        </div>

        {/* Right Content - Abstract Dashboard */}
        <motion.div
          style={{ y: y1 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="relative hidden lg:block"
        >
          <HeroVisual />
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-background p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureSection() {
  const genericFeatures = [
    {
      title: "PR Risk Scoring",
      desc: "Automatically analyze PR size, complexity, and file changes to identify risks.",
      icon: ShieldAlert,
    },
    {
      title: "Worker Architecture",
      desc: "Heavy processing happens in the background, ensuring the dashboard stays fast.",
      icon: Cpu,
    },
    {
      title: "Team Velocity",
      desc: "Track how fast your team is shipping and spot bottlenecks early.",
      icon: Zap,
    },
  ];

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Built for modern engineering teams
          </h2>
          <p className="text-text-secondary">
            Stop relying on standups to know what's happening. detailed insights into your team's development lifecycle.
          </p>
        </div>

        {/* Generic Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-24 mx-auto">
          {genericFeatures.map((f, i) => (
            <FeatureCard
              key={i}
              icon={f.icon}
              title={f.title}
              description={f.desc}
            />
          ))}
        </div>

        {/* Detailed Visual Sections */}
        <div className="space-y-0">
          <DetailedFeature
            title="Real-time Commit Tracking"
            desc="Gain full visibility into every commit as it happens. Track velocity, code churn, and impact across your entire organization."
            icon={GitCommit}
            align="left"
            visual={<CommitTrackingVisual />}
            listItems={["Live WebSockets updates", "Role-based access control", "Instant notifications"]}
          />

          <DetailedFeature
            title="Asynchronous Processing"
            desc="Our distributed worker architecture handles massive scale. Webhooks are processed asynchronously to ensure 100% reliability."
            icon={Cpu}
            align="right"
            visual={<WorkerArchitectureVisual />}
            listItems={["Live WebSockets updates", "Role-based access control", "Instant notifications"]}
          />
        </div>
      </div>
    </section>
  );
}

function DetailedFeature({
  title,
  desc,
  icon: Icon,
  align = "left",
  visual,
  listItems,
}: {
  title: string;
  desc: string;
  icon: any;
  align?: "left" | "right";
  visual?: React.ReactNode;
  listItems?: string[];
}) {
  return (
    <div className={`flex flex-col ${align === "right" ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12 py-16`}>
      <div className="flex-1 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider">
          <Zap className="w-3 h-3" />
          Feature
        </div>
        <h3 className="text-3xl font-bold text-text-primary">{title}</h3>
        <p className="text-lg text-text-secondary leading-relaxed">{desc}</p>
        <ul className="space-y-3">
          {(listItems || ["Live WebSockets updates", "Role-based access control", "Instant notifications"]).map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-text-secondary">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 w-full bg-surface rounded-2xl h-[400px] flex items-center justify-center border border-border relative overflow-hidden group">
        {visual ? (
          <div className="relative z-10 w-full h-full p-6 flex items-center justify-center">{visual}</div>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-surface to-slate-200/50 dark:to-slate-800/50" />
            <Icon className="w-32 h-32 text-slate-300 dark:text-slate-600 group-hover:scale-110 transition-transform duration-500" />
          </>
        )}
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      step: 1,
      title: "Connect Repository",
      desc: "Link your GitHub repository in one click using our secure integration."
    },
    {
      step: 2,
      title: "Webhook Capture",
      desc: "We automatically set up webhooks to capture all development activity."
    },
    {
      step: 3,
      title: "Real-time Analysis",
      desc: "Our worker nodes process events instantly to calculate metrics and risks."
    },
    {
      step: 4,
      title: "Instant Insights",
      desc: "The dashboard updates immediately via WebSockets. No delay."
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 md:text-center">
          <h2 className="text-3xl font-bold text-text-primary">How TeamPulse Works</h2>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-border -z-10" />

          {steps.map((s, i) => (
            <div key={i} className="relative pt-4 md:pt-0">
              <div className="w-16 h-16 rounded-2xl bg-background border-2 border-indigo-100 dark:border-indigo-900 text-brand flex items-center justify-center text-xl font-bold mb-6 shadow-sm mx-auto md:mx-0 z-10">
                {s.step}
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3 md:pr-4">{s.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const handleLogin = () => {
    window.location.href = "/auth/github/login";
  };

  return (
    <section className="py-24 bg-slate-900 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.3),transparent_50%)]" />

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold !text-white mb-6 tracking-tight">
          Stop guessing. <br />
          Start understanding your engineering team.
        </h2>
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          Join high-performing engineering teams who use TeamPulse to deliver better software, faster.
        </p>
        <button
          onClick={handleLogin}
          className="bg-white text-slate-900 hover:bg-slate-50 px-10 py-4 rounded-xl text-lg font-bold transition-transform hover:-translate-y-1 shadow-2xl flex items-center gap-2 mx-auto cursor-pointer"
        >
          <Github className="w-5 h-5" />
          Get Started with GitHub
        </button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-1 rounded-md">
            <Activity className="w-4 h-4" />
          </div>
          <span className="font-bold text-text-primary">TeamPulse</span>
        </div>

        <p className="text-text-secondary text-sm">
          © {new Date().getFullYear()} TeamPulse. Built for engineers.
        </p>

        <div className="flex gap-6 text-sm text-text-secondary">
          <a href="#" className="hover:text-text-primary">Privacy</a>
          <a href="#" className="hover:text-text-primary">Terms</a>
          <a href="#" className="hover:text-text-primary">GitHub</a>
        </div>
      </div>
    </footer>
  );
}

// --- Main Page Component ---

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <FeatureSection />
      <HowItWorks />
      <CTA />
      <Footer />
    </main>
  );
}

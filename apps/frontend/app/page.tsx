"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import {
  Github,
  Zap,
  ShieldAlert,
  LayoutDashboard,
  CheckCircle2,
  Menu,
  X,
  Cpu,
  GitCommit,
  Sparkles
} from "lucide-react";
import { HeroVisual } from "../components/Landing/HeroVisual";
import { CommitTrackingVisual } from "../components/Landing/FeatureVisuals/CommitTrackingVisual";
import { WorkerArchitectureVisual } from "../components/Landing/FeatureVisuals/WorkerArchitectureVisual";

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? "bg-background/60 backdrop-blur-2xl border-b border-border/50 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
        : "bg-transparent py-6"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-brand/40 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <img src="/logo.svg" alt="DevLens" className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 transition-transform duration-300 group-hover:scale-105" />
          </div>
          <span className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-text-primary group-hover:text-brand transition-colors duration-300" style={{ fontFamily: 'var(--font-logo)' }}>
            DevLens
          </span>
        </Link>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-8 bg-surface/40 backdrop-blur-xl border border-border/60 px-6 py-2.5 rounded-full shadow-inner">
          <Link href="/features" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
            Features
          </Link>
          <Link href="#pricing" onClick={(e) => {
            e.preventDefault();
            document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
          }} className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
            Pricing
          </Link>
          <Link href="/how-it-works" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
            How it works
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={handleLogin}
            className="flex items-center gap-2 bg-text-primary text-background hover:bg-slate-200 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-[0_0_15px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 cursor-pointer"
          >
            <Github className="w-4 h-4" />
            Login
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-full left-0 right-0 border-b border-border shadow-2xl z-[50] overflow-hidden backdrop-blur-2xl bg-surface/95"
          >
            <div className="relative p-6 flex flex-col gap-5">
              <Link href="/features" className="text-base font-medium text-text-secondary hover:text-text-primary transition-colors">
                Features
              </Link>
              <Link href="#pricing" onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              }} className="text-base font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
                Pricing
              </Link>
              <Link href="/how-it-works" className="text-base font-medium text-text-secondary hover:text-text-primary transition-colors">
                How it works
              </Link>
              <button
                onClick={handleLogin}
                className="flex items-center justify-center gap-2 bg-text-primary text-background hover:bg-slate-200 px-4 py-3.5 rounded-xl text-sm font-bold w-full cursor-pointer transition-all shadow-lg mt-2"
              >
                <Github className="w-5 h-5" />
                Login with GitHub
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Hero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  const handleLogin = () => {
    window.location.href = "/auth/github/login";
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden min-h-[90vh] flex flex-col justify-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none flex justify-center items-start overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] w-[800px] h-[600px] bg-brand/20 rounded-full blur-[120px] mix-blend-screen" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/15 rounded-full blur-[100px] mix-blend-screen" 
        />
      </div>

      <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] z-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10 w-full">
        <div className="max-w-2xl relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface/50 border border-border/80 backdrop-blur-md mb-8 shadow-[0_2px_10px_rgba(0,0,0,0.1)]"
          >
            <Sparkles className="w-4 h-4 text-brand" />
            <span className="text-sm font-medium text-text-secondary">The new standard for engineering teams</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-text-primary leading-[1.1] tracking-tight mb-6 drop-shadow-sm"
          >
            Stop Shipping <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-purple-400 to-pink-500 pb-2 drop-shadow-lg inline-block">
              High-Risk Bugs
            </span>{" "}
            <br />
            to Production.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-text-secondary mb-10 leading-relaxed max-w-xl font-light"
          >
            Instantly catch risky PRs, track developer velocity, and automate code reviews with AI before bad code merges.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-5"
          >
            <button
              onClick={handleLogin}
              className="group relative flex items-center justify-center gap-2 bg-text-primary text-background px-8 py-4 rounded-2xl text-lg font-bold transition-all hover:scale-[1.02] shadow-[0_0_30px_-5px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.4)] cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
              <Github className="w-5 h-5" />
              Start 7-Day Free Trial
            </button>
            <Link
              href="/demo"
              className="group flex items-center justify-center gap-2 bg-surface/50 backdrop-blur-md text-text-primary border border-border/80 hover:border-border hover:bg-surface px-8 py-4 rounded-2xl text-lg font-medium transition-all cursor-pointer hover:scale-[1.02] shadow-sm"
            >
              <LayoutDashboard className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" />
              View Dashboard
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-12 flex items-center gap-4 text-sm text-text-secondary"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  src={`https://i.pravatar.cc/100?u=user${i}`}
                  alt={`User ${i}`}
                  className="w-10 h-10 rounded-full border-2 border-background object-cover ring-2 ring-border/50"
                />
              ))}
            </div>
            <div className="flex flex-col">
              <div className="flex text-warning mb-0.5">
                {[...Array(5)].map((_, j) => <Sparkles key={j} className="w-3 h-3 fill-current" />)}
              </div>
              <p className="font-medium">Trusted by modern teams</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          style={{ y: y1, opacity }}
          initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1, type: "spring", bounce: 0.4 }}
          className="relative hidden lg:block z-10"
        >
          <div className="absolute -inset-4 bg-gradient-to-tr from-brand/30 to-purple-500/30 rounded-[3rem] blur-2xl -z-10" />
          <div className="relative rounded-3xl overflow-hidden border border-border shadow-2xl bg-surface/50 backdrop-blur-sm group hover:border-brand/40 transition-colors duration-500">
             <HeroVisual />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, description, delay = 0 }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      className="group bg-surface/30 backdrop-blur-xl p-8 rounded-3xl border border-border/80 hover:border-brand/50 hover:bg-surface/60 transition-all duration-500 hover:shadow-[0_8px_30px_-12px_rgba(74,93,255,0.25)] hover:-translate-y-2 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-background/80 border border-border flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-inner">
          <Icon className="w-7 h-7 text-brand drop-shadow-sm" />
        </div>
        <h3 className="text-xl font-bold text-text-primary mb-3">{title}</h3>
        <p className="text-text-secondary text-base leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

function FeatureSection() {
  const genericFeatures = [
    {
      title: "AI-Powered Code Analysis",
      desc: "Get intelligent code reviews, quality metrics, and security insights powered by Gemini AI.",
      icon: Sparkles,
      delay: 0.1
    },
    {
      title: "PR Risk Scoring",
      desc: "Automatically analyze PR size, complexity, and file changes to identify structural risks.",
      icon: ShieldAlert,
      delay: 0.2
    },
    {
      title: "Worker Architecture",
      desc: "Heavy processing happens effortlessly in the background, ensuring the dashboard stays fast.",
      icon: Cpu,
      delay: 0.3
    },
    {
      title: "Team Velocity",
      desc: "Track how exactly your team is shipping and instantly spot bottlenecks early.",
      icon: Zap,
      delay: 0.4
    },
  ];

  return (
    <section className="py-32 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-surface/50 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 border border-brand/20 text-brand text-sm font-semibold mb-6">
            <LayoutDashboard className="w-4 h-4" /> Comprehensive Insights
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6 tracking-tight">
            Built for modern engineering teams
          </h2>
          <p className="text-xl text-text-secondary leading-relaxed">
            Stop relying on standups to know what's happening. Get detailed insights into your team's development lifecycle.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-32 mx-auto">
          {genericFeatures.map((f, i) => (
            <FeatureCard
              key={i}
              icon={f.icon}
              title={f.title}
              description={f.desc}
              delay={f.delay}
            />
          ))}
        </div>

        <div className="space-y-40">
          <DetailedFeature
            title="AI-Powered Code Analysis"
            desc="Leverage Gemini AI to automatically review code quality, predict bugs, detect security vulnerabilities, and provide actionable recommendations for every pull request."
            icon={Sparkles}
            align="left"
            visual={
              <div className="w-full h-full flex items-center justify-center p-6">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="relative w-full max-w-md"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-3xl opacity-50" />
                  <div className="relative bg-surface/90 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                      <Sparkles className="w-7 h-7 text-purple-400" />
                      <h4 className="text-text-primary font-bold text-lg">AI Code Review</h4>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-text-secondary text-sm font-medium">Code Quality</span>
                          <span className="text-green-400 font-bold">85/100</span>
                        </div>
                        <div className="w-full bg-background rounded-full h-2">
                          <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full shadow-[0_0_10px_rgba(72,187,120,0.5)]" style={{ width: '85%' }} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-border/50 pt-4">
                        <span className="text-text-secondary text-sm font-medium">Bug Probability</span>
                        <span className="text-yellow-400 font-bold bg-yellow-400/10 px-3 py-1 rounded-md">Medium</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <div className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-semibold">2 Security</div>
                        <div className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-lg text-xs font-semibold">3 Performance</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            }
            listItems={[
              "Intelligent code review with Gemini AI",
              "Bug probability prediction",
              "Security vulnerability detection",
              "Quality metrics & recommendations"
            ]}
          />

          <DetailedFeature
            title="Real-time Commit Tracking"
            desc="Gain full visibility into every commit as it happens. Track velocity, code churn, and impact across your entire organization."
            icon={GitCommit}
            align="right"
            visual={<CommitTrackingVisual />}
            listItems={["Live WebSockets updates", "Role-based access control", "Instant notifications"]}
          />

          <DetailedFeature
            title="Asynchronous Processing"
            desc="Our distributed worker architecture handles massive scale. Webhooks are processed asynchronously to ensure 100% reliability."
            icon={Cpu}
            align="left"
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
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      className={`flex flex-col ${align === "right" ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-16 py-8`}
    >
      <div className="flex-1 space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold uppercase tracking-widest shadow-inner">
          <Zap className="w-4 h-4" />
          Feature
        </div>
        <h3 className="text-4xl font-extrabold text-text-primary tracking-tight">{title}</h3>
        <p className="text-xl text-text-secondary leading-relaxed font-light">{desc}</p>
        <ul className="space-y-4 pt-4">
          {(listItems || ["Live WebSockets updates", "Role-based access control", "Instant notifications"]).map((item, i) => (
            <motion.li 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + (i * 0.1) }}
              className="flex items-center gap-4 text-text-secondary text-lg"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </div>
              {item}
            </motion.li>
          ))}
        </ul>
      </div>
      <div className="flex-1 w-full bg-surface/30 backdrop-blur-md rounded-[2.5rem] h-[500px] flex items-center justify-center border border-border/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden group hover:border-brand/30 transition-colors duration-500">
        {visual ? (
          <div className="relative z-10 w-full h-full p-8 flex items-center justify-center">{visual}</div>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-surface to-background/50 dark:to-background/50" />
            <Icon className="w-32 h-32 text-border group-hover:scale-110 group-hover:text-brand/50 transition-all duration-700" />
          </>
        )}
      </div>
    </motion.div>
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
    <section className="py-32 bg-surface relative">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 md:text-center max-w-2xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-text-primary mb-4 tracking-tight">How DevLens Works</h2>
          <p className="text-lg text-text-secondary">A seamless pipeline from your code to actionable insights.</p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          <div className="hidden md:block absolute top-10 left-0 w-full h-0.5 bg-gradient-to-r from-brand/0 via-brand/30 to-brand/0 -z-10" />

          {steps.map((s, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative pt-4 md:pt-0 group"
            >
              <div className="w-20 h-20 rounded-2xl bg-surface border border-border shadow-xl text-brand flex items-center justify-center text-3xl font-black mb-8 mx-auto md:mx-0 z-10 group-hover:scale-110 group-hover:bg-brand group-hover:text-white group-hover:border-brand transition-all duration-300">
                {s.step}
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3 md:pr-4">{s.title}</h3>
              <p className="text-text-secondary text-base leading-relaxed">{s.desc}</p>
            </motion.div>
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
    <section className="py-32 bg-background overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,93,255,0.15),transparent_60%)] animate-pulse-slow" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto px-4 text-center relative z-10 border border-border/50 bg-surface/30 backdrop-blur-xl p-16 rounded-[3rem] shadow-2xl"
      >
        <h2 className="text-4xl md:text-6xl font-bold text-text-primary mb-8 tracking-tight">
          Stop guessing. <br />
          <span className="text-brand">Start understanding.</span>
        </h2>
        <p className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto font-light">
          Join high-performing engineering teams who use DevLens to deliver better software, faster.
        </p>
        <button
          onClick={handleLogin}
          className="bg-text-primary text-background hover:bg-slate-200 px-10 py-5 rounded-2xl text-xl font-bold transition-all hover:-translate-y-1 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.5)] flex items-center gap-3 mx-auto cursor-pointer"
        >
          <Github className="w-6 h-6" />
          Start 7-Day Free Trial
        </button>
        <p className="mt-6 text-sm text-text-secondary">No credit card required to start.</p>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-background border-t border-border/50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-3 group">
            <img src="/logo.svg" alt="DevLens" className="w-10 h-10 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-2xl text-text-primary" style={{ fontFamily: 'var(--font-logo)' }}>DevLens</span>
          </div>

          <div className="flex gap-8 text-base font-medium text-text-secondary">
            <a href="/features" className="hover:text-text-primary transition-colors">Features</a>
            <a href="#pricing" className="hover:text-text-primary transition-colors">Pricing</a>
            <a href="/privacy" className="hover:text-text-primary transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-text-primary transition-colors">Terms</a>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-text-secondary">
          <p>© {new Date().getFullYear()} DevLens. By <a href="https://abhishektiwari-18.vercel.app/" target="_blank" className="text-text-primary hover:text-brand font-semibold transition-colors">Abhishek Tiwari</a>.</p>
          <a href="/github" className="flex items-center gap-1 hover:text-text-primary transition-colors"><Github className="w-4 h-4"/> GitHub Repository</a>
        </div>
      </div>
    </footer>
  );
}

function VideoDemoSection() {
  return (
    <section className="py-32 bg-surface border-t border-border/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-4xl font-bold text-text-primary mb-6">See DevLens in Action</h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto font-light">Watch how a single high-risk PR is caught instantly, saving hours of debugging production logs.</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-5xl mx-auto bg-background rounded-[2.5rem] aspect-video flex items-center justify-center shadow-2xl border border-border relative overflow-hidden group hover:border-brand/50 transition-colors duration-500"
        >
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-700 blur-[2px] group-hover:blur-0"></div>
          <div className="absolute inset-0 bg-brand/5 group-hover:bg-brand/0 transition-colors duration-700" />
          <div className="w-20 h-20 bg-background/50 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer group-hover:scale-110 shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_50px_rgba(74,93,255,0.5)] transition-all duration-300 border border-border">
            <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-text-primary border-b-[12px] border-b-transparent ml-2"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function TestimonialSection() {
  const testimonials = [
    { name: "Sarah J.", role: "Senior Engineer", content: "DevLens caught a massive memory leak in a PR just 5 minutes before I merged it to staging. Literal life saver." },
    { name: "Rahul T.", role: "Tech Lead", content: "Finally, I don't have to manually hunt down 'who merged what' when production breaks. The risk dashboard is insanely useful." },
    { name: "Mike W.", role: "CTO", content: "We integrated it in 2 clicks. The AI code review is shockingly accurate and the 7-day trial made it a no-brainer to try." }
  ];

  return (
    <section className="py-32 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl font-bold text-text-primary tracking-tight">Trusted by Developers</h2>
          <p className="text-xl text-text-secondary mt-4 font-light">Teams that ship faster and break less.</p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-surface/50 backdrop-blur-lg p-10 rounded-[2.5rem] shadow-sm border border-border hover:border-brand/30 hover:shadow-[0_10px_40px_-15px_rgba(74,93,255,0.15)] transition-all duration-300 group"
            >
              <div className="flex text-warning mb-6 gap-1.5">
                {[...Array(5)].map((_, j) => <Sparkles key={j} className="w-5 h-5 fill-current" />)}
              </div>
              <p className="text-text-primary mb-8 italic text-lg leading-relaxed">"{t.content}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand/10 border border-brand/20 rounded-full flex items-center justify-center font-bold text-brand text-lg">
                  {t.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-base text-text-primary">{t.name}</h4>
                  <p className="text-sm text-text-secondary">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CreatorSection() {
  return (
    <section className="py-24 bg-surface border-y border-border/50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12 bg-background rounded-[3rem] p-12 border border-border shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-[80px] pointer-events-none" />
        <img src="/abhishek-profile.jpeg" alt="Abhishek Tiwari" className="relative z-10 w-40 h-40 md:w-52 md:h-52 rounded-full border-4 border-surface shadow-2xl object-cover hover:scale-105 transition-transform duration-500" />
        <div className="relative z-10">
          <h3 className="text-3xl font-bold text-text-primary mb-4 tracking-tight">Built by a Developer, for Developers</h3>
          <p className="text-text-secondary mb-8 leading-relaxed text-lg font-light">
            "I built DevLens because I was tired of tracking down blind production bugs caused by massive, unreviewed PRs. 
            I wanted a tool that automatically flagged risks before they merged, not after the servers went down."
          </p>
          <div className="flex items-center gap-6">
            <span className="font-bold text-text-primary text-lg">— Abhishek Tiwari</span>
            <a href="https://github.com/Abhishekkr6" target="_blank" rel="noreferrer" className="bg-surface border border-border px-4 py-2 rounded-full text-text-secondary hover:text-text-primary hover:border-text-secondary transition-all flex items-center gap-2 text-sm font-semibold">
              <Github className="w-4 h-4"/> GitHub
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function PricingSection() {
  const checkIcon = (color: string) => (
    <svg className={`w-6 h-6 flex-shrink-0 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );

  return (
    <section className="py-32 bg-background relative overflow-hidden" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-6 tracking-tight">Simple, transparent pricing</h2>
          <p className="text-xl text-text-secondary mb-20 max-w-2xl mx-auto font-light">Start for free, upgrade when you need advanced AI analysis and unlimited team scalability.</p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-start text-left">
          {/* Free Tier */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-surface/50 backdrop-blur-xl rounded-[3rem] shadow-sm border border-border p-10 flex flex-col h-full hover:border-brand/30 transition-colors duration-300"
          >
            <h3 className="text-3xl font-bold text-text-primary mb-2">Free Tier</h3>
            <p className="text-text-secondary mb-8 h-12 text-lg">Perfect for side projects and evaluating the platform.</p>
            <div className="mb-10 font-bold text-6xl text-text-primary">
              ₹0 <span className="text-xl text-text-secondary font-medium tracking-normal">/ lifetime</span>
            </div>
            <ul className="space-y-5 mb-10 flex-1 text-text-secondary text-base">
              <li className="flex items-center gap-4">{checkIcon("text-success")} Analyze 2 repositories</li>
              <li className="flex items-center gap-4">{checkIcon("text-success")} Up to 10 teammates</li>
              <li className="flex items-center gap-4">{checkIcon("text-success")} Basic GitHub Sync</li>
              <li className="flex items-center gap-4">{checkIcon("text-success")} 1 Month Data Retention</li>
            </ul>
            <a href="/api/auth/github" className="block text-center bg-background hover:bg-surface border border-border text-text-primary font-bold py-5 rounded-2xl transition-colors text-lg">
              Get Started for Free
            </a>
          </motion.div>

          {/* Pro Tier */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative p-1 rounded-[3rem] shadow-2xl flex flex-col h-full md:-translate-y-4 group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand via-purple-500 to-pink-500 rounded-[3rem] opacity-80 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-spin" />
            
            <div className="relative bg-[#0E1116] rounded-[2.9rem] p-10 flex flex-col h-full shadow-inner">
              <div className="absolute top-0 right-10 -translate-y-1/2">
                <span className="bg-gradient-to-r from-brand to-purple-500 text-white text-sm font-black px-4 py-1.5 uppercase tracking-widest rounded-full shadow-lg">Most Popular</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Pro Plan</h3>
              <p className="text-slate-400 mb-8 h-12 text-lg">Everything you need to ship high-quality code and scale.</p>
              <div className="mb-10 font-bold text-6xl text-white">
                ₹499 <span className="text-xl text-slate-400 font-medium tracking-normal">/ lifetime</span>
              </div>
              <ul className="space-y-5 mb-10 flex-1 text-slate-300 text-base">
                <li className="flex items-center gap-4">{checkIcon("text-brand")} Unlimited repositories</li>
                <li className="flex items-center gap-4">{checkIcon("text-brand")} Unlimited team members</li>
                <li className="flex items-center gap-4">{checkIcon("text-brand")} Deep AI Pull Request Analysis</li>
                <li className="flex items-center gap-4">{checkIcon("text-brand")} High-Risk code detection</li>
                <li className="flex items-center gap-4">{checkIcon("text-brand")} Priority Support</li>
              </ul>
              <a href="/pricing" className="block text-center bg-white text-background hover:bg-slate-200 font-bold py-5 rounded-2xl transition-transform hover:-translate-y-1 shadow-[0_10px_30px_-10px_rgba(255,255,255,0.4)] text-lg">
                Start 7-Day Free Trial
              </a>
              <p className="text-sm text-slate-400 text-center mt-5">🛡️ 100% full refund within 3 days. No questions asked.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <VideoDemoSection />
      <FeatureSection />
      <HowItWorks />
      <TestimonialSection />
      <CreatorSection />
      <PricingSection />
      <CTA />
      <Footer />
    </main>
  );
}

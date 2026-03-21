"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import {
  Github,
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-background/95 dark:bg-background/95 backdrop-blur-xl border-b border-border/50 dark:border-border/30 py-3 shadow-lg"
        : "bg-background/85 dark:bg-background/90 backdrop-blur-xl py-5"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1">
          <img src="/logo.svg" alt="DevLens" className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16" />
          <span className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-text-primary" style={{ fontFamily: 'var(--font-logo)' }}>
            DevLens
          </span>
        </Link>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-6">
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

      {mobileMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-background/95 dark:bg-background/98 backdrop-blur-2xl z-[45]"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="md:hidden absolute top-full left-0 right-0 border-b border-border/50 dark:border-border/30 shadow-2xl z-[50] animate-in slide-in-from-top-5 overflow-hidden backdrop-blur-xl bg-slate-950/80">
            <div className="relative p-4 flex flex-col gap-4">
              <Link href="/features" className="text-left text-sm font-medium text-text-secondary hover:text-text-primary transition-colors py-2">
                Features
              </Link>
              <Link href="#pricing" onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              }} className="text-left text-sm font-medium text-text-secondary hover:text-text-primary transition-colors py-2 cursor-pointer">
                Pricing
              </Link>
              <Link href="/how-it-works" className="text-left text-sm font-medium text-text-secondary hover:text-text-primary transition-colors py-2">
                How it works
              </Link>
              <button
                onClick={handleLogin}
                className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-4 py-3 rounded-lg text-sm font-medium w-full cursor-pointer transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Github className="w-4 h-4" />
                Login with GitHub
              </button>
            </div>
          </div>
        </>
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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-50/50 dark:bg-indigo-900/30 rounded-full blur-3xl opacity-60 dark:opacity-40 mix-blend-multiply dark:mix-blend-normal" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-50/50 dark:bg-blue-900/30 rounded-full blur-3xl opacity-60 dark:opacity-40 mix-blend-multiply dark:mix-blend-normal" />
      </div>

      <div className="absolute inset-0 bg-background/70 dark:bg-background/80 backdrop-blur-xl z-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10">
        {/* Left Content */}
        <div className="max-w-2xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-text-primary leading-[1.15] tracking-tight mb-6">
              Stop Shipping <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 pb-2">
                High-Risk Bugs
              </span>{" "}
              <br />
              to Production.
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-text-secondary mb-8 leading-relaxed max-w-lg"
          >
            Instantly catch risky PRs, track developer velocity, and automate code reviews with AI before bad code merges.
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
              Start 7-Day Free Trial
            </button>
            <Link
              href="/demo"
              className="flex items-center justify-center gap-2 bg-surface text-text-primary border border-border px-8 py-4 rounded-xl text-lg font-medium hover:brightness-95 transition-colors cursor-pointer"
            >
              <LayoutDashboard className="w-5 h-5 text-text-secondary" />
              View Dashboard Demo
            </Link>
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

        <motion.div
          style={{ y: y1 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="relative hidden lg:block z-10"
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
      title: "AI-Powered Code Analysis",
      desc: "Get intelligent code reviews, quality metrics, and security insights powered by Gemini AI.",
      icon: Sparkles,
    },
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24 mx-auto">
          {genericFeatures.map((f, i) => (
            <FeatureCard
              key={i}
              icon={f.icon}
              title={f.title}
              description={f.desc}
            />
          ))}
        </div>

        <div className="space-y-0">
          <DetailedFeature
            title="AI-Powered Code Analysis"
            desc="Leverage Gemini AI to automatically review code quality, predict bugs, detect security vulnerabilities, and provide actionable recommendations for every pull request."
            icon={Sparkles}
            align="left"
            visual={
              <div className="w-full h-full flex items-center justify-center">
                <div className="relative w-full max-w-md">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-3xl" />
                  <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="w-6 h-6 text-purple-400" />
                      <h4 className="text-white font-semibold">AI Code Review</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">Code Quality</span>
                        <span className="text-green-400 font-bold">85/100</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full" style={{ width: '85%' }} />
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-slate-300 text-sm">Bug Probability</span>
                        <span className="text-yellow-400 font-bold">Medium</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <div className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">2 Security</div>
                        <div className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded text-xs">3 Performance</div>
                      </div>
                    </div>
                  </div>
                </div>
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
          <h2 className="text-3xl font-bold text-text-primary">How DevLens Works</h2>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative">
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
          Join high-performing engineering teams who use DevLens to deliver better software, faster.
        </p>
        <button
          onClick={handleLogin}
          className="bg-white text-slate-900 hover:bg-slate-50 px-10 py-4 rounded-xl text-lg font-bold transition-transform hover:-translate-y-1 shadow-2xl flex items-center gap-2 mx-auto cursor-pointer"
        >
          <Github className="w-5 h-5" />
          Start 7-Day Free Trial (No Card Req)
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
          <img src="/logo.svg" alt="DevLens" className="w-9 h-9" />
          <span className="font-bold text-text-primary">DevLens</span>
        </div>

        <p className="text-text-secondary text-sm">
          © {new Date().getFullYear()} DevLens. Built for engineers by <a href="https://abhishektiwari-18.vercel.app/" className="hover:text-text-primary underline underline-offset-4">Abhishek Tiwari.</a>
        </p>

        <div className="flex gap-6 text-sm text-text-secondary">
          <a href="/privacy" className="hover:text-text-primary">Privacy</a>
          <a href="/terms" className="hover:text-text-primary">Terms</a>
          <a href="/github" className="hover:text-text-primary">GitHub</a>
        </div>
      </div>
    </footer>
  );
}

function VideoDemoSection() {
  return (
    <section className="py-20 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-text-primary mb-4">See DevLens in Action</h2>
        <p className="text-text-secondary mb-12 max-w-2xl mx-auto">Watch how a single high-risk PR is caught instantly, saving hours of debugging production logs.</p>
        <div className="w-full max-w-4xl mx-auto bg-slate-900 rounded-2xl aspect-video flex items-center justify-center shadow-2xl border border-slate-700/50 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-full flex items-center justify-center cursor-pointer group-hover:scale-110 transition-transform">
            <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[14px] border-l-white border-b-8 border-b-transparent ml-1"></div>
          </div>
        </div>
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
    <section className="py-24 bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-text-primary">Trusted by Developers</h2>
          <p className="text-text-secondary mt-4">Don't just take our word for it.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-background p-8 rounded-2xl shadow-sm border border-border">
              <div className="flex text-yellow-500 mb-4 gap-1">
                {[...Array(5)].map((_, j) => <Sparkles key={j} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-text-primary mb-6 italic">"{t.content}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300">
                  {t.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-text-primary">{t.name}</h4>
                  <p className="text-xs text-text-secondary">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CreatorSection() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-10 bg-surface rounded-3xl p-8 border border-border shadow-sm">
        <img src="/abhishek-profile.jpeg" alt="Abhishek Tiwari" className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-slate-800 shadow-lg object-cover" />
        <div>
          <h3 className="text-2xl font-bold text-text-primary mb-2">Built by a Developer, for Developers</h3>
          <p className="text-text-secondary mb-4 leading-relaxed">
            "I built DevLens because I was tired of tracking down blind production bugs caused by massive, unreviewed PRs. 
            I wanted a tool that automatically flagged risks before they merged, not after the servers went down."
          </p>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-text-primary">— Abhishek Tiwari</span>
            <a href="https://github.com/Abhishekkr6" target="_blank" className="text-text-secondary hover:text-indigo-500 transition-colors flex items-center gap-1 text-sm font-medium">
              <Github className="w-4 h-4"/> GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const checkIcon = (color: string) => (
    <svg className={`w-5 h-5 flex-shrink-0 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );

  return (
    <section className="py-24 bg-surface border-t border-border" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">Simple, transparent pricing</h2>
        <p className="text-lg text-text-secondary mb-16 max-w-2xl mx-auto">Start for free, upgrade when you need advanced AI analysis and team scalability.</p>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-start text-left">
          {/* Free Tier */}
          <div className="bg-background rounded-3xl shadow-sm border border-border p-8 flex flex-col h-full hover:border-indigo-500/30 transition-colors">
            <h3 className="text-2xl font-bold text-text-primary mb-2">Free Tier</h3>
            <p className="text-text-secondary mb-6 h-12">Perfect for side projects and evaluating the platform.</p>
            <div className="mb-8 font-bold text-5xl text-text-primary">
              ₹0 <span className="text-lg text-text-secondary font-medium tracking-normal">/ lifetime</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1 text-text-secondary text-sm">
              <li className="flex items-center gap-3">{checkIcon("text-green-500")} Analyze 2 repositories</li>
              <li className="flex items-center gap-3">{checkIcon("text-green-500")} Up to 10 teammates</li>
              <li className="flex items-center gap-3">{checkIcon("text-green-500")} Basic GitHub Sync</li>
              <li className="flex items-center gap-3">{checkIcon("text-green-500")} 1 Month Data Retention</li>
            </ul>
            <a href="/api/auth/github" className="block text-center bg-surface hover:bg-slate-800 dark:hover:bg-slate-200 hover:text-white dark:hover:text-slate-900 border border-border text-text-primary font-semibold py-4 rounded-xl transition-colors">
              Get Started for Free
            </a>
          </div>

          {/* Pro Tier */}
          <div className="bg-slate-900 rounded-3xl shadow-2xl border border-indigo-500 p-8 flex flex-col h-full transform md:-translate-y-4 relative">
            <div className="absolute top-0 right-8 -translate-y-1/2">
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-3 py-1 uppercase tracking-widest rounded-full shadow-lg">Most Popular</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Pro Plan</h3>
            <p className="text-indigo-200 mb-6 h-12">Everything you need to ship high-quality code and scale.</p>
            <div className="mb-8 font-bold text-5xl text-white">
              ₹499 <span className="text-lg text-indigo-300 font-medium tracking-normal">/ lifetime</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1 text-slate-300 text-sm">
              <li className="flex items-center gap-3">{checkIcon("text-indigo-400")} Unlimited repositories</li>
              <li className="flex items-center gap-3">{checkIcon("text-indigo-400")} Unlimited team members</li>
              <li className="flex items-center gap-3">{checkIcon("text-indigo-400")} Deep AI Pull Request Analysis</li>
              <li className="flex items-center gap-3">{checkIcon("text-indigo-400")} High-Risk code detection</li>
              <li className="flex items-center gap-3">{checkIcon("text-indigo-400")} Priority Support</li>
            </ul>
            <a href="/pricing" className="block text-center bg-white text-slate-900 hover:bg-indigo-50 font-bold py-4 rounded-xl transition-transform hover:-translate-y-1 shadow-lg">
              Start 7-Day Free Trial
            </a>
            <p className="text-xs text-indigo-300/60 text-center mt-4">🛡️ 100% full refund within 3 days. No questions asked.</p>
          </div>
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

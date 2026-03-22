"use client";

import React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import {
  Github,
  Zap,
  ShieldAlert,
  LayoutDashboard,
  CheckCircle2,
  Cpu,
  GitCommit,
  Sparkles
} from "lucide-react";
import { HeroVisual } from "../components/Landing/HeroVisual";
import { CommitTrackingVisual } from "../components/Landing/FeatureVisuals/CommitTrackingVisual";
import { WorkerArchitectureVisual } from "../components/Landing/FeatureVisuals/WorkerArchitectureVisual";
import { Navbar } from "../components/Landing/Navbar";


function Hero() {
  const { scrollY } = useScroll();
  // We use useTransform but only for very simple parallax
  const y1 = useTransform(scrollY, [0, 500], [0, 80]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0.4]);

  const handleLogin = () => {
    window.location.href = "/auth/github/login";
  };

  return (
    <section className="relative pt-32 pb-16 md:pt-48 md:pb-32 overflow-hidden min-h-[85vh] md:min-h-[90vh] flex flex-col justify-center">
      {/* High-performance glowing background mesh. Static sizes, simple blurs, no mix-blend-screen overkill, no Framer Motion loops! */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none flex justify-center items-start overflow-hidden">
        <div className="absolute top-[-5%] md:top-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-brand/20 rounded-full blur-[80px] md:blur-[120px]" />
        <div className="absolute top-[10%] right-[-5%] md:right-[-10%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-purple-500/15 rounded-full blur-[60px] md:blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 lg:gap-8 items-center relative z-10 w-full">
        {/* Left Content */}
        <div className="max-w-xl md:max-w-2xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-border/80 bg-surface/50 mb-6 md:mb-8"
          >
            <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-brand" />
            <span className="text-xs md:text-sm font-medium text-text-secondary">The new standard for engineering teams</span>
          </motion.div>

          {/* Replaced filter: blur with simple opacity/y transform for performance */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-text-primary leading-[1.1] tracking-tight mb-5 md:mb-6"
          >
            Stop Shipping <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-purple-400 to-pink-500 pb-2 inline-block">
              High-Risk Bugs
            </span>{" "}
            <br />
            to Production.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-base sm:text-lg md:text-xl text-text-secondary mb-8 md:mb-10 leading-relaxed max-w-xl font-light"
          >
            Instantly catch risky PRs, track developer velocity, and automate code reviews with AI before bad code merges.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={handleLogin}
              className="group relative flex items-center justify-center gap-2 bg-text-primary text-background px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-base md:text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg cursor-pointer overflow-hidden"
            >
              <Github className="w-5 h-5" />
              Start 7-Day Free Trial
            </button>
            <Link
              href="/demo"
              className="group flex items-center justify-center gap-2 bg-surface/50 text-text-primary border border-border/80 hover:border-border hover:bg-surface px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-base md:text-lg font-medium transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-sm"
            >
              <LayoutDashboard className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" />
              View Dashboard
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-10 md:mt-12 flex items-center gap-4 text-xs md:text-sm text-text-secondary"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  src={`https://i.pravatar.cc/100?u=user${i}`}
                  alt={`User ${i}`}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-background object-cover ring-2 ring-border/50"
                  loading="lazy"
                />
              ))}
            </div>
            <div className="flex flex-col">
              <div className="flex text-warning mb-0.5">
                {[...Array(5)].map((_, j) => <Sparkles key={j} className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" />)}
              </div>
              <p className="font-medium">Trusted by modern teams</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          style={{ y: y1, opacity }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative hidden lg:block z-10"
        >
          <div className="absolute -inset-4 bg-gradient-to-tr from-brand/20 to-purple-500/20 rounded-[3rem] blur-xl -z-10" />
          <div className="relative rounded-3xl overflow-hidden border border-border shadow-xl bg-surface group hover:border-brand/40 transition-colors duration-500">
            <HeroVisual />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, description, delay = 0 }: any) {
  // Mobile devices don't delay much to feel snappier.
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px" }}
      transition={{ duration: 0.5, delay: delay > 0.2 ? delay * 0.5 : delay }}
      className="group bg-surface/50 p-6 md:p-8 rounded-[1.5rem] md:rounded-3xl border border-border/80 hover:border-brand/40 transition-colors duration-300 relative overflow-hidden"
    >
      <div className="relative z-10">
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-background border border-border flex items-center justify-center mb-4 md:mb-6 group-hover:scale-105 transition-transform duration-300 shadow-sm">
          <Icon className="w-6 h-6 md:w-7 md:h-7 text-brand" />
        </div>
        <h3 className="text-lg md:text-xl font-bold text-text-primary mb-2 md:mb-3">{title}</h3>
        <p className="text-text-secondary text-sm md:text-base leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

function FeatureSection() {
  const genericFeatures = [
    { title: "AI-Powered Analysis", desc: "Get intelligent code reviews, quality metrics, and security insights powered by Gemini AI.", icon: Sparkles, delay: 0 },
    { title: "PR Risk Scoring", desc: "Automatically analyze PR size, complexity, and file changes to identify structural risks.", icon: ShieldAlert, delay: 0.1 },
    { title: "Worker Architecture", desc: "Heavy processing happens effortlessly in the background, ensuring the dashboard stays fast.", icon: Cpu, delay: 0.2 },
    { title: "Team Velocity", desc: "Track how exactly your team is shipping and instantly spot bottlenecks early.", icon: Zap, delay: 0.3 },
  ];

  return (
    <section className="py-20 md:py-32 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs md:text-sm font-semibold mb-5 md:mb-6">
            <LayoutDashboard className="w-3.5 h-3.5 md:w-4 md:h-4" /> Comprehensive Insights
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-4 md:mb-6 tracking-tight">
            Built for modern engineering teams
          </h2>
          <p className="text-base md:text-xl text-text-secondary leading-relaxed">
            Stop relying on standups to know what's happening. Get detailed insights into your team's development lifecycle.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-20 md:mb-32 mx-auto">
          {genericFeatures.map((f, i) => (
            <FeatureCard key={i} icon={f.icon} title={f.title} description={f.desc} delay={f.delay} />
          ))}
        </div>

        <div className="space-y-24 md:space-y-40">
          <DetailedFeature
            title="AI-Powered Code Analysis"
            desc="Leverage Gemini AI to automatically review code quality, predict bugs, detect security vulnerabilities, and provide actionable recommendations for every pull request."
            icon={Sparkles}
            align="left"
            visual={
              <div className="w-full h-full flex items-center justify-center p-4 md:p-6">
                <div className="relative w-full max-w-md">
                  <div className="relative bg-surface rounded-2xl p-5 md:p-8 border border-purple-500/30 shadow-lg">
                    <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                      <Sparkles className="w-5 h-5 md:w-7 md:h-7 text-purple-400" />
                      <h4 className="text-text-primary font-bold text-base md:text-lg">AI Code Review</h4>
                    </div>
                    <div className="space-y-4 md:space-y-5">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-text-secondary text-xs md:text-sm font-medium">Code Quality</span>
                          <span className="text-green-400 text-sm md:text-base font-bold">85/100</span>
                        </div>
                        <div className="w-full bg-background rounded-full h-1.5 md:h-2">
                          <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-1.5 md:h-2 rounded-full" style={{ width: '85%' }} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-border/50 pt-3 md:pt-4">
                        <span className="text-text-secondary text-xs md:text-sm font-medium">Bug Probability</span>
                        <span className="text-yellow-400 font-bold bg-yellow-400/10 px-2 py-1 md:px-3 md:py-1 rounded-md text-xs md:text-sm">Medium</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1 md:pt-2">
                        <div className="px-2 py-1 md:px-3 md:py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md md:rounded-lg text-[10px] md:text-xs font-semibold">2 Security</div>
                        <div className="px-2 py-1 md:px-3 md:py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-md md:rounded-lg text-[10px] md:text-xs font-semibold">3 Performance</div>
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px" }}
      transition={{ duration: 0.6 }}
      className={`flex flex-col ${align === "right" ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-10 md:gap-16 py-4 md:py-8`}
    >
      <div className="flex-1 space-y-5 md:space-y-8 text-center lg:text-left">
        <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-brand/10 border border-brand/20 text-brand text-[10px] md:text-xs font-bold uppercase tracking-widest mx-auto lg:mx-0">
          <Zap className="w-3 h-3 md:w-4 md:h-4" />
          Feature
        </div>
        <h3 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">{title}</h3>
        <p className="text-base md:text-xl text-text-secondary leading-relaxed font-light">{desc}</p>
        <ul className="space-y-3 md:space-y-4 pt-2 md:pt-4 text-left inline-block lg:block mx-auto max-w-xs md:max-w-none">
          {(listItems || ["Live WebSockets updates", "Role-based access control", "Instant notifications"]).map((item, i) => (
            <li key={i} className="flex items-center gap-3 md:gap-4 text-text-secondary text-base md:text-lg">
              <div className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" />
              </div>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 w-full bg-surface rounded-[1.5rem] md:rounded-[2.5rem] min-h-[300px] h-[350px] md:h-[500px] flex items-center justify-center border border-border/80 shadow-md relative overflow-hidden">
        {visual ? (
          <div className="relative z-10 w-full h-full p-4 md:p-8 flex items-center justify-center">{visual}</div>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-surface to-background/50 dark:to-background/50" />
            <Icon className="w-24 h-24 md:w-32 md:h-32 text-border" />
          </>
        )}
      </div>
    </motion.div>
  );
}

function HowItWorks() {
  const steps = [
    { step: 1, title: "Connect Repository", desc: "Link your GitHub repository in one click using our secure integration." },
    { step: 2, title: "Webhook Capture", desc: "We automatically set up webhooks to capture all development activity." },
    { step: 3, title: "Real-time Analysis", desc: "Our worker nodes process events instantly to calculate metrics." },
    { step: 4, title: "Instant Insights", desc: "The dashboard updates immediately via WebSockets. No delay." }
  ];

  return (
    <section className="py-20 md:py-32 bg-surface relative border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 md:mb-20 text-center max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-3 md:mb-4 tracking-tight">How DevLens Works</h2>
          <p className="text-base md:text-lg text-text-secondary">A seamless pipeline from your code to actionable insights.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 relative">
          <div className="hidden md:block absolute top-8 md:top-10 left-0 w-full h-0.5 bg-border -z-10" />

          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px" }}
              transition={{ delay: i * 0.1 }}
              className="relative pt-2 md:pt-0 group text-center md:text-left"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-background border border-border shadow-sm text-brand flex items-center justify-center text-2xl md:text-3xl font-black mb-5 md:mb-8 mx-auto md:mx-0 z-10 transition-colors duration-300 group-hover:border-brand">
                {s.step}
              </div>
              <h3 className="text-lg md:text-xl font-bold text-text-primary mb-2 md:mb-3">{s.title}</h3>
              <p className="text-text-secondary text-sm md:text-base leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const handleLogin = () => { window.location.href = "/auth/github/login"; };

  return (
    <section className="py-20 md:py-32 bg-background overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,93,255,0.1),transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto px-4 text-center relative z-10 border border-border/50 bg-surface/80 md:bg-surface/30 p-10 md:p-16 rounded-[2rem] md:rounded-[3rem] shadow-lg md:shadow-2xl mx-4"
      >
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-text-primary mb-6 md:mb-8 tracking-tight">
          Stop guessing. <br className="hidden sm:block" />
          <span className="text-brand">Start understanding.</span>
        </h2>
        <p className="text-base md:text-xl text-text-secondary mb-8 md:mb-12 max-w-2xl mx-auto font-light">
          Join high-performing engineering teams who use DevLens to deliver better software, faster.
        </p>
        <button
          onClick={handleLogin}
          className="bg-text-primary text-background hover:bg-slate-200 px-6 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl text-base md:text-xl font-bold transition-transform active:scale-95 shadow-md flex items-center gap-2 md:gap-3 mx-auto cursor-pointer"
        >
          <Github className="w-5 h-5 md:w-6 md:h-6" />
          Start 7-Day Free Trial
        </button>
        <p className="mt-4 md:mt-6 text-xs md:text-sm text-text-secondary">No credit card required to start.</p>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-background border-t border-border/50 py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 mb-8 md:mb-12">
          <div className="flex items-center gap-2 md:gap-3 group">
            <img src="/logo.svg" alt="DevLens" className="w-8 h-8 md:w-10 md:h-10 transition-transform" />
            <span className="font-bold text-xl md:text-2xl text-text-primary" style={{ fontFamily: 'var(--font-logo)' }}>DevLens</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm md:text-base font-medium text-text-secondary">
            <a href="/features" className="hover:text-text-primary transition-colors">Features</a>
            <a href="#pricing" className="hover:text-text-primary transition-colors">Pricing</a>
            <a href="/privacy" className="hover:text-text-primary transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-text-primary transition-colors">Terms</a>
          </div>
        </div>

        <div className="pt-6 md:pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 text-xs md:text-sm text-text-secondary">
          <p>© {new Date().getFullYear()} DevLens. By <a href="https://abhishektiwari-18.vercel.app/" target="_blank" rel="noreferrer" className="text-text-primary hover:text-brand font-semibold transition-colors">Abhishek Tiwari</a>.</p>
          <a href="/github" className="flex items-center gap-1 hover:text-text-primary transition-colors"><Github className="w-3 h-3 md:w-4 md:h-4" /> GitHub Repository</a>
        </div>
      </div>
    </footer>
  );
}

function VideoDemoSection() {
  return (
    <section className="py-20 md:py-32 bg-surface border-t border-border/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 md:mb-6">See DevLens in Action</h2>
          <p className="text-base md:text-xl text-text-secondary max-w-2xl mx-auto font-light">Watch how a single high-risk PR is caught instantly, saving hours of debugging production logs.</p>
        </motion.div>

        <div className="w-full max-w-5xl mx-auto bg-background rounded-2xl md:rounded-[2.5rem] aspect-video flex items-center justify-center shadow-lg border border-border relative overflow-hidden group hover:border-brand/40 transition-colors duration-300">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 transition-opacity duration-300 blur-[2px] group-hover:blur-0"></div>
          <div className="w-16 h-16 md:w-20 md:h-20 bg-background/80 md:bg-background/50 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer group-hover:scale-105 shadow-md border border-border transition-transform active:scale-95">
            <div className="w-0 h-0 border-t-[10px] md:border-t-[12px] border-t-transparent border-l-[16px] md:border-l-[20px] border-l-text-primary border-b-[10px] md:border-b-[12px] border-b-transparent ml-2 md:ml-2"></div>
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
    <section className="py-20 md:py-32 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14 md:mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tight">Trusted by Developers</h2>
          <p className="text-base md:text-xl text-text-secondary mt-3 md:mt-4 font-light">Teams that ship faster and break less.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px" }}
              transition={{ delay: i * 0.1 }}
              className="bg-surface p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-border"
            >
              <div className="flex text-warning mb-4 md:mb-6 gap-1 md:gap-1.5">
                {[...Array(5)].map((_, j) => <Sparkles key={j} className="w-4 h-4 md:w-5 md:h-5 fill-current" />)}
              </div>
              <p className="text-text-primary mb-6 md:mb-8 italic text-base md:text-lg leading-relaxed">"{t.content}"</p>
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-brand/10 border border-brand/20 rounded-full flex items-center justify-center font-bold text-brand text-base md:text-lg">
                  {t.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-sm md:text-base text-text-primary">{t.name}</h4>
                  <p className="text-xs md:text-sm text-text-secondary">{t.role}</p>
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
    <section className="py-16 md:py-24 bg-surface border-y border-border/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-8 md:gap-12 bg-background rounded-3xl md:rounded-[3rem] p-8 md:p-12 border border-border shadow-sm mx-4"
      >
        <img src="/abhishek-profile.jpeg" alt="Abhishek Tiwari" loading="lazy" className="relative z-10 w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-surface shadow-md object-cover" />
        <div className="relative z-10 text-center md:text-left">
          <h3 className="text-2xl md:text-3xl font-bold text-text-primary mb-3 md:mb-4 tracking-tight">Built by a Developer, for Developers</h3>
          <p className="text-text-secondary mb-6 md:mb-8 leading-relaxed text-base md:text-lg font-light">
            "I built DevLens because I was tired of tracking down blind production bugs caused by massive, unreviewed PRs.
            I wanted a tool that automatically flagged risks before they merged, not after the servers went down."
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 justify-center md:justify-start">
            <span className="font-bold text-text-primary text-base md:text-lg">— Abhishek Tiwari</span>
            <a href="https://github.com/Abhishekkr6" target="_blank" rel="noreferrer" className="bg-surface border border-border px-4 py-2 rounded-full text-text-secondary hover:text-text-primary transition-all flex items-center gap-2 text-xs md:text-sm font-semibold active:scale-95">
              <Github className="w-3.5 h-3.5 md:w-4 md:h-4" /> GitHub
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function PricingSection() {
  const checkIcon = (color: string) => (
    <svg className={`w-5 h-5 md:w-6 md:h-6 flex-shrink-0 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );

  return (
    <section className="py-20 md:py-32 bg-background relative overflow-hidden" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-4 md:mb-6 tracking-tight">Simple, transparent pricing</h2>
          <p className="text-base md:text-xl text-text-secondary mb-12 md:mb-20 max-w-2xl mx-auto font-light">Start for free, upgrade when you need advanced AI analysis and team scalability.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto items-start text-left">
          {/* Free Tier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-surface rounded-3xl md:rounded-[3rem] shadow-sm border border-border p-8 md:p-10 flex flex-col h-full"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">Free Tier</h3>
            <p className="text-text-secondary mb-6 md:mb-8 h-10 md:h-12 text-sm md:text-base">Perfect for side projects and evaluating the platform.</p>
            <div className="mb-8 md:mb-10 font-bold text-5xl md:text-6xl text-text-primary">
              ₹0 <span className="text-lg md:text-xl text-text-secondary font-medium tracking-normal">/ lifetime</span>
            </div>
            <ul className="space-y-4 md:space-y-5 mb-8 md:mb-10 flex-1 text-text-secondary text-sm md:text-base">
              <li className="flex items-center gap-3 md:gap-4">{checkIcon("text-success")} Analyze 2 repositories</li>
              <li className="flex items-center gap-3 md:gap-4">{checkIcon("text-success")} Up to 10 teammates</li>
              <li className="flex items-center gap-3 md:gap-4">{checkIcon("text-success")} Basic GitHub Sync</li>
              <li className="flex items-center gap-3 md:gap-4">{checkIcon("text-success")} 1 Month Data Retention</li>
            </ul>
            <a href="/auth/github/login" className="block text-center bg-background hover:bg-slate-800 border border-border text-text-primary font-bold py-4 md:py-5 rounded-xl md:rounded-2xl transition-colors text-base md:text-lg">
              Get Started for Free
            </a>
          </motion.div>

          {/* Pro Tier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-surface border border-brand/50 rounded-3xl md:rounded-[3rem] p-8 md:p-10 flex flex-col h-full shadow-lg md:-translate-y-4"
          >
            <div className="absolute top-0 right-6 md:right-10 -translate-y-1/2">
              <span className="bg-brand text-white text-xs md:text-sm font-black px-3 md:px-4 py-1 md:py-1.5 uppercase tracking-widest rounded-full shadow-sm">Most Popular</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Pro Plan</h3>
            <p className="text-slate-400 mb-6 md:mb-8 h-10 md:h-12 text-sm md:text-base">Everything you need to ship high-quality code and scale.</p>
            <div className="mb-8 md:mb-10 font-bold text-5xl md:text-6xl text-white">
              ₹1 <span className="text-lg md:text-xl text-slate-400 font-medium tracking-normal">/ lifetime</span>
            </div>
            <ul className="space-y-4 md:space-y-5 mb-8 md:mb-10 flex-1 text-slate-300 text-sm md:text-base">
              <li className="flex items-center gap-3 md:gap-4">{checkIcon("text-brand")} Unlimited repositories</li>
              <li className="flex items-center gap-3 md:gap-4">{checkIcon("text-brand")} Unlimited team members</li>
              <li className="flex items-center gap-3 md:gap-4">{checkIcon("text-brand")} Deep AI Pull Request Analysis</li>
              <li className="flex items-center gap-3 md:gap-4">{checkIcon("text-brand")} High-Risk code detection</li>
              <li className="flex items-center gap-3 md:gap-4">{checkIcon("text-brand")} Priority Support</li>
            </ul>
            <a href="/pricing" className="block text-center bg-text-primary text-background hover:bg-slate-200 font-bold py-4 md:py-5 rounded-xl md:rounded-2xl transition-transform active:scale-95 text-base md:text-lg">
              Start 7-Day Free Trial
            </a>
            <p className="text-xs md:text-sm text-slate-400 text-center mt-4 md:mt-5">🛡️ full refund within 3 days. No questions asked.</p>
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

"use client";

import React from "react";
import { motion } from "motion/react";
import { Navbar } from "../../components/Landing/Navbar";
import { Footer } from "../../components/Landing/Footer";
import { Shield } from "lucide-react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px" }}
      transition={{ duration: 0.5 }}
      className="space-y-4 p-8 bg-surface/50 rounded-2xl border border-border/80"
    >
      <h2 className="text-xl md:text-2xl font-bold text-text-primary">{title}</h2>
      {children}
    </motion.section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-text-primary pt-24">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 border border-brand/20 text-brand text-sm font-semibold mb-6">
            <Shield className="w-4 h-4" /> Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-text-secondary text-base md:text-lg">Last updated: December 28, 2025</p>
        </motion.div>

        <div className="space-y-5">
          <Section title="1. Introduction">
            <p className="text-text-secondary leading-relaxed text-sm md:text-base">
              DevLens ("we," "our," or "us") respects your privacy and is committed to protecting it through our compliance with this policy. This policy describes the types of information we may collect from you or that you may provide when you visit DevLens and our practices for collecting, using, maintaining, protecting, and disclosing that information.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <ul className="space-y-3 text-text-secondary text-sm md:text-base">
              <li className="flex gap-3">
                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-brand mt-2.5" />
                <p><strong className="text-text-primary">Account Information:</strong> When you register with GitHub, we collect your username, email address, and profile picture.</p>
              </li>
              <li className="flex gap-3">
                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-brand mt-2.5" />
                <p><strong className="text-text-primary">Repository Metadata:</strong> We analyze metadata from your connected repositories (commits, PRs, comments). We do <span className="font-bold text-brand">not</span> store your source code permanently.</p>
              </li>
              <li className="flex gap-3">
                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-brand mt-2.5" />
                <p><strong className="text-text-primary">Usage Data:</strong> Information about how you access and use the Service.</p>
              </li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <p className="text-text-secondary text-sm md:text-base mb-3">We use information we collect about you including any personal information to:</p>
            <ul className="space-y-2 text-text-secondary text-sm md:text-base">
              {[
                "Present our Website and its contents to you.",
                "Provide you with information, products, or services that you request.",
                "Fulfill any other purpose for which you provide it.",
                "Notify you about changes to our Website or any services we offer."
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-brand/60 mt-2.5" />
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="4. Data Security">
            <p className="text-text-secondary leading-relaxed text-sm md:text-base">
              We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. All information you provide to us is stored on our secure servers behind firewalls.
            </p>
          </Section>

          <Section title="5. Contact Information">
            <p className="text-text-secondary leading-relaxed text-sm md:text-base">
              To ask questions or comment about this privacy policy, contact us at:{" "}
              <a href="mailto:support.devlens@gmail.com" className="text-brand hover:text-brand/80 underline underline-offset-4 transition-colors">
                support.devlens@gmail.com
              </a>
            </p>
          </Section>
        </div>
      </div>

      <Footer />
    </main>
  );
}

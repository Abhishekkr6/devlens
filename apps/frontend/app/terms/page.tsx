"use client";

import React from "react";
import { motion } from "motion/react";
import { Navbar } from "../../components/Landing/Navbar";
import { Footer } from "../../components/Landing/Footer";
import { FileText } from "lucide-react";

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

export default function TermsPage() {
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
            <FileText className="w-4 h-4" /> Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">Terms of Service</h1>
          <p className="text-text-secondary text-base md:text-lg">Last updated: December 28, 2025</p>
        </motion.div>

        <div className="space-y-5">
          <Section title="1. Acceptance of Terms">
            <p className="text-text-secondary leading-relaxed text-sm md:text-base">
              By accessing and using DevLens, you accept and agree to be bound by the terms and provision of this agreement. When using this Website's particular services, you shall be subject to any posted guidelines or rules applicable to such services.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p className="text-text-secondary leading-relaxed text-sm md:text-base">
              DevLens provides engineering analytics and team management tools. You understand and agree that the Service may include certain communications from DevLens, such as service announcements and administrative messages.
            </p>
          </Section>

          <Section title="3. User Conduct">
            <p className="text-text-secondary text-sm md:text-base mb-3">You agree specifically not to use DevLens to:</p>
            <ul className="space-y-2 text-text-secondary text-sm md:text-base">
              {[
                "Upload, post, or otherwise transmit any content that is unlawful, harmful, threatening, abusive, or harassing.",
                "Impersonate any person or entity.",
                "Interfere with or disrupt the Service or servers or networks connected to the Service."
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-danger/70 mt-2.5" />
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="4. Intellectual Property">
            <p className="text-text-secondary leading-relaxed text-sm md:text-base">
              All content included on this site, such as text, graphics, logos, button icons, and images, is the property of DevLens or its content suppliers and protected by international copyright laws.
            </p>
          </Section>

          <Section title="5. Termination">
            <p className="text-text-secondary leading-relaxed text-sm md:text-base">
              We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </Section>
        </div>
      </div>

      <Footer />
    </main>
  );
}

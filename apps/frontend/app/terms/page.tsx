"use client";

import React from "react";
import { Navbar } from "../../components/Landing/Navbar";
import { Footer } from "../../components/Landing/Footer";

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-background text-text-primary pt-24">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8">Terms of Service</h1>
                <p className="text-text-secondary mb-12 text-lg">Last updated: December 28, 2025</p>

                <div className="space-y-12">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-text-primary">1. Acceptance of Terms</h2>
                        <p className="text-text-secondary leading-relaxed">
                            By accessing and using TeamPulse, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this Website's particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-text-primary">2. Description of Service</h2>
                        <p className="text-text-secondary leading-relaxed">
                            TeamPulse provides engineering analytics and team management tools. You understand and agree that the Service may include certain communications from TeamPulse, such as service announcements and administrative messages.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-text-primary">3. User Conduct</h2>
                        <p className="text-text-secondary leading-relaxed">
                            You agree specifically not to use TeamPulse to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                            <li>Upload, post, or otherwise transmit any content that is unlawful, harmful, threatening, abusive, or harassing.</li>
                            <li>Impersonate any person or entity.</li>
                            <li>Interfere with or disrupt the Service or servers or networks connected to the Service.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-text-primary">4. Intellectual Property</h2>
                        <p className="text-text-secondary leading-relaxed">
                            All content included on this site, such as text, graphics, logos, button icons, images, is the property of TeamPulse or its content suppliers and protected by international copyright laws.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-text-primary">5. Termination</h2>
                        <p className="text-text-secondary leading-relaxed">
                            We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                        </p>
                    </section>
                </div>
            </div>

            <Footer />
        </main>
    );
}

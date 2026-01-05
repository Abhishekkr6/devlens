"use client";

import React from "react";
import { Navbar } from "../../components/Landing/Navbar";
import { Footer } from "../../components/Landing/Footer";

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-background text-text-primary pt-24">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8">Privacy Policy</h1>
                <p className="text-text-secondary mb-12 text-lg">Last updated: December 28, 2025</p>

                <div className="space-y-12">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-text-primary">1. Introduction</h2>
                        <p className="text-text-secondary leading-relaxed">
                            TeamPulse ("we," "our," or "us") respects your privacy and is committed to protecting it through our compliance with this policy. This policy describes the types of information we may collect from you or that you may provide when you visit the website TeamPulse (our "Website") and our practices for collecting, using, maintaining, protecting, and disclosing that information.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-text-primary">2. Information We Collect</h2>
                        <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                            <li>
                                <strong className="text-text-primary">Account Information:</strong> When you register with GitHub, we collect your username, email address, and profile picture.
                            </li>
                            <li>
                                <strong className="text-text-primary">Repository Metadata:</strong> We analyze metadata from your connected repositories (commits, PRs, comments) to provide analytics. We do <span className="font-bold text-indigo-400">not</span> store your source code permanently.
                            </li>
                            <li>
                                <strong className="text-text-primary">Usage Data:</strong> Information about how you access and use the Service.
                            </li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-text-primary">3. How We Use Your Information</h2>
                        <p className="text-text-secondary leading-relaxed">
                            We use information that we collect about you or that you provide to us, including any personal information:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-text-secondary">
                            <li>To present our Website and its contents to you.</li>
                            <li>To provide you with information, products, or services that you request from us.</li>
                            <li>To fulfill any other purpose for which you provide it.</li>
                            <li>To notify you about changes to our Website or any products or services we offer or provide through it.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-text-primary">4. Data Security</h2>
                        <p className="text-text-secondary leading-relaxed">
                            We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. All information you provide to us is stored on our secure servers behind firewalls.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-text-primary">5. Contact Information</h2>
                        <p className="text-text-secondary leading-relaxed">
                            To ask questions or comment about this privacy policy and our privacy practices, contact us at: <a href="mailto:support@teampulse.dev" className="text-indigo-400 hover:text-indigo-300 underline">support@teampulse.dev</a>
                        </p>
                    </section>
                </div>
            </div>

            <Footer />
        </main>
    );
}

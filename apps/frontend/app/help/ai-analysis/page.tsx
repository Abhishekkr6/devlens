"use client";

import { Sparkles, CheckCircle2, AlertCircle, Code2, Shield, TrendingUp, Zap, HelpCircle, Book } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/Ui/Card";
import { Button } from "@/components/Ui/Button";

export default function AIHelpPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="border-b border-border bg-surface/50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-brand mb-4 transition-colors">
                        ← Back to Dashboard
                    </Link>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-brand/20 rounded-xl">
                            <Sparkles className="w-8 h-8 text-brand" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">AI Code Analysis</h1>
                            <p className="text-text-secondary mt-1">Complete guide to AI-powered code review</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
                <Card className="p-6 sm:p-8 border-2 border-brand/20">
                    <div className="flex items-center gap-3 mb-6">
                        <Zap className="w-6 h-6 text-brand" />
                        <h2 className="text-2xl font-bold text-text-primary">Quick Start</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center flex-shrink-0 font-bold text-brand">1</div>
                            <div>
                                <h3 className="font-semibold text-text-primary mb-1">Navigate to Pull Requests</h3>
                                <p className="text-sm text-text-secondary">Go to the PRs page from your organization dashboard</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center flex-shrink-0 font-bold text-brand">2</div>
                            <div>
                                <h3 className="font-semibold text-text-primary mb-1">Click the AI Icon</h3>
                                <p className="text-sm text-text-secondary">Click the <Sparkles className="w-4 h-4 inline text-brand" /> sparkle icon next to any PR</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center flex-shrink-0 font-bold text-brand">3</div>
                            <div>
                                <h3 className="font-semibold text-text-primary mb-1">Run Analysis</h3>
                                <p className="text-sm text-text-secondary">Click "Analyze with AI" and wait for results (usually 10-30 seconds)</p>
                            </div>
                        </div>
                    </div>
                </Card>

                <div>
                    <h2 className="text-2xl font-bold text-text-primary mb-6">What You Get</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Card className="p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <TrendingUp className="w-5 h-5 text-green-500" />
                                <h3 className="font-semibold text-text-primary">Code Quality Score</h3>
                            </div>
                            <p className="text-sm text-text-secondary mb-3">
                                Overall quality rating from 0-100 based on code structure, complexity, and best practices.
                            </p>
                            <div className="text-xs text-text-secondary">
                                <strong>Scoring:</strong> 85+ Excellent, 70-84 Good, 50-69 Fair, &lt;50 Needs Work
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <AlertCircle className="w-5 h-5 text-orange-500" />
                                <h3 className="font-semibold text-text-primary">Bug Probability</h3>
                            </div>
                            <p className="text-sm text-text-secondary mb-3">
                                AI-powered prediction of potential bugs based on code patterns and complexity.
                            </p>
                            <div className="text-xs text-text-secondary">
                                <strong>Levels:</strong> Low, Medium, High, Critical
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <Shield className="w-5 h-5 text-red-500" />
                                <h3 className="font-semibold text-text-primary">Security Alerts</h3>
                            </div>
                            <p className="text-sm text-text-secondary mb-3">
                                Detects common security vulnerabilities like SQL injection, XSS, and insecure dependencies.
                            </p>
                            <div className="text-xs text-text-secondary">
                                <strong>Categories:</strong> Security, Performance, Best Practices
                            </div>
                        </Card>

                        <Card className="p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <Code2 className="w-5 h-5 text-blue-500" />
                                <h3 className="font-semibold text-text-primary">Recommendations</h3>
                            </div>
                            <p className="text-sm text-text-secondary mb-3">
                                Actionable suggestions to improve code quality, performance, and maintainability.
                            </p>
                            <div className="text-xs text-text-secondary">
                                <strong>Includes:</strong> Refactoring tips, optimization ideas
                            </div>
                        </Card>
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-text-primary mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        <Card className="p-6">
                            <h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-brand" />
                                How accurate is the AI analysis?
                            </h3>
                            <p className="text-sm text-text-secondary">
                                Our AI is powered by Google's Gemini model, trained on millions of code samples.
                                While highly accurate, it should be used as a guide alongside human code review, not as a replacement.
                            </p>
                        </Card>

                        <Card className="p-6">
                            <h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-brand" />
                                How long does analysis take?
                            </h3>
                            <p className="text-sm text-text-secondary">
                                Typically 10-30 seconds depending on PR size. Larger PRs with more files may take up to 1 minute.
                            </p>
                        </Card>

                        <Card className="p-6">
                            <h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-brand" />
                                Can I re-analyze a PR?
                            </h3>
                            <p className="text-sm text-text-secondary">
                                Yes! Click "Analyze with AI" again to get fresh results. This is useful after making changes based on previous recommendations.
                            </p>
                        </Card>

                        <Card className="p-6">
                            <h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-brand" />
                                Is my code data secure?
                            </h3>
                            <p className="text-sm text-text-secondary">
                                Yes. Code is sent securely to Google's Gemini API over HTTPS. Google does not use your code to train models.
                                Analysis results are stored in your database only.
                            </p>
                        </Card>

                        <Card className="p-6">
                            <h3 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-brand" />
                                What languages are supported?
                            </h3>
                            <p className="text-sm text-text-secondary">
                                All major programming languages including JavaScript, TypeScript, Python, Java, Go, Rust, C++, and more.
                            </p>
                        </Card>
                    </div>
                </div>

                <Card className="p-6 sm:p-8 bg-gradient-to-br from-brand/5 to-purple-500/5">
                    <div className="flex items-center gap-3 mb-6">
                        <Book className="w-6 h-6 text-brand" />
                        <h2 className="text-2xl font-bold text-text-primary">Best Practices</h2>
                    </div>
                    <ul className="space-y-3">
                        {[
                            "Run analysis before requesting code review to catch issues early",
                            "Address critical security alerts immediately",
                            "Use recommendations as learning opportunities for your team",
                            "Re-analyze after making significant changes",
                            "Enable auto-analysis in settings for automatic checks",
                            "Review quality scores over time to track improvement",
                        ].map((tip, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-text-secondary">{tip}</span>
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card className="p-8 text-center bg-gradient-to-r from-brand/10 to-purple-500/10 border-2 border-brand/20">
                    <h2 className="text-2xl font-bold text-text-primary mb-3">Ready to try it?</h2>
                    <p className="text-text-secondary mb-6">
                        Start analyzing your pull requests with AI-powered insights
                    </p>
                    <Link href="/organization">
                        <Button className="bg-brand hover:bg-brand/90 text-white px-8 py-3">
                            Go to Pull Requests →
                        </Button>
                    </Link>
                </Card>
            </div>
        </div>
    );
}

"use client";

import { X, Sparkles, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Card } from "./Card";
import { Button } from "./Button";

const BANNER_STORAGE_KEY = "teampulse_ai_banner_dismissed";

export function AIWelcomeBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if banner was already dismissed
        const dismissed = localStorage.getItem(BANNER_STORAGE_KEY);
        if (!dismissed) {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        localStorage.setItem(BANNER_STORAGE_KEY, "true");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <Card className="mb-6 border-2 border-brand/30 bg-gradient-to-r from-brand/5 to-purple-500/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full blur-3xl -mr-16 -mt-16" />

            <div className="relative p-4 sm:p-6">
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1 hover:bg-surface rounded-lg transition-colors"
                    aria-label="Dismiss banner"
                >
                    <X className="w-4 h-4 text-text-secondary" />
                </button>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pr-8">
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brand/20 rounded-2xl flex items-center justify-center">
                            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-brand animate-pulse" />
                        </div>
                    </div>

                    <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-bold text-text-primary mb-1 sm:mb-2">
                            ✨ New: AI-Powered Code Analysis
                        </h3>
                        <p className="text-xs sm:text-sm text-text-secondary mb-3 sm:mb-4">
                            Get intelligent code reviews, quality metrics, and security insights powered by Gemini AI.
                            Click the <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 inline text-brand" /> icon on any PR to analyze.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                            <div className="flex items-center gap-2 text-text-secondary">
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                                <span>Code quality scoring</span>
                            </div>
                            <div className="flex items-center gap-2 text-text-secondary">
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                                <span>Bug prediction</span>
                            </div>
                            <div className="flex items-center gap-2 text-text-secondary">
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                                <span>Security alerts</span>
                            </div>
                            <div className="flex items-center gap-2 text-text-secondary">
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                                <span>Smart recommendations</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-shrink-0 w-full sm:w-auto">
                        <Button
                            onClick={handleDismiss}
                            className="w-full sm:w-auto bg-brand hover:bg-brand/90 text-white px-4 sm:px-6 py-2 text-xs sm:text-sm"
                        >
                            Got it!
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}

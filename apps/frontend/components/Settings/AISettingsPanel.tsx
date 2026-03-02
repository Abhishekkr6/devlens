"use client";

import { useState, useEffect } from "react";
import { Sparkles, Bell, Zap, Shield, Info } from "lucide-react";
import { Card } from "@/components/Ui/Card";
import { Button } from "@/components/Ui/Button";

const AI_SETTINGS_KEY = "DevLens_ai_settings";

interface AISettings {
    autoAnalyze: boolean;
    emailNotifications: boolean;
    autoAnalyzeThreshold: "all" | "high-risk" | "manual";
    notifyOnCritical: boolean;
}

const defaultSettings: AISettings = {
    autoAnalyze: false,
    emailNotifications: false,
    autoAnalyzeThreshold: "manual",
    notifyOnCritical: true,
};

export function AISettingsPanel() {
    const [settings, setSettings] = useState<AISettings>(defaultSettings);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Load settings from localStorage
        const stored = localStorage.getItem(AI_SETTINGS_KEY);
        if (stored) {
            try {
                setSettings(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse AI settings:", e);
            }
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleToggle = (key: keyof AISettings) => {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleThresholdChange = (value: AISettings["autoAnalyzeThreshold"]) => {
        setSettings((prev) => ({ ...prev, autoAnalyzeThreshold: value }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-brand/20 rounded-lg">
                    <Sparkles className="w-6 h-6 text-brand" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-text-primary">AI Analysis Settings</h2>
                    <p className="text-sm text-text-secondary">Configure AI-powered code analysis preferences</p>
                </div>
            </div>

            {/* Auto-Analysis */}
            <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-orange-500 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-text-primary mb-1">Auto-Analyze New PRs</h3>
                            <p className="text-sm text-text-secondary">
                                Automatically run AI analysis when new pull requests are created
                            </p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.autoAnalyze}
                            onChange={() => handleToggle("autoAnalyze")}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand"></div>
                    </label>
                </div>

                {settings.autoAnalyze && (
                    <div className="ml-8 mt-4 space-y-3 border-l-2 border-brand/20 pl-4">
                        <p className="text-xs font-medium text-text-secondary mb-2">Auto-analyze when:</p>
                        {[
                            { value: "all", label: "All PRs", desc: "Analyze every new pull request" },
                            { value: "high-risk", label: "High-risk PRs only", desc: "Only PRs with risk score > 70" },
                            { value: "manual", label: "Manual only", desc: "Require manual trigger" },
                        ].map((option) => (
                            <label
                                key={option.value}
                                className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-surface transition-colors"
                            >
                                <input
                                    type="radio"
                                    name="threshold"
                                    value={option.value}
                                    checked={settings.autoAnalyzeThreshold === option.value}
                                    onChange={() => handleThresholdChange(option.value as AISettings["autoAnalyzeThreshold"])}
                                    className="mt-1 w-4 h-4 text-brand focus:ring-brand"
                                />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-text-primary">{option.label}</div>
                                    <div className="text-xs text-text-secondary">{option.desc}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                )}
            </Card>

            {/* Notifications */}
            <Card className="p-6">
                <div className="space-y-4">
                    {/* Email Notifications */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            <Bell className="w-5 h-5 text-blue-500 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-text-primary mb-1">Email Notifications</h3>
                                <p className="text-sm text-text-secondary">
                                    Receive email when AI analysis completes
                                </p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.emailNotifications}
                                onChange={() => handleToggle("emailNotifications")}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand"></div>
                        </label>
                    </div>

                    {/* Critical Alerts */}
                    <div className="flex items-start justify-between pt-4 border-t border-border">
                        <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-red-500 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-text-primary mb-1">Critical Issue Alerts</h3>
                                <p className="text-sm text-text-secondary">
                                    Get notified when critical security issues are found
                                </p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.notifyOnCritical}
                                onChange={() => handleToggle("notifyOnCritical")}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand"></div>
                        </label>
                    </div>
                </div>
            </Card>

            {/* Info Card */}
            <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-900 dark:text-blue-200">
                        <p className="font-medium mb-1">About Auto-Analysis</p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                            Auto-analysis uses AI credits. Each analysis consumes approximately 1 credit.
                            High-risk PRs are automatically prioritized to help you catch issues early.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
                <p className="text-sm text-text-secondary">
                    Settings are saved locally in your browser
                </p>
                <Button
                    onClick={handleSave}
                    className={`px-6 py-2 ${saved ? "bg-green-500 hover:bg-green-600" : "bg-brand hover:bg-brand/90"
                        } text-white transition-colors`}
                >
                    {saved ? "✓ Saved!" : "Save Settings"}
                </Button>
            </div>
        </div>
    );
}

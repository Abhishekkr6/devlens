"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardTitle, CardValue, CardHeader, CardBody } from "../../components/Ui/Card";
import { Button } from "../../components/Ui/Button";
import { Badge } from "../../components/Ui/Badge";
import { DEMO_STATS, DEMO_ACTIVITY, DEMO_PRS, DEMO_LEADERBOARD } from "./demo-data";
import { Activity } from "lucide-react";

export default function DemoPage() {
    const router = useRouter();

    const handleLogin = () => {
        window.location.href = "/auth/github/login";
    };


    return (
        <div className="min-h-screen bg-background text-text-primary flex flex-col">
            {/* 1) Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-white p-1.5 rounded-lg flex items-center justify-center">
                            <Activity className="text-slate-900 w-5 h-5" />
                        </div>
                        <h1 className="text-lg font-heading font-semibold text-text-primary">
                            TeamPulse <span className="text-text-secondary font-normal text-sm ml-1 hidden sm:inline">(Demo Mode)</span>
                        </h1>
                    </div>

                    <Button variant="primary" onClick={handleLogin} className="cursor-pointer hover:text-white text-xs sm:text-sm px-3 sm:px-4">
                        <span className="sm:hidden">Login</span>
                        <span className="hidden sm:inline">Continue with GitHub</span>
                    </Button>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
                {/* 6) Alert Banner (Placed top for visibility in demo) */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                        <h3 className="text-amber-500 font-semibold text-sm">Action Required: High Risk PR Detected</h3>
                        <p className="text-amber-500/80 text-sm">
                            PR #17 in <code>monorepo-web</code> has a risk score of 85%. Investigate before merging.
                        </p>
                    </div>
                </div>

                {/* 2) Top Stats Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {DEMO_STATS.map((stat, i) => (
                        <Card key={i}>
                            <CardBody className="space-y-2">
                                <CardTitle>{stat.label}</CardTitle>
                                <div className="flex items-center justify-between">
                                    <CardValue>{stat.value}</CardValue>
                                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${stat.trend === "up" && !stat.alert ? "text-emerald-500 bg-emerald-500/10" :
                                        stat.trend === "down" ? "text-rose-500 bg-rose-500/10" :
                                            stat.trend === "up" && stat.alert ? "text-rose-500 bg-rose-500/10" :
                                                "text-text-secondary bg-surface"
                                        }`}>
                                        {stat.change}
                                    </span>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 3) Commit Activity Chart (Simulated) */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Commit Activity (Last 7 Days)</CardTitle>
                        </CardHeader>
                        <CardBody>
                            <div className="h-64 w-full flex items-end justify-between gap-1 sm:gap-2 pt-4">
                                {DEMO_ACTIVITY.map((day) => (
                                    <div key={day.day} className="flex flex-col items-center gap-2 group w-full">
                                        <div
                                            className="w-full max-w-[40px] bg-brand/20 group-hover:bg-brand/40 rounded-t-sm transition-all relative group-hover:scale-y-105 origin-bottom duration-300 min-h-[4px]"
                                            style={{ height: `${(day.commits / 24) * 100}%` }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface border border-border text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none hidden sm:block">
                                                {day.commits} commits
                                            </div>
                                        </div>
                                        <span className="text-[10px] sm:text-xs text-text-secondary">{day.day}</span>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>

                    {/* 5) Developer Leaderboard */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Top Contributors</CardTitle>
                        </CardHeader>
                        <CardBody className="p-0">
                            <div className="divide-y divide-border">
                                {DEMO_LEADERBOARD.map((dev, i) => (
                                    <div key={i} className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-xs font-bold text-text-secondary shrink-0">
                                                {dev.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-text-primary truncate">{dev.name}</p>
                                                <p className="text-xs text-text-secondary">{dev.commits} commits</p>
                                            </div>
                                        </div>
                                        <Badge type={dev.status === "Consistent Contributor" ? "success" : dev.status === "Under Load" ? "warning" : "default"}>
                                            <span className="hidden sm:inline">{dev.status}</span>
                                            <span className="sm:hidden">{dev.status === "Consistent Contributor" ? "Top" : dev.status === "Under Load" ? "Busy" : dev.status}</span>
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* 4) Pull Requests List */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Active Pull Requests</CardTitle>
                        <Button variant="ghost" className="text-xs">View All</Button>
                    </CardHeader>
                    <CardBody className="p-0">
                        <div className="divide-y divide-border">
                            {DEMO_PRS.map((pr) => (
                                <div key={pr.id} className="p-4 hover:bg-surface/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${pr.status === 'HIGH RISK' ? 'bg-danger' : pr.status === 'MERGED' ? 'bg-purple-500' : 'bg-success'}`} />
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-medium text-text-primary truncate pr-2">{pr.title}</h4>
                                            <p className="text-xs text-text-secondary mt-0.5 truncate">
                                                {pr.repo} • #{pr.id} • opened {pr.time} by {pr.author}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge type={pr.status === "HIGH RISK" ? "danger" : pr.status === "MERGED" ? "info" : "success"}>
                                        {pr.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>

                {/* 7) Final CTA Section */}
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="max-w-2xl space-y-4">
                        <h2 className="text-3xl font-heading font-bold text-text-primary">
                            See your real engineering data in action
                        </h2>
                        <p className="text-text-secondary text-lg">
                            TeamPulse connects with your GitHub repositories to provide real-time insights, risk detection, and developer metrics.
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-2">

                        <Button
                            onClick={handleLogin}
                            className="cursor-pointer h-12 px-8 text-base shadow-lg shadow-brand/25">
                            Connect GitHub Repositories
                        </Button>

                        <p className="text-xs text-text-secondary mt-4">
                            Demo mode simulates data. Connect real repos for actual insights.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

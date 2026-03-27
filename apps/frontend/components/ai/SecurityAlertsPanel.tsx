"use client";

import { SecurityAlert } from '@/lib/aiAPI';
import { Shield, ShieldAlert, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAIStore } from '@/store/aiStore';
import { useState } from 'react';
import { Card } from '@/components/Ui/Card';

interface SecurityAlertsPanelProps {
    alerts: SecurityAlert[];
}

const severityConfig = {
    low: { icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    medium: { icon: Shield, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    high: { icon: ShieldAlert, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    critical: { icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' }
};

const typeColors = {
    vulnerability: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    secret: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    dependency: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    'code-smell': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
};

export function SecurityAlertsPanel({ alerts }: SecurityAlertsPanelProps) {
    const { resolveAlert } = useAIStore();
    const [resolvingId, setResolvingId] = useState<string | null>(null);

    const handleResolve = async (alertId: string) => {
        setResolvingId(alertId);
        try {
            await resolveAlert(alertId);
        } catch (error) {
            console.error('Failed to resolve alert:', error);
        } finally {
            setResolvingId(null);
        }
    };

    if (!alerts || alerts.length === 0) {
        return (
            <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-6 sm:p-8 shadow-lg relative overflow-hidden group hover:border-brand/20 transition-colors duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="relative z-10 flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-brand/10 border border-brand/20 flex-shrink-0 shadow-inner">
                        <Shield className="w-6 h-6 text-green-500" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
                        Security Alerts
                    </h3>
                </div>
                <div className="relative z-10 text-center py-10">
                    <div className="p-4 rounded-full bg-surface/80 inline-flex mb-4 border border-white/5">
                        <ShieldCheck className="w-10 h-10 text-green-500" />
                    </div>
                    <p className="text-sm font-light text-text-secondary leading-relaxed">
                        No security alerts found. Great job!
                    </p>
                </div>
            </Card>
        );
    }

    const openAlerts = alerts.filter(a => a.status === 'open');
    const resolvedAlerts = alerts.filter(a => a.status === 'resolved');

    return (
        <Card className="rounded-3xl border border-white/10 bg-surface/50 backdrop-blur-xl p-6 sm:p-8 shadow-lg relative overflow-hidden group hover:border-brand/20 transition-colors duration-300 space-y-6 sm:space-y-8">
            <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            {/* Header */}
            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-brand/10 border border-brand/20 flex-shrink-0 shadow-inner">
                        <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-brand" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
                        Security Alerts
                    </h3>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <span className="text-red-600 dark:text-red-400 font-medium">
                        {openAlerts.length} Open
                    </span>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                        {resolvedAlerts.length} Resolved
                    </span>
                </div>
            </div>

            {/* Open Alerts */}
            {openAlerts.length > 0 && (
                <div className="relative z-10 space-y-4">
                    <h4 className="text-sm font-bold tracking-tight text-text-primary uppercase">
                        Open Alerts ({openAlerts.length})
                    </h4>
                    <div className="space-y-4">
                        {openAlerts.map((alert) => {
                            const SeverityIcon = severityConfig[alert.severity].icon;

                            return (
                                <div
                                    key={alert._id}
                                    className={`
                    border rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition-all duration-300
                    ${severityConfig[alert.severity].border}
                    ${severityConfig[alert.severity].bg}
                  `}
                                >
                                    {/* Alert Header */}
                                    <div className="flex items-start gap-3">
                                        <SeverityIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${severityConfig[alert.severity].color}`} />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                                <h5 className="font-semibold text-text-primary">
                                                    {alert.title}
                                                </h5>
                                                <span className={`text-xs px-2 py-1 rounded-full ${typeColors[alert.type]}`}>
                                                    {alert.type}
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${severityConfig[alert.severity].bg} ${severityConfig[alert.severity].color}`}>
                                                    {alert.severity}
                                                </span>
                                                {alert.cvssScore && (
                                                    <span className="text-xs px-2 py-1 rounded-full bg-surface text-text-secondary">
                                                        CVSS: {alert.cvssScore}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-text-secondary mb-2">
                                                {alert.description}
                                            </p>

                                            {/* Affected Files */}
                                            {alert.affectedFiles && alert.affectedFiles.length > 0 && (
                                                <div className="text-xs text-text-secondary mb-2">
                                                    <span className="font-medium">Affected files:</span>{' '}
                                                    {alert.affectedFiles.join(', ')}
                                                </div>
                                            )}

                                            {/* CWE/CVE */}
                                            {(alert.cwe || alert.cve) && (
                                                <div className="flex gap-2 text-xs mb-2">
                                                    {alert.cwe && (
                                                        <span className="px-2 py-1 bg-surface rounded">
                                                            {alert.cwe}
                                                        </span>
                                                    )}
                                                    {alert.cve && (
                                                        <span className="px-2 py-1 bg-surface rounded">
                                                            {alert.cve}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Recommendations */}
                                            {alert.recommendations && alert.recommendations.length > 0 && (
                                                <div className="bg-surface rounded p-3 mb-3">
                                                    <p className="text-xs font-medium text-text-primary mb-2">
                                                        💡 How to fix:
                                                    </p>
                                                    <ul className="space-y-1">
                                                        {alert.recommendations.map((rec, idx) => (
                                                            <li key={idx} className="text-xs text-text-secondary flex items-start gap-1">
                                                                <span className="text-brand">•</span>
                                                                <span>{rec}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Resolve Button */}
                                            <button
                                                onClick={() => handleResolve(alert._id)}
                                                disabled={resolvingId === alert._id}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white text-sm rounded-lg transition-colors"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                {resolvingId === alert._id ? 'Resolving...' : 'Mark as Resolved'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Resolved Alerts (Collapsed) */}
            {resolvedAlerts.length > 0 && (
                <details className="relative z-10 group bg-surface/40 rounded-2xl border border-white/5 p-4 hover:bg-surface/60 transition-colors">
                    <summary className="cursor-pointer text-sm font-bold tracking-tight text-text-secondary hover:text-text-primary flex items-center outline-none">
                        Resolved Alerts ({resolvedAlerts.length})
                    </summary>
                    <div className="mt-3 space-y-2">
                        {resolvedAlerts.map((alert) => (
                            <div
                                key={alert._id}
                                className="border border-green-500/20 bg-green-500/10 rounded-xl p-4 shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    <span className="text-sm text-text-primary font-bold tracking-tight">
                                        {alert.title}
                                    </span>
                                    <span className="text-xs font-light text-text-secondary">
                                        ({alert.type})
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </details>
            )}
        </Card>
    );
}

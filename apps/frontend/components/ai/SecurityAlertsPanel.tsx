"use client";

import { SecurityAlert } from '@/lib/aiAPI';
import { Shield, ShieldAlert, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { useAIStore } from '@/store/aiStore';
import { useState } from 'react';

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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-6 h-6 text-green-500" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Security Alerts
                    </h3>
                </div>
                <div className="text-center py-8">
                    <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">
                        No security alerts found. Great job!
                    </p>
                </div>
            </div>
        );
    }

    const openAlerts = alerts.filter(a => a.status === 'open');
    const resolvedAlerts = alerts.filter(a => a.status === 'resolved');

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-purple-500" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
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
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Open Alerts ({openAlerts.length})
                    </h4>
                    <div className="space-y-3">
                        {openAlerts.map((alert) => {
                            const SeverityIcon = severityConfig[alert.severity].icon;

                            return (
                                <div
                                    key={alert._id}
                                    className={`
                    border rounded-lg p-4 space-y-3
                    ${severityConfig[alert.severity].border}
                    ${severityConfig[alert.severity].bg}
                  `}
                                >
                                    {/* Alert Header */}
                                    <div className="flex items-start gap-3">
                                        <SeverityIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${severityConfig[alert.severity].color}`} />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                                <h5 className="font-semibold text-gray-900 dark:text-white">
                                                    {alert.title}
                                                </h5>
                                                <span className={`text-xs px-2 py-1 rounded-full ${typeColors[alert.type]}`}>
                                                    {alert.type}
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${severityConfig[alert.severity].bg} ${severityConfig[alert.severity].color}`}>
                                                    {alert.severity}
                                                </span>
                                                {alert.cvssScore && (
                                                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                        CVSS: {alert.cvssScore}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                                {alert.description}
                                            </p>

                                            {/* Affected Files */}
                                            {alert.affectedFiles && alert.affectedFiles.length > 0 && (
                                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                                    <span className="font-medium">Affected files:</span>{' '}
                                                    {alert.affectedFiles.join(', ')}
                                                </div>
                                            )}

                                            {/* CWE/CVE */}
                                            {(alert.cwe || alert.cve) && (
                                                <div className="flex gap-2 text-xs mb-2">
                                                    {alert.cwe && (
                                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                                            {alert.cwe}
                                                        </span>
                                                    )}
                                                    {alert.cve && (
                                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                                            {alert.cve}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Recommendations */}
                                            {alert.recommendations && alert.recommendations.length > 0 && (
                                                <div className="bg-white dark:bg-gray-800 rounded p-3 mb-3">
                                                    <p className="text-xs font-medium text-gray-900 dark:text-white mb-2">
                                                        💡 How to fix:
                                                    </p>
                                                    <ul className="space-y-1">
                                                        {alert.recommendations.map((rec, idx) => (
                                                            <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1">
                                                                <span className="text-purple-500">•</span>
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
                <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        Resolved Alerts ({resolvedAlerts.length})
                    </summary>
                    <div className="mt-3 space-y-2">
                        {resolvedAlerts.map((alert) => (
                            <div
                                key={alert._id}
                                className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 rounded-lg p-3"
                            >
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    <span className="text-sm text-gray-900 dark:text-white font-medium">
                                        {alert.title}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        ({alert.type})
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </details>
            )}
        </div>
    );
}

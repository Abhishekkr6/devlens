export const EXTENSION_ID = 'teampulse-vscode';
export const TOKEN_SECRET_KEY = 'teampulse-auth-token';
export const SELECTED_ORG_KEY = 'teampulse-selected-org';

export const DEFAULT_API_URL = 'https://teampulse-production.up.railway.app';
export const DEFAULT_DASHBOARD_URL = 'https://teampulse18.vercel.app';

export const RISK_THRESHOLDS = {
    LOW: 40,
    MEDIUM: 69,
    HIGH: 70,
} as const;

export const PR_STATES = {
    OPEN: 'open',
    CLOSED: 'closed',
    MERGED: 'merged',
} as const;

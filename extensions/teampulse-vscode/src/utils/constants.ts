export const EXTENSION_ID = 'DevLens-vscode';
export const TOKEN_SECRET_KEY = 'DevLens-auth-token';
export const SELECTED_ORG_KEY = 'DevLens-selected-org';

export const DEFAULT_API_URL = 'https://DevLens-production.up.railway.app';
export const DEFAULT_DASHBOARD_URL = 'https://DevLens18.vercel.app';

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

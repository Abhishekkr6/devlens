// @ts-check

/**
 * VS Code Webview API interface
 * @typedef {Object} VsCodeApi
 * @property {(message: any) => void} postMessage - Send message to extension
 * @property {() => any} getState - Get persisted webview state
 * @property {(state: any) => void} setState - Set persisted webview state
 */

/**
 * Pull Request object structure
 * @typedef {Object} PR
 * @property {number} number - PR number
 * @property {string} [title] - PR title
 * @property {string} [state] - PR state (open, merged, closed)
 * @property {number} [riskScore] - Risk score (0-100)
 * @property {string} [createdAt] - ISO date string of when PR was created
 */

/**
 * PR Data structure
 * @typedef {Object} PRData
 * @property {string} repoFullName - Full repository name
 * @property {string} [repoName] - Repository display name
 * @property {string} [orgId] - Organization ID
 * @property {string} [repoId] - Repository ID
 * @property {Array<PR>} [prs] - List of pull requests
 * @property {Array<PR>} [highRiskPRs] - List of high-risk pull requests
 */

(function () {
    'use strict';

    // @ts-ignore - acquireVsCodeApi is provided by VS Code webview context
    const vscode = acquireVsCodeApi();

    let currentState = null;
    /** @type {PRData|null} */
    let currentData = null;

    // Message handler from extension
    window.addEventListener('message', (event) => {
        const message = event.data;
        handleMessage(message);
    });

    /**
     * Handle messages from the extension
     * @param {{ type: string, loading?: boolean, repoFullName?: string, data?: PRData, message?: string }} message
     */
    function handleMessage(message) {
        if (!message || !message.type) {
            console.error('Invalid message received:', message);
            return;
        }

        switch (message.type) {
            case 'loading':
                setLoading(Boolean(message.loading));
                break;
            case 'unauthenticated':
                showView('unauthenticated');
                break;
            case 'no-repo':
                showView('no-repo');
                break;
            case 'no-org':
                showView('no-org');
                break;
            case 'repo-not-connected':
                showRepoNotConnected(message.repoFullName);
                break;
            case 'success':
                if (message.data) {
                    showSuccess(message.data);
                } else {
                    showError('No data received');
                }
                break;
            case 'error':
                showError(message.message);
                break;
            default:
                console.warn('Unknown message type:', message.type);
        }
    }

    /**
     * Show a specific view by ID
     * @param {string} viewId - The ID of the view to show
     */
    function showView(viewId) {
        hideAllViews();
        const view = document.getElementById(viewId);
        if (view) {
            view.classList.remove('hidden');
        }
        currentState = viewId;
    }

    function hideAllViews() {
        const views = ['loading', 'unauthenticated', 'no-repo', 'no-org', 'repo-not-connected', 'success', 'error'];
        views.forEach((id) => {
            const view = document.getElementById(id);
            if (view) {
                view.classList.add('hidden');
            }
        });
    }

    /**
     * Set loading state visibility
     * @param {boolean} isLoading - Whether to show or hide the loading view
     */
    function setLoading(isLoading) {
        const loadingView = document.getElementById('loading');
        if (loadingView) {
            if (isLoading) {
                loadingView.classList.remove('hidden');
            } else {
                loadingView.classList.add('hidden');
            }
        }
    }

    /**
     * Show repo not connected view
     * @param {string | undefined} repoFullName - Full repository name
     */
    function showRepoNotConnected(repoFullName) {
        showView('repo-not-connected');
        const nameEl = document.getElementById('repoNotConnectedName');
        if (nameEl) {
            nameEl.textContent = repoFullName || 'This repository';
        }
    }

    /**
     * Show success view with PR data
     * @param {PRData} data - Pull request data to display
     */
    function showSuccess(data) {
        if (!data) {
            console.error('No data provided to showSuccess');
            showError('Failed to load data');
            return;
        }

        currentData = data;
        showView('success');

        // Update repo name
        const repoNameEl = document.getElementById('repoName');
        if (repoNameEl) {
            repoNameEl.textContent = data.repoName || data.repoFullName || 'Unknown Repository';
        }

        // Render PRs
        renderPRs(data.prs || []);

        // Render high-risk PRs
        renderHighRiskPRs(data.highRiskPRs || []);
    }

    /**
     * Render pull requests list
     * @param {Array<PR>} prs - Array of pull requests
     */
    function renderPRs(prs) {
        const container = document.getElementById('prs');
        const noPRsEl = document.getElementById('noPRs');

        if (!Array.isArray(prs) || prs.length === 0) {
            if (container) {
                container.innerHTML = '';
            }
            if (noPRsEl) {
                noPRsEl.classList.remove('hidden');
            }
            return;
        }

        if (noPRsEl) {
            noPRsEl.classList.add('hidden');
        }
        if (!container) {
            return;
        }

        // Clear existing content and event listeners
        container.innerHTML = '';

        // Create PR elements
        const fragment = document.createDocumentFragment();
        prs.forEach((pr) => {
            if (!pr || !pr.number) {
                console.warn('Invalid PR data:', pr);
                return;
            }

            const prElement = createPRElementNode(pr);
            fragment.appendChild(prElement);
        });

        container.appendChild(fragment);
    }

    /**
     * Render high-risk pull requests
     * @param {Array<PR>} prs - Array of high-risk pull requests
     */
    function renderHighRiskPRs(prs) {
        const section = document.getElementById('highRiskSection');
        const container = document.getElementById('highRiskPRs');

        if (!Array.isArray(prs) || prs.length === 0) {
            if (section) {
                section.classList.add('hidden');
            }
            return;
        }

        if (section) {
            section.classList.remove('hidden');
        }
        if (!container) {
            return;
        }

        // Clear existing content and event listeners
        container.innerHTML = '';

        // Create PR elements
        const fragment = document.createDocumentFragment();
        prs.forEach((pr) => {
            if (!pr || !pr.number) {
                console.warn('Invalid PR data:', pr);
                return;
            }

            const prElement = createPRElementNode(pr);
            fragment.appendChild(prElement);
        });

        container.appendChild(fragment);
    }

    /**
     * Create PR element node
     * @param {PR} pr - Pull request data
     * @returns {HTMLDivElement} PR element
     */
    function createPRElementNode(pr) {
        const prDiv = document.createElement('div');
        prDiv.className = 'pr-item';
        prDiv.innerHTML = createPRElementHTML(pr);

        // Add click handler
        prDiv.addEventListener('click', () => {
            if (!currentData || !currentData.repoFullName) {
                console.error('Cannot open PR: missing repository information');
                return;
            }
            const url = `https://github.com/${currentData.repoFullName}/pull/${pr.number}`;
            vscode.postMessage({ type: 'openPR', url: url });
        });

        return prDiv;
    }

    /**
     * Create PR element HTML
     * @param {PR} pr - Pull request data
     * @returns {string} HTML string
     */
    function createPRElementHTML(pr) {
        const riskBadge = getRiskBadge(pr.riskScore);
        const stateBadge = getStateBadge(pr.state);
        const timeAgo = getTimeAgo(pr.createdAt);
        const title = escapeHtml(pr.title || 'Untitled PR');

        return `
      <div class="pr-header">
        <span class="pr-number">#${pr.number}</span>
        ${riskBadge}
      </div>
      <div class="pr-title">${title}</div>
      <div class="pr-meta">
        ${stateBadge}
        <span class="pr-time">${timeAgo}</span>
      </div>
    `;
    }

    /**
     * Get risk badge HTML based on risk score
     * @param {number | undefined} riskScore - Risk score value
     * @returns {string} HTML string for risk badge
     */
    function getRiskBadge(riskScore) {
        if (riskScore === undefined || riskScore === null || typeof riskScore !== 'number') {
            return '';
        }

        let className = 'badge-risk-low';
        let label = 'Low Risk';

        if (riskScore >= 70) {
            className = 'badge-risk-high';
            label = 'High Risk';
        } else if (riskScore >= 40) {
            className = 'badge-risk-medium';
            label = 'Medium Risk';
        }

        return `<span class="badge ${className}">${escapeHtml(label)}</span>`;
    }

    /**
     * Get state badge HTML based on PR state
     * @param {string | undefined} state - PR state (open, merged, closed)
     * @returns {string} HTML string for state badge
     */
    function getStateBadge(state) {
        const stateMap = {
            open: { class: 'badge-state-open', label: 'Open' },
            merged: { class: 'badge-state-merged', label: 'Merged' },
            closed: { class: 'badge-state-closed', label: 'Closed' },
        };

        const config = (state && stateMap[/** @type {keyof typeof stateMap} */ (state)]) || stateMap.open;
        return `<span class="badge ${escapeHtml(config.class)}">${escapeHtml(config.label)}</span>`;
    }

    /**
     * Get human-readable time ago string from date
     * @param {string | undefined} dateString - ISO date string
     * @returns {string} Human-readable time ago string
     */
    function getTimeAgo(dateString) {
        if (!dateString) {
            return 'Unknown';
        }

        try {
            const date = new Date(dateString);

            // Check if date is valid
            if (isNaN(date.getTime())) {
                console.warn('Invalid date:', dateString);
                return 'Unknown';
            }

            const now = new Date();
            const diffMs = now.getTime() - date.getTime();

            // Handle future dates or invalid time differences
            if (diffMs < 0) {
                return 'Just now';
            }

            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) {
                return 'Just now';
            } else if (diffMins < 60) {
                return `${diffMins}m ago`;
            } else if (diffHours < 24) {
                return `${diffHours}h ago`;
            } else if (diffDays < 30) {
                return `${diffDays}d ago`;
            } else {
                const diffMonths = Math.floor(diffDays / 30);
                return `${diffMonths}mo ago`;
            }
        } catch (error) {
            console.error('Error calculating time ago:', error);
            return 'Unknown';
        }
    }

    /**
     * Show error view with message
     * @param {string | undefined} message - Error message to display
     */
    function showError(message) {
        showView('error');
        const errorMessageEl = document.getElementById('errorMessage');
        if (errorMessageEl) {
            errorMessageEl.textContent = message || 'An error occurred';
        }
    }

    /**
     * Escape HTML special characters in text
     * @param {string | undefined} text - Text to escape
     * @returns {string} Escaped HTML string
     */
    function escapeHtml(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize event listeners when DOM is ready
    function initializeEventListeners() {
        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', handleLogin);
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', handleRefresh);
        }

        // Open dashboard buttons
        const dashboardBtnIds = [
            'openDashboardBtn',
            'openDashboardNoOrg',
            'openDashboardConnect',
        ];

        dashboardBtnIds.forEach((btnId) => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.addEventListener('click', handleOpenDashboard);
            }
        });

        // Retry button
        const retryBtn = document.getElementById('retryBtn');
        if (retryBtn) {
            retryBtn.addEventListener('click', handleRefresh);
        }

        // Analysis buttons
        const analyzeFileBtn = document.getElementById('analyzeFileBtn');
        if (analyzeFileBtn) {
            analyzeFileBtn.addEventListener('click', () => {
                vscode.postMessage({ type: 'analyzeFile' });
            });
        }
        const analyzeProjectBtn = document.getElementById('analyzeProjectBtn');
        if (analyzeProjectBtn) {
            analyzeProjectBtn.addEventListener('click', () => {
                vscode.postMessage({ type: 'analyzeProject' });
            });
        }
    }

    // Event handler functions
    function handleLogin() {
        vscode.postMessage({ type: 'login' });
    }

    function handleRefresh() {
        vscode.postMessage({ type: 'refresh' });
    }

    function handleOpenDashboard() {
        const message = {
            type: 'openDashboard',
            orgId: currentData && currentData.orgId ? currentData.orgId : undefined,
            repoId: currentData && currentData.repoId ? currentData.repoId : undefined,
        };
        vscode.postMessage(message);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeEventListeners);
    } else {
        // DOM is already ready
        initializeEventListeners();
    }
})();

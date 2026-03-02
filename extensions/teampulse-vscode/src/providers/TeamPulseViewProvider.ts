import * as vscode from 'vscode';
import { AuthManager } from '../auth/authManager';
import { ApiClient } from '../api/client';
import { RepoDetector } from '../git/repoDetector';
import { logger } from '../utils/logger';
import { RISK_THRESHOLDS, SELECTED_ORG_KEY, DEFAULT_DASHBOARD_URL } from '../utils/constants';
import { PullRequest, Organization, Repository } from '../api/types';

export class DevLensViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly authManager: AuthManager,
        private readonly apiClient: ApiClient,
        private readonly repoDetector: RepoDetector
    ) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void | Thenable<void> {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri],
        };

        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

        // Handle messages from webview
        webviewView.webview.onDidReceiveMessage(async (message) => {
            await this.handleMessage(message);
        });

        // Initial load
        this.refresh();
    }

    public async refresh(): Promise<void> {
        if (!this._view) {
            return;
        }

        try {
            this.postMessage({ type: 'loading', loading: true });

            const isAuthenticated = await this.authManager.isAuthenticated();
            if (!isAuthenticated) {
                this.postMessage({ type: 'unauthenticated' });
                return;
            }

            const token = await this.authManager.getToken();
            if (token) {
                this.apiClient.setToken(token);
            }

            // Detect current repository
            const repoInfo = await this.repoDetector.detectCurrentRepo();
            if (!repoInfo) {
                this.postMessage({ type: 'no-repo' });
                return;
            }

            // Get user's organizations
            const orgs = await this.apiClient.getUserOrganizations();
            if (orgs.length === 0) {
                this.postMessage({ type: 'no-org' });
                return;
            }

            // Find which org has this repo
            let selectedOrg: Organization | null = null;
            let connectedRepo: Repository | null = null;

            // Check workspace state for previously selected org
            const savedOrgId = this.context.workspaceState.get<string>(SELECTED_ORG_KEY);
            if (savedOrgId) {
                const savedOrg = orgs.find((o) => o._id === savedOrgId);
                if (savedOrg) {
                    connectedRepo = await this.apiClient.findRepoByFullName(savedOrg._id, repoInfo.repoFullName);
                    if (connectedRepo) {
                        selectedOrg = savedOrg;
                    }
                }
            }

            // If not found in saved org, search all orgs
            if (!selectedOrg) {
                for (const org of orgs) {
                    const repo = await this.apiClient.findRepoByFullName(org._id, repoInfo.repoFullName);
                    if (repo) {
                        selectedOrg = org;
                        connectedRepo = repo;
                        await this.context.workspaceState.update(SELECTED_ORG_KEY, org._id);
                        break;
                    }
                }
            }

            if (!selectedOrg || !connectedRepo) {
                this.postMessage({
                    type: 'repo-not-connected',
                    repoFullName: repoInfo.repoFullName,
                });
                return;
            }

            // Fetch PRs
            const prs = await this.apiClient.getPullRequests(selectedOrg._id, connectedRepo._id, 'open');

            // Separate high-risk PRs
            const highRiskPRs = prs.filter((pr) => (pr.riskScore || 0) >= RISK_THRESHOLDS.HIGH);
            const regularPRs = prs;

            this.postMessage({
                type: 'success',
                data: {
                    repoName: connectedRepo.repoName,
                    repoFullName: connectedRepo.repoFullName,
                    orgName: selectedOrg.name,
                    prs: regularPRs,
                    highRiskPRs,
                },
            });
        } catch (error) {
            logger.error('Failed to refresh view', error);
            this.postMessage({ type: 'error', message: 'Failed to load data' });
        } finally {
            this.postMessage({ type: 'loading', loading: false });
        }
    }

    private async handleMessage(message: any): Promise<void> {
        switch (message.type) {
            case 'login':
                await vscode.commands.executeCommand('DevLens.login');
                break;
            case 'refresh':
                await this.refresh();
                break;
            case 'openDashboard':
                await this.openDashboard(message.orgId, message.repoId);
                break;
            case 'openPR':
                await this.openPR(message.url);
                break;
        }
    }

    private async openDashboard(orgId?: string, repoId?: string): Promise<void> {
        const config = vscode.workspace.getConfiguration('DevLens');
        const dashboardUrl = config.get<string>('dashboardUrl') || DEFAULT_DASHBOARD_URL;

        let url = dashboardUrl;
        if (orgId && repoId) {
            url = `${dashboardUrl}/organization/${orgId}/repos/${repoId}`;
        }

        await vscode.env.openExternal(vscode.Uri.parse(url));
    }

    private async openPR(prUrl: string): Promise<void> {
        if (prUrl) {
            await vscode.env.openExternal(vscode.Uri.parse(prUrl));
        }
    }

    private postMessage(message: any): void {
        this._view?.webview.postMessage(message);
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'webview', 'styles.css')
        );
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.context.extensionUri, 'webview', 'main.js')
        );

        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource};">
  <link href="${styleUri}" rel="stylesheet">
  <title>DevLens</title>
</head>
<body>
  <div id="app">
    <div id="loading" class="hidden">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
    <div id="unauthenticated" class="hidden">
      <div class="empty-state">
        <h2>Welcome to DevLens</h2>
        <p>Connect your GitHub account to view repository insights</p>
        <button id="loginBtn" class="primary-button">Login with GitHub</button>
      </div>
    </div>
    <div id="no-repo" class="hidden">
      <div class="empty-state">
        <h3>No Repository Detected</h3>
        <p>Open a Git repository to get started</p>
      </div>
    </div>
    <div id="no-org" class="hidden">
      <div class="empty-state">
        <h3>No Organizations Found</h3>
        <p>Create an organization in DevLens to get started</p>
        <button id="openDashboardNoOrg" class="primary-button">Open Dashboard</button>
      </div>
    </div>
    <div id="repo-not-connected" class="hidden">
      <div class="empty-state">
        <h3>Repository Not Connected</h3>
        <p id="repoNotConnectedName"></p>
        <p>Connect this repository in DevLens to view insights</p>
        <button id="openDashboardConnect" class="primary-button">Open Dashboard</button>
      </div>
    </div>
    <div id="success" class="hidden">
      <div class="header">
        <h2 id="repoName"></h2>
        <button id="refreshBtn" class="icon-button" title="Refresh">↻</button>
      </div>
      
      <div id="highRiskSection" class="section hidden">
        <h3 class="section-title">⚠️ Risk Alerts</h3>
        <div id="highRiskPRs" class="pr-list"></div>
      </div>

      <div class="section">
        <h3 class="section-title">Pull Requests</h3>
        <div id="prs" class="pr-list"></div>
        <div id="noPRs" class="empty-state hidden">
          <p>No open pull requests</p>
        </div>
      </div>

      <div class="footer">
        <button id="openDashboardBtn" class="primary-button">Open Full Dashboard</button>
      </div>
    </div>
    <div id="error" class="hidden">
      <div class="empty-state">
        <h3>Error</h3>
        <p id="errorMessage">Failed to load data</p>
        <button id="retryBtn" class="primary-button">Retry</button>
      </div>
    </div>
  </div>
  <script src="${scriptUri}"></script>
</body>
</html>`;
    }
}

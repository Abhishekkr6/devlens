import * as vscode from 'vscode';
import { AuthManager } from './auth/authManager';
import { ApiClient } from './api/client';
import { RepoDetector } from './git/repoDetector';
import { DevLensViewProvider } from './providers/TeamPulseViewProvider';
import { logger } from './utils/logger';
import { DEFAULT_DASHBOARD_URL } from './utils/constants';

let authManager: AuthManager;
let apiClient: ApiClient;
let repoDetector: RepoDetector;
let viewProvider: DevLensViewProvider;

export function activate(context: vscode.ExtensionContext) {
    logger.info('DevLens extension activated');

    // Initialize core services
    authManager = new AuthManager(context);
    apiClient = new ApiClient();
    repoDetector = new RepoDetector();

    // Register webview provider
    viewProvider = new DevLensViewProvider(context, authManager, apiClient, repoDetector);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('DevLens.sidebar', viewProvider)
    );

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('DevLens.login', async () => {
            await handleLogin();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('DevLens.logout', async () => {
            await handleLogout();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('DevLens.refresh', async () => {
            await viewProvider.refresh();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('DevLens.openDashboard', async () => {
            const config = vscode.workspace.getConfiguration('DevLens');
            const dashboardUrl = config.get<string>('dashboardUrl') || DEFAULT_DASHBOARD_URL;
            await vscode.env.openExternal(vscode.Uri.parse(dashboardUrl));
        })
    );

    // Listen for workspace folder changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeWorkspaceFolders(() => {
            logger.info('Workspace folders changed, refreshing view');
            viewProvider.refresh();
        })
    );

    logger.info('DevLens extension fully initialized');
}

async function handleLogin(): Promise<void> {
    try {
        logger.info('Starting login flow');

        const token = await vscode.window.showInputBox({
            prompt: 'Enter your DevLens authentication token',
            password: true,
            placeHolder: 'Paste your token here',
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'Token cannot be empty';
                }
                return null;
            },
        });

        if (!token) {
            logger.info('Login cancelled by user');
            return;
        }

        // Store token
        await authManager.setToken(token.trim());
        apiClient.setToken(token.trim());

        // Verify token by fetching user
        const user = await apiClient.getCurrentUser();
        if (!user) {
            await authManager.clearToken();
            apiClient.clearToken();
            vscode.window.showErrorMessage('Invalid token. Please try again.');
            return;
        }

        vscode.window.showInformationMessage(`Logged in as ${user.username || user.githubId}`);
        logger.info(`User logged in: ${user.username || user.githubId}`);

        // Refresh view
        await viewProvider.refresh();
    } catch (error) {
        logger.error('Login failed', error);
        vscode.window.showErrorMessage('Login failed. Please try again.');
    }
}

async function handleLogout(): Promise<void> {
    try {
        const confirm = await vscode.window.showWarningMessage(
            'Are you sure you want to logout?',
            { modal: true },
            'Logout'
        );

        if (confirm !== 'Logout') {
            return;
        }

        await authManager.clearToken();
        apiClient.clearToken();

        vscode.window.showInformationMessage('Logged out successfully');
        logger.info('User logged out');

        // Refresh view
        await viewProvider.refresh();
    } catch (error) {
        logger.error('Logout failed', error);
        vscode.window.showErrorMessage('Logout failed. Please try again.');
    }
}

export function deactivate() {
    logger.info('DevLens extension deactivated');
}

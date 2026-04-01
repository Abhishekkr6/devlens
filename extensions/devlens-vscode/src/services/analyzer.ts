import * as vscode from 'vscode';
import { ApiClient } from '../api/client';
import { DiagnosticsService } from './diagnostics';
import { AnalysisWebviewPanel } from '../providers/AnalysisWebviewPanel';
import { logger } from '../utils/logger';

export class AnalyzerService {
    constructor(
        private readonly apiClient: ApiClient,
        private readonly diagnosticsService: DiagnosticsService,
        private readonly extensionUri: vscode.Uri
    ) {}

    public async analyzeCurrentFile() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor to analyze.');
            return;
        }

        const document = editor.document;
        if (document.languageId !== 'typescript' && document.languageId !== 'javascript' && document.languageId !== 'typescriptreact' && document.languageId !== 'javascriptreact') {
            vscode.window.showWarningMessage('DevLens currently supports only TS/JS files for analysis.');
            // Allow them to continue anyway, but just soft warning
        }

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "DevLens: Analyzing Current File",
            cancellable: false
        }, async (progress) => {
            progress.report({ increment: 10, message: "Extracting code..." });

            const fileName = vscode.workspace.asRelativePath(document.uri);
            const content = document.getText();

            progress.report({ increment: 40, message: "Analyzing with DevLens AI..." });

            const result = await this.apiClient.analyzeCode({
                files: [{ name: fileName, content }]
            });

            if (!result) {
                vscode.window.showErrorMessage('Analysis failed. Check your connection or login status.');
                return;
            }

            progress.report({ increment: 40, message: "Processing results..." });

            this.diagnosticsService.updateDiagnostics(result);
            AnalysisWebviewPanel.createOrShow(this.extensionUri);
            AnalysisWebviewPanel.update(result);

            vscode.window.showInformationMessage(`Analysis complete. Risk Score: ${result.overallRiskScore}`);
        });
    }

    public async analyzeProject() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showInformationMessage('No workspace to analyze.');
            return;
        }

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "DevLens: Analyzing Entire Project",
            cancellable: true
        }, async (progress, token) => {
            progress.report({ increment: 10, message: "Gathering project files..." });

            // In a real scenario, we might want to respect .gitignore
            // For now we get max 10 ts/js files to avoid huge payloads
            const files = await vscode.workspace.findFiles('**/*.{ts,tsx,js,jsx}', '**/node_modules/**');
            
            if (files.length === 0) {
                vscode.window.showInformationMessage('No TS/JS files found in workspace.');
                return;
            }

            const filesToAnalyze = files.slice(0, 10); // LIMIT to 10 for safety
            
            const fileData = await Promise.all(filesToAnalyze.map(async (f) => {
                const document = await vscode.workspace.openTextDocument(f);
                return {
                    name: vscode.workspace.asRelativePath(f),
                    content: document.getText()
                };
            }));

            if (token.isCancellationRequested) return;

            progress.report({ increment: 40, message: "Analyzing with DevLens AI..." });

            const result = await this.apiClient.analyzeCode({ files: fileData });

            if (!result) {
                vscode.window.showErrorMessage('Analysis failed. Check your connection or login status.');
                return;
            }

            if (token.isCancellationRequested) return;
            progress.report({ increment: 40, message: "Processing results..." });

            this.diagnosticsService.updateDiagnostics(result);
            AnalysisWebviewPanel.createOrShow(this.extensionUri);
            AnalysisWebviewPanel.update(result);

            vscode.window.showInformationMessage(`Project analysis complete. Overall Risk Score: ${result.overallRiskScore}`);
        });
    }
}

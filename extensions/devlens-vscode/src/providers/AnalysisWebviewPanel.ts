import * as vscode from 'vscode';
import { ProjectAnalysisResult, FileAnalysisResult } from '../api/types';

export class AnalysisWebviewPanel {
    private static currentPanel: AnalysisWebviewPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (AnalysisWebviewPanel.currentPanel) {
            AnalysisWebviewPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'devlensAnalysis',
            'DevLens Analysis Results',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'webview')]
            }
        );

        AnalysisWebviewPanel.currentPanel = new AnalysisWebviewPanel(panel, extensionUri);
    }

    public static update(result: ProjectAnalysisResult) {
        if (AnalysisWebviewPanel.currentPanel) {
            AnalysisWebviewPanel.currentPanel._update(result);
        }
    }

    private constructor(panel: vscode.WebviewPanel, private readonly _extensionUri: vscode.Uri) {
        this._panel = panel;

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);
    }

    public dispose() {
        AnalysisWebviewPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _update(result: ProjectAnalysisResult) {
        this._panel.webview.postMessage({ type: 'analysisResults', payload: result });
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'unsafe-inline';">
    <title>DevLens Analysis</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            padding: 20px;
            color: var(--vscode-editor-foreground);
            background-color: var(--vscode-editor-background);
        }
        h1, h2, h3 { color: var(--vscode-editor-foreground); }
        .risk-score {
            font-size: 2em;
            font-weight: bold;
            display: flex;
            align-items: center;
        }
        .score-high { color: var(--vscode-testing-iconFailed); }
        .score-medium { color: var(--vscode-testing-iconErrored); }
        .score-low { color: var(--vscode-testing-iconPassed); }
        .file-card {
            border: 1px solid var(--vscode-panel-border);
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 6px;
            background: var(--vscode-editorWidget-background);
        }
        .issue {
            margin-bottom: 10px;
            padding: 10px;
            border-left: 4px solid;
            background: var(--vscode-textBlockQuote-background);
        }
        .issue.high { border-color: var(--vscode-testing-iconFailed); }
        .issue.medium { border-color: var(--vscode-testing-iconErrored); }
        .issue.low { border-color: var(--vscode-testing-iconPassed); }
        .suggestion {
            margin-bottom: 10px;
            padding: 10px;
            border-left: 4px solid var(--vscode-symbolIcon-builtinForeground);
            background: var(--vscode-textBlockQuote-background);
        }
        .insight {
            font-style: italic;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div id="content">
        <h2>DevLens Code Analysis</h2>
        <div id="summary">Waiting for analysis results...</div>
    </div>
    <script>
        const vscode = acquireVsCodeApi();

        function getScoreClass(score) {
            if (score >= 70) return 'score-high';
            if (score >= 40) return 'score-medium';
            return 'score-low';
        }

        function renderFileResult(file) {
            let issuesHtml = '';
            for (const issue of file.issues) {
                issuesHtml += \`<div class="issue \${issue.severity}"><strong>Line \${issue.line} (\${issue.severity}):</strong> \${issue.message}</div>\`;
            }

            let suggestionsHtml = '';
            for (const sugg of file.suggestions) {
                suggestionsHtml += \`<div class="suggestion"><strong>Line \${sugg.line}:</strong> \${sugg.suggestion}</div>\`;
            }

            return \`
                <div class="file-card">
                    <h3>\${file.file}</h3>
                    <div class="risk-score \${getScoreClass(file.riskScore)}">Risk Score: \${file.riskScore}/100</div>
                    <p class="insight"><strong>Insights:</strong> \${file.insights}</p>
                    
                    <h4>Issues (\${file.issues.length})</h4>
                    \${issuesHtml || '<p>No issues found.</p>'}

                    <h4>Suggestions (\${file.suggestions.length})</h4>
                    \${suggestionsHtml || '<p>No suggestions.</p>'}
                </div>
            \`;
        }

        window.addEventListener('message', event => {
            const message = event.data;
            if (message.type === 'analysisResults') {
                const result = message.payload;
                const contentDiv = document.getElementById('content');
                
                let filesHtml = result.files.map(renderFileResult).join('');
                
                contentDiv.innerHTML = \`
                    <h2>Analysis Summary</h2>
                    <div class="risk-score \${getScoreClass(result.overallRiskScore)}">Overall Risk: \${result.overallRiskScore}/100</div>
                    <p>\${result.summary}</p>
                    <hr/>
                    \${filesHtml}
                \`;
            }
        });
    </script>
</body>
</html>`;
    }
}

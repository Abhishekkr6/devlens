import * as vscode from 'vscode';
import { ProjectAnalysisResult, FileAnalysisResult, RiskIssue, Suggestion } from '../api/types';

export class DiagnosticsService {
    private diagnosticCollection: vscode.DiagnosticCollection;
    private highRiskDecoration: vscode.TextEditorDecorationType;
    private mediumRiskDecoration: vscode.TextEditorDecorationType;
    private lowRiskDecoration: vscode.TextEditorDecorationType;

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('devlens-analysis');

        // Create decoration types for highlighting code
        this.highRiskDecoration = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(255, 0, 0, 0.2)',
            isWholeLine: true,
            overviewRulerColor: 'red',
            overviewRulerLane: vscode.OverviewRulerLane.Right
        });

        this.mediumRiskDecoration = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(255, 165, 0, 0.2)',
            isWholeLine: true,
            overviewRulerColor: 'orange',
            overviewRulerLane: vscode.OverviewRulerLane.Right
        });

        this.lowRiskDecoration = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(255, 255, 0, 0.2)',
            isWholeLine: true,
            overviewRulerColor: 'yellow',
            overviewRulerLane: vscode.OverviewRulerLane.Right
        });
    }

    public updateDiagnostics(result: ProjectAnalysisResult) {
        this.diagnosticCollection.clear();

        for (const fileResult of result.files) {
            this.processFileResult(fileResult);
        }
    }

    public clearDiagnostics() {
        this.diagnosticCollection.clear();
        
        // Clear active editor decorations
        if (vscode.window.activeTextEditor) {
            vscode.window.activeTextEditor.setDecorations(this.highRiskDecoration, []);
            vscode.window.activeTextEditor.setDecorations(this.mediumRiskDecoration, []);
            vscode.window.activeTextEditor.setDecorations(this.lowRiskDecoration, []);
        }
    }

    private async processFileResult(fileResult: FileAnalysisResult) {
        // Find the URI for the file
        const uris = await vscode.workspace.findFiles(`**/${fileResult.file}`);
        if (uris.length === 0) return;

        const uri = uris[0];
        const diagnostics: vscode.Diagnostic[] = [];

        for (const issue of fileResult.issues) {
            const line = Math.max(0, issue.line - 1); // 0-indexed
            const range = new vscode.Range(new vscode.Position(line, 0), new vscode.Position(line, 100)); // Default range
            
            let severity = vscode.DiagnosticSeverity.Warning;
            if (issue.severity === 'high' || issue.severity === 'critical') {
                severity = vscode.DiagnosticSeverity.Error;
            } else if (issue.severity === 'low') {
                severity = vscode.DiagnosticSeverity.Information;
            }

            const diagnostic = new vscode.Diagnostic(range, `[DevLens] ${issue.message}`, severity);
            diagnostics.push(diagnostic);
        }

        for (const suggestion of fileResult.suggestions) {
            const line = Math.max(0, suggestion.line - 1);
            const range = new vscode.Range(new vscode.Position(line, 0), new vscode.Position(line, 100));
            const diagnostic = new vscode.Diagnostic(range, `[💡 Suggestion] ${suggestion.suggestion}`, vscode.DiagnosticSeverity.Hint);
            diagnostics.push(diagnostic);
        }

        this.diagnosticCollection.set(uri, diagnostics);

        // Apply editor decorations if this file is currently active
        const editor = vscode.window.visibleTextEditors.find(e => e.document.uri.fsPath === uri.fsPath);
        if (editor) {
            this.applyDecorations(editor, fileResult);
        }
    }

    public applyDecorations(editor: vscode.TextEditor, fileResult: FileAnalysisResult) {
        const highRiskRanges: vscode.Range[] = [];
        const mediumRiskRanges: vscode.Range[] = [];
        const lowRiskRanges: vscode.Range[] = [];

        for (const issue of fileResult.issues) {
            const line = Math.max(0, issue.line - 1);
            const range = editor.document.lineAt(line).range;

            if (issue.severity === 'high' || issue.severity === 'critical') {
                highRiskRanges.push(range);
            } else if (issue.severity === 'medium') {
                mediumRiskRanges.push(range);
            } else if (issue.severity === 'low') {
                lowRiskRanges.push(range);
            }
        }

        editor.setDecorations(this.highRiskDecoration, highRiskRanges);
        editor.setDecorations(this.mediumRiskDecoration, mediumRiskRanges);
        editor.setDecorations(this.lowRiskDecoration, lowRiskRanges);
    }
}

import * as vscode from 'vscode';

class Logger {
    private outputChannel: vscode.OutputChannel;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('TeamPulse');
    }

    info(message: string, ...args: any[]): void {
        const formattedMessage = this.formatMessage('INFO', message, args);
        this.outputChannel.appendLine(formattedMessage);
        console.log(formattedMessage);
    }

    error(message: string, error?: any): void {
        const errorMessage = error ? `${message}: ${error.message || error}` : message;
        const formattedMessage = this.formatMessage('ERROR', errorMessage);
        this.outputChannel.appendLine(formattedMessage);
        console.error(formattedMessage, error);
    }

    warn(message: string, ...args: any[]): void {
        const formattedMessage = this.formatMessage('WARN', message, args);
        this.outputChannel.appendLine(formattedMessage);
        console.warn(formattedMessage);
    }

    debug(message: string, ...args: any[]): void {
        const formattedMessage = this.formatMessage('DEBUG', message, args);
        this.outputChannel.appendLine(formattedMessage);
        console.debug(formattedMessage);
    }

    show(): void {
        this.outputChannel.show();
    }

    private formatMessage(level: string, message: string, args?: any[]): string {
        const timestamp = new Date().toISOString();
        const argsStr = args && args.length > 0 ? ` ${JSON.stringify(args)}` : '';
        return `[${timestamp}] [${level}] ${message}${argsStr}`;
    }
}

export const logger = new Logger();

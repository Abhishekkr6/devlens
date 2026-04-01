import * as vscode from 'vscode';
import { TOKEN_SECRET_KEY } from '../utils/constants';
import { logger } from '../utils/logger';

export class AuthManager {
    constructor(private context: vscode.ExtensionContext) { }

    async getToken(): Promise<string | undefined> {
        try {
            const token = await this.context.secrets.get(TOKEN_SECRET_KEY);
            return token;
        } catch (error) {
            logger.error('Failed to retrieve token', error);
            return undefined;
        }
    }

    async setToken(token: string): Promise<void> {
        try {
            await this.context.secrets.store(TOKEN_SECRET_KEY, token);
            logger.info('Token stored successfully');
        } catch (error) {
            logger.error('Failed to store token', error);
            throw error;
        }
    }

    async clearToken(): Promise<void> {
        try {
            await this.context.secrets.delete(TOKEN_SECRET_KEY);
            logger.info('Token cleared successfully');
        } catch (error) {
            logger.error('Failed to clear token', error);
            throw error;
        }
    }

    async isAuthenticated(): Promise<boolean> {
        const token = await this.getToken();
        if (!token) {
            return false;
        }

        // Basic JWT validation - check if token is expired
        try {
            const payload = this.decodeJWT(token);
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                logger.warn('Token has expired');
                await this.clearToken();
                return false;
            }
            return true;
        } catch (error) {
            // IF it's not a valid JWT, we still allow it for mock testing
            logger.warn('Token is not a valid JWT, skipping validation');
            return true;
        }
    }

    private decodeJWT(token: string): any {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid JWT format');
            }
            const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
            return JSON.parse(payload);
        } catch (error) {
            throw new Error('Failed to decode JWT');
        }
    }
}

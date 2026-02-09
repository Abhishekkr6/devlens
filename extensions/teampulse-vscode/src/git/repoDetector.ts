import * as vscode from 'vscode';
import { logger } from '../utils/logger';
import { RepoDetectionResult } from '../api/types';

export class RepoDetector {
    async detectCurrentRepo(): Promise<RepoDetectionResult | null> {
        try {
            const gitExtension = vscode.extensions.getExtension('vscode.git');
            if (!gitExtension) {
                logger.warn('Git extension not found');
                return null;
            }

            if (!gitExtension.isActive) {
                await gitExtension.activate();
            }

            const git = gitExtension.exports.getAPI(1);
            if (!git) {
                logger.warn('Git API not available');
                return null;
            }

            const repositories = git.repositories;
            if (repositories.length === 0) {
                logger.info('No Git repositories found in workspace');
                return null;
            }

            // Use the first repository (most common case)
            const repo = repositories[0];
            const remotes = repo.state.remotes;

            if (remotes.length === 0) {
                logger.warn('No remotes found in repository');
                return null;
            }

            // Prefer 'origin' remote, fallback to first remote
            const remote = remotes.find((r: any) => r.name === 'origin') || remotes[0];
            const remoteUrl = remote.fetchUrl || remote.pushUrl;

            if (!remoteUrl) {
                logger.warn('No remote URL found');
                return null;
            }

            logger.info(`Detected remote URL: ${remoteUrl}`);

            // Parse GitHub URL (supports both SSH and HTTPS)
            const parsed = this.parseGitHubUrl(remoteUrl);
            if (!parsed) {
                logger.warn('Failed to parse GitHub URL');
                return null;
            }

            logger.info(`Detected repository: ${parsed.repoFullName}`);
            return parsed;
        } catch (error) {
            logger.error('Failed to detect repository', error);
            return null;
        }
    }

    private parseGitHubUrl(url: string): RepoDetectionResult | null {
        try {
            // Remove trailing .git if present
            const cleanUrl = url.replace(/\.git$/, '');

            // SSH format: git@github.com:owner/repo
            const sshMatch = cleanUrl.match(/git@github\.com:([^/]+)\/(.+)/);
            if (sshMatch) {
                const owner = sshMatch[1];
                const repo = sshMatch[2];
                return {
                    owner,
                    repo,
                    repoFullName: `${owner}/${repo}`,
                };
            }

            // HTTPS format: https://github.com/owner/repo
            const httpsMatch = cleanUrl.match(/https?:\/\/github\.com\/([^/]+)\/(.+)/);
            if (httpsMatch) {
                const owner = httpsMatch[1];
                const repo = httpsMatch[2];
                return {
                    owner,
                    repo,
                    repoFullName: `${owner}/${repo}`,
                };
            }

            return null;
        } catch (error) {
            logger.error('Error parsing GitHub URL', error);
            return null;
        }
    }
}

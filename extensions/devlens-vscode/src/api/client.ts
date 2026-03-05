import axios, { AxiosInstance, AxiosError } from 'axios';
import * as vscode from 'vscode';
import { logger } from '../utils/logger';
import { DEFAULT_API_URL } from '../utils/constants';
import {
    User,
    Organization,
    Repository,
    PullRequest,
    ApiResponse,
    PaginatedResponse,
} from './types';

export class ApiClient {
    private axiosInstance: AxiosInstance;
    private token: string | undefined;

    constructor() {
        const config = vscode.workspace.getConfiguration('DevLens');
        const apiUrl = config.get<string>('apiUrl') || DEFAULT_API_URL;

        this.axiosInstance = axios.create({
            baseURL: apiUrl,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor to add auth token
        this.axiosInstance.interceptors.request.use(
            (config) => {
                if (this.token) {
                    config.headers.Authorization = `Bearer ${this.token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor for error handling
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                this.handleApiError(error);
                return Promise.reject(error);
            }
        );
    }

    setToken(token: string): void {
        this.token = token;
    }

    clearToken(): void {
        this.token = undefined;
    }

    async getCurrentUser(): Promise<User | null> {
        try {
            const response = await this.axiosInstance.get<ApiResponse<User>>('/api/v1/me');
            return response.data.data || null;
        } catch (error) {
            logger.error('Failed to get current user', error);
            return null;
        }
    }

    async getUserOrganizations(): Promise<Organization[]> {
        try {
            const response = await this.axiosInstance.get<ApiResponse<Organization[]>>('/api/v1/orgs');
            return response.data.data || [];
        } catch (error) {
            logger.error('Failed to get user organizations', error);
            return [];
        }
    }

    async getOrgRepositories(orgId: string): Promise<Repository[]> {
        try {
            const response = await this.axiosInstance.get<ApiResponse<Repository[]>>(
                `/api/v1/orgs/${orgId}/repos`
            );
            return response.data.data || [];
        } catch (error) {
            logger.error('Failed to get organization repositories', error);
            return [];
        }
    }

    async findRepoByFullName(orgId: string, repoFullName: string): Promise<Repository | null> {
        try {
            const repos = await this.getOrgRepositories(orgId);
            return repos.find((r) => r.repoFullName === repoFullName) || null;
        } catch (error) {
            logger.error('Failed to find repository', error);
            return null;
        }
    }

    async getPullRequests(
        orgId: string,
        repoId: string,
        state: string = 'open'
    ): Promise<PullRequest[]> {
        try {
            const response = await this.axiosInstance.get<ApiResponse<PaginatedResponse<PullRequest>>>(
                '/api/v1/pr/prs',
                {
                    params: { orgId, repoId, state, pageSize: 100 },
                }
            );
            return response.data.data?.items || [];
        } catch (error) {
            logger.error('Failed to get pull requests', error);
            return [];
        }
    }

    private handleApiError(error: AxiosError): void {
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data as any;

            switch (status) {
                case 401:
                    logger.warn('Authentication failed - token may be expired');
                    vscode.window.showWarningMessage(
                        'DevLens session expired. Please login again.',
                        'Login'
                    ).then((selection) => {
                        if (selection === 'Login') {
                            vscode.commands.executeCommand('DevLens.login');
                        }
                    });
                    break;
                case 404:
                    logger.warn('Resource not found');
                    break;
                case 500:
                    logger.error('Server error', data?.message || 'Internal server error');
                    vscode.window.showErrorMessage('DevLens server error. Please try again later.');
                    break;
                default:
                    logger.error(`API error (${status})`, data?.message || error.message);
            }
        } else if (error.request) {
            logger.error('Network error - no response received', error.message);
            vscode.window.showErrorMessage(
                'Unable to connect to DevLens. Check your internet connection.'
            );
        } else {
            logger.error('Request setup error', error.message);
        }
    }
}

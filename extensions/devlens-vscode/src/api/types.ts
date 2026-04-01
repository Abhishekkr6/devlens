export interface User {
    _id: string;
    githubId: string;
    username: string;
    email?: string;
    avatarUrl?: string;
    name?: string;
}

export interface Organization {
    _id: string;
    name: string;
    slug: string;
    createdBy: string;
    members: OrgMember[];
    createdAt: string;
}

export interface OrgMember {
    userId: string;
    role: 'ADMIN' | 'MEMBER' | 'VIEWER';
    status: 'ACTIVE' | 'PENDING';
    joinedAt?: string;
}

export interface Repository {
    _id: string;
    repoFullName: string;
    repoName: string;
    owner: string;
    orgId: string;
    url?: string;
    defaultBranch?: string;
    webhookStatus?: 'active' | 'failed' | 'pending';
    connectedAt?: string;
}

export interface PullRequest {
    _id: string;
    number: number;
    title: string;
    state: 'open' | 'closed' | 'merged';
    riskScore?: number;
    createdAt: string;
    mergedAt?: string;
    closedAt?: string;
    repoId: string | { repoName: string };
    repoName?: string;
    authorGithubId?: string;
    authorName?: string;
    filesChanged?: number;
    additions?: number;
    deletions?: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    page: number;
    pageSize: number;
    total: number;
}

export interface RepoDetectionResult {
    owner: string;
    repo: string;
    repoFullName: string;
}

export interface AnalysisRequest {
    files: { name: string; content: string }[];
}

export interface RiskIssue {
    line: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
}

export interface Suggestion {
    line: number;
    suggestion: string;
}

export interface FileAnalysisResult {
    file: string;
    riskScore: number;
    issues: RiskIssue[];
    suggestions: Suggestion[];
    insights: string;
}

export interface ProjectAnalysisResult {
    overallRiskScore: number;
    files: FileAnalysisResult[];
    summary: string;
}

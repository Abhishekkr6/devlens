import mongoose, { Schema, Document } from 'mongoose';

export interface ISecurityAlert extends Document {
    repoId: mongoose.Types.ObjectId;
    orgId: mongoose.Types.ObjectId;
    prId?: mongoose.Types.ObjectId; // Optional - can be for entire repo

    // Alert Details
    type: 'vulnerability' | 'secret' | 'dependency' | 'code-injection' | 'xss' | 'auth' | 'crypto';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;

    // Affected Code
    affectedFiles: string[];
    affectedLines?: Array<{
        file: string;
        line: number;
    }>;

    // Vulnerability Details
    cwe?: string; // Common Weakness Enumeration (e.g., "CWE-89")
    cve?: string; // Common Vulnerabilities and Exposures
    cvssScore?: number; // 0-10

    // Remediation
    recommendation: string;
    fixAvailable: boolean;
    fixDescription?: string;

    // Status
    status: 'open' | 'resolved' | 'ignored' | 'false-positive';
    resolvedAt?: Date;
    resolvedBy?: mongoose.Types.ObjectId;
    resolutionNote?: string;

    // Metadata
    detectedAt: Date;
    detectedBy: 'gemini' | 'github' | 'internal';
    confidence: number; // 0-100
}

const SecurityAlertSchema = new Schema<ISecurityAlert>({
    repoId: {
        type: Schema.Types.ObjectId,
        ref: 'Repo',
        required: true,
        index: true
    },
    orgId: {
        type: Schema.Types.ObjectId,
        ref: 'Org',
        required: true,
        index: true
    },
    prId: {
        type: Schema.Types.ObjectId,
        ref: 'PR',
        index: true
    },
    type: {
        type: String,
        enum: ['vulnerability', 'secret', 'dependency', 'code-injection', 'xss', 'auth', 'crypto'],
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    affectedFiles: [{
        type: String,
        required: true
    }],
    affectedLines: [{
        file: { type: String, required: true },
        line: { type: Number, required: true }
    }],
    cwe: {
        type: String
    },
    cve: {
        type: String
    },
    cvssScore: {
        type: Number,
        min: 0,
        max: 10
    },
    recommendation: {
        type: String,
        required: true
    },
    fixAvailable: {
        type: Boolean,
        default: false
    },
    fixDescription: {
        type: String
    },
    status: {
        type: String,
        enum: ['open', 'resolved', 'ignored', 'false-positive'],
        default: 'open',
        index: true
    },
    resolvedAt: {
        type: Date
    },
    resolvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    resolutionNote: {
        type: String
    },
    detectedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    detectedBy: {
        type: String,
        enum: ['gemini', 'github', 'internal'],
        required: true
    },
    confidence: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    }
}, {
    timestamps: true
});

// Compound indexes
SecurityAlertSchema.index({ orgId: 1, status: 1, severity: 1 });
SecurityAlertSchema.index({ repoId: 1, status: 1, detectedAt: -1 });
SecurityAlertSchema.index({ prId: 1, status: 1 }, { sparse: true });

export const SecurityAlert = mongoose.model<ISecurityAlert>(
    'SecurityAlert',
    SecurityAlertSchema
);

import mongoose, { Schema, Document } from 'mongoose';

export interface IAIInsight extends Document {
    orgId: mongoose.Types.ObjectId;
    repoId: mongoose.Types.ObjectId;
    prId: mongoose.Types.ObjectId;
    type: 'code_review' | 'security' | 'quality' | 'prediction';
    provider: 'gemini' | 'huggingface' | 'github' | 'eslint' | 'internal';

    // Analysis Results
    score: number; // 0-100
    severity: 'low' | 'medium' | 'high' | 'critical';

    // Detailed findings
    issues: Array<{
        file: string;
        line: number;
        severity: 'low' | 'medium' | 'high' | 'critical';
        category: string;
        message: string;
        suggestion: string;
    }>;

    summary: string;
    recommendations: string[];

    // Metadata
    analyzedAt: Date;
    processingTimeMs: number;
    cached: boolean;

    // Raw data (optional)
    rawData?: any;
}

const AIInsightSchema = new Schema<IAIInsight>({
    orgId: {
        type: Schema.Types.ObjectId,
        ref: 'Org',
        required: true,
        index: true
    },
    repoId: {
        type: Schema.Types.ObjectId,
        ref: 'Repo',
        required: true,
        index: true
    },
    prId: {
        type: Schema.Types.ObjectId,
        ref: 'PR',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['code_review', 'security', 'quality', 'prediction'],
        required: true
    },
    provider: {
        type: String,
        enum: ['gemini', 'huggingface', 'github', 'eslint', 'internal'],
        required: true
    },
    score: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true
    },
    issues: [{
        file: { type: String, required: true },
        line: { type: Number, required: true },
        severity: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            required: true
        },
        category: { type: String, required: true },
        message: { type: String, required: true },
        suggestion: { type: String, required: true }
    }],
    summary: {
        type: String,
        required: true
    },
    recommendations: [{
        type: String
    }],
    analyzedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    processingTimeMs: {
        type: Number,
        required: true
    },
    cached: {
        type: Boolean,
        default: false
    },
    rawData: {
        type: Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
AIInsightSchema.index({ prId: 1, type: 1 });
AIInsightSchema.index({ repoId: 1, analyzedAt: -1 });
AIInsightSchema.index({ orgId: 1, severity: 1, analyzedAt: -1 });

export const AIInsight = mongoose.model<IAIInsight>('AIInsight', AIInsightSchema);

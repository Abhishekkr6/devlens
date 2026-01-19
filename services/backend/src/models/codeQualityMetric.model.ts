import mongoose, { Schema, Document } from 'mongoose';

export interface ICodeQualityMetric extends Document {
    repoId: mongoose.Types.ObjectId;
    orgId: mongoose.Types.ObjectId;
    prId?: mongoose.Types.ObjectId; // Optional - can be for entire repo

    // Core Metrics
    maintainabilityIndex: number; // 0-100
    cyclomaticComplexity: number;
    linesOfCode: number;
    codeSmells: number;
    technicalDebtMinutes: number;

    // Halstead Metrics
    halsteadVolume: number;
    halsteadDifficulty: number;
    halsteadEffort: number;

    // Quality Grade
    grade: 'A' | 'B' | 'C' | 'D' | 'F';

    // Trend Analysis
    trend?: 'improving' | 'stable' | 'degrading';
    previousScore?: number;

    // Metadata
    calculatedAt: Date;
    filesAnalyzed: number;
}

const CodeQualityMetricSchema = new Schema<ICodeQualityMetric>({
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
    maintainabilityIndex: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    cyclomaticComplexity: {
        type: Number,
        required: true,
        min: 0
    },
    linesOfCode: {
        type: Number,
        required: true,
        min: 0
    },
    codeSmells: {
        type: Number,
        required: true,
        min: 0
    },
    technicalDebtMinutes: {
        type: Number,
        required: true,
        min: 0
    },
    halsteadVolume: {
        type: Number,
        required: true,
        min: 0
    },
    halsteadDifficulty: {
        type: Number,
        required: true,
        min: 0
    },
    halsteadEffort: {
        type: Number,
        required: true,
        min: 0
    },
    grade: {
        type: String,
        enum: ['A', 'B', 'C', 'D', 'F'],
        required: true
    },
    trend: {
        type: String,
        enum: ['improving', 'stable', 'degrading']
    },
    previousScore: {
        type: Number,
        min: 0,
        max: 100
    },
    calculatedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    filesAnalyzed: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true
});

// Compound indexes
CodeQualityMetricSchema.index({ repoId: 1, calculatedAt: -1 });
CodeQualityMetricSchema.index({ orgId: 1, grade: 1 });
CodeQualityMetricSchema.index({ prId: 1 }, { sparse: true });

export const CodeQualityMetric = mongoose.model<ICodeQualityMetric>(
    'CodeQualityMetric',
    CodeQualityMetricSchema
);

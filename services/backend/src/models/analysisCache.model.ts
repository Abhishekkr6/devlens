import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalysisCache extends Document {
    prId: mongoose.Types.ObjectId;
    commitSHA: string;
    analysis: {
        overallScore: number;
        aiReview: any;
        qualityMetrics: any;
        bugProbability: any;
        recommendations: string[];
        processingTimeMs: number;
    };
    createdAt: Date;
    expiresAt: Date;
}

const AnalysisCacheSchema = new Schema<IAnalysisCache>({
    prId: {
        type: Schema.Types.ObjectId,
        ref: 'PullRequest',
        required: true,
        index: true
    },
    commitSHA: {
        type: String,
        required: true,
        index: true
    },
    analysis: {
        overallScore: { type: Number, required: true },
        aiReview: { type: Schema.Types.Mixed },
        qualityMetrics: { type: Schema.Types.Mixed },
        bugProbability: { type: Schema.Types.Mixed },
        recommendations: [{ type: String }],
        processingTimeMs: { type: Number }
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    }
});

// Compound index for efficient lookups
AnalysisCacheSchema.index({ prId: 1, commitSHA: 1 }, { unique: true });

// TTL index to auto-delete expired cache entries
AnalysisCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AnalysisCacheModel = mongoose.model<IAnalysisCache>('AnalysisCache', AnalysisCacheSchema);

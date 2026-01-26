import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
    userId: mongoose.Types.ObjectId;
    orgId: mongoose.Types.ObjectId;
    message: string;
    response: string;
    intent: string;
    metadata?: {
        confidence?: number;
        dataReturned?: boolean;
        processingTimeMs?: number;
    };
    createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        orgId: {
            type: Schema.Types.ObjectId,
            ref: 'Org',
            required: true,
            index: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        response: {
            type: String,
            required: true
        },
        intent: {
            type: String,
            required: true,
            enum: ['pr_list', 'developer_stats', 'commit_history', 'code_quality', 'security_alerts', 'repo_metrics', 'general', 'help', 'error']
        },
        metadata: {
            confidence: Number,
            dataReturned: Boolean,
            processingTimeMs: Number
        }
    },
    {
        timestamps: true
    }
);

// Compound index for efficient queries
ChatMessageSchema.index({ userId: 1, orgId: 1, createdAt: -1 });

// TTL index - auto-delete messages after 30 days
ChatMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const ChatMessageModel = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);

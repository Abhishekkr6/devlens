import { Schema, model, Document } from "mongoose";

export interface IPR extends Document {
  providerPrId: string;
  repoId: Schema.Types.ObjectId | string;
  orgId: Schema.Types.ObjectId | string;
  number: number;
  title: string;
  authorGithubId?: string;
  state: string;
  createdAt?: Date;
  mergedAt?: Date | null;
  closedAt?: Date | null;
  updatedAt?: Date | null;
  filesChanged?: number;
  additions?: number;
  deletions?: number;
  reviewers?: any[];
  commentsCount?: number;
  lastReviewAt?: Date | null;
  riskScore?: number;
  processed?: boolean;
}

const PRSchema = new Schema<IPR>(
  {
    providerPrId: { type: String, required: true }, // 🔥 REMOVED global uniqueness for multi-org support
    repoId: { type: Schema.Types.ObjectId, ref: "Repo", required: true },
    orgId: { type: Schema.Types.ObjectId, ref: "Org", required: true }, // 🔥 Now REQUIRED for multi-tenant isolation
    number: Number,
    title: String,
    authorGithubId: String,
    state: String,
    createdAt: Date,
    mergedAt: Date,
    closedAt: Date,
    updatedAt: Date,
    filesChanged: Number,
    additions: Number,
    deletions: Number,
    reviewers: [Schema.Types.Mixed],
    commentsCount: Number,
    lastReviewAt: Date,
    riskScore: Number,
    processed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 🔥 MULTI-TENANT INDEXES
// Allow same PR (providerPrId) across different orgs, but unique within each org
PRSchema.index({ orgId: 1, providerPrId: 1 }, { unique: true });

// Query optimization indexes
PRSchema.index({ orgId: 1, state: 1, createdAt: -1 });
PRSchema.index({ repoId: 1, state: 1, createdAt: -1 });
PRSchema.index({ riskScore: -1 });

export const PRModel = model<IPR>("PullRequest", PRSchema);

import { Schema, model, Document } from "mongoose";

import { Types } from "mongoose";

export interface ICommit extends Document {
  sha: string;
  repoId: Types.ObjectId;
  orgId: Types.ObjectId;
  authorGithubId?: string;
  authorName?: string;
  message?: string;
  timestamp?: Date;
  filesChangedCount?: number;
  additions?: number;
  deletions?: number;
  files?: string[];
  modulePaths?: string[];
  processed?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommitSchema = new Schema<ICommit>(
  {
    sha: { type: String, required: true }, // 🔥 REMOVED global uniqueness for multi-org support
    repoId: { type: Schema.Types.ObjectId, ref: "Repo", required: true },
    orgId: { type: Schema.Types.ObjectId, ref: "Org", required: true }, // 🔥 Now REQUIRED for multi-tenant isolation
    authorGithubId: String,
    authorName: String,
    message: String,
    timestamp: Date,
    filesChangedCount: Number,
    additions: Number,
    deletions: Number,
    files: [String],
    modulePaths: [String],
    processed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 🔥 MULTI-TENANT INDEXES
// Allow same commit (sha) across different orgs, but unique within each org
CommitSchema.index({ orgId: 1, sha: 1 }, { unique: true });

// Query optimization indexes
CommitSchema.index({ orgId: 1, timestamp: -1 });
CommitSchema.index({ repoId: 1, timestamp: -1 });
CommitSchema.index({ authorGithubId: 1, timestamp: -1 });

export const CommitModel = model<ICommit>("Commit", CommitSchema);

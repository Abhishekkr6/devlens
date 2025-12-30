import { Schema, model, Document } from "mongoose";

import { Types } from "mongoose";

export interface IRepo extends Document {
  provider: string;
  providerRepoId: string;
  orgId: Types.ObjectId;
  name: string;
  url: string;
  defaultBranch?: string;
  webhookSecretHash?: string;
  connectedAt?: Date;
}

const RepoSchema = new Schema<IRepo>({
  provider: { type: String, required: true, default: "github" },
  providerRepoId: { type: String, required: true }, // Removed unique: true
  orgId: { type: Schema.Types.ObjectId, ref: "Org" },
  name: String,
  url: String,
  defaultBranch: String,
  webhookSecretHash: String,
  connectedAt: Date,
}, { timestamps: true });

// Compound unique index: A repo can be in multiple orgs, but unique per org
RepoSchema.index({ providerRepoId: 1, orgId: 1 }, { unique: true });

export const RepoModel = model<IRepo>("Repo", RepoSchema);

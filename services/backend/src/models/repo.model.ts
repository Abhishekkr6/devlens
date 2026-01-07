import { Schema, model, Document, Types } from "mongoose";

export interface IRepo extends Document {
  provider: "github";
  repoFullName: string;      // owner/repo (EXACT webhook match)
  repoName: string;          // repo only (UI use)
  owner: string;             // owner/org
  providerRepoId: number;    // GitHub numeric repo id
  orgId: Types.ObjectId;
  url?: string;
  defaultBranch?: string;
  webhookSecretHash?: string;
  connectedAt?: Date;
}

const RepoSchema = new Schema<IRepo>(
  {
    provider: { type: String, required: true, default: "github" },

    repoFullName: {
      type: String,
      required: true,
      index: true,
    },

    repoName: {
      type: String,
      required: true,
    },

    owner: {
      type: String,
      required: true,
    },

    providerRepoId: {
      type: Number, // 🔥 FIX: NUMBER, not string
      required: true,
    },

    orgId: {
      type: Schema.Types.ObjectId,
      ref: "Org",
      required: true,
      index: true,
    },

    url: String,
    defaultBranch: String,
    webhookSecretHash: String,
    connectedAt: Date,
  },
  { timestamps: true }
);

// ✅ Correct uniqueness: same repo allowed in different orgs
RepoSchema.index({ repoFullName: 1, orgId: 1 }, { unique: true });

export const RepoModel = model<IRepo>("Repo", RepoSchema);

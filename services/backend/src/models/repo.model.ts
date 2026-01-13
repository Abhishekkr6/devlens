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
  webhookId?: number;        // GitHub webhook ID
  webhookStatus?: "active" | "failed" | "pending";
  webhookError?: string;     // Error message if webhook creation failed
  connectedAt?: Date;
  settings?: {
    alertThresholds: {
      churnRate: number;        // default: 30
      openPRs: number;          // default: 10
      highRiskPRs: number;      // default: 3
      criticalAlerts: number;   // default: 1
    };
    notifications: {
      email: boolean;           // default: true
      highRiskPRAlerts: boolean; // default: true
      criticalAlerts: boolean;  // default: true
      weeklySummary: boolean;   // default: false
    };
  };
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
    webhookId: Number,
    webhookStatus: {
      type: String,
      enum: ["active", "failed", "pending"],
    },
    webhookError: String,
    connectedAt: Date,
    settings: {
      type: {
        alertThresholds: {
          type: {
            churnRate: { type: Number, default: 30 },
            openPRs: { type: Number, default: 10 },
            highRiskPRs: { type: Number, default: 3 },
            criticalAlerts: { type: Number, default: 1 },
          },
          default: () => ({
            churnRate: 30,
            openPRs: 10,
            highRiskPRs: 3,
            criticalAlerts: 1,
          }),
        },
        notifications: {
          type: {
            email: { type: Boolean, default: true },
            highRiskPRAlerts: { type: Boolean, default: true },
            criticalAlerts: { type: Boolean, default: true },
            weeklySummary: { type: Boolean, default: false },
          },
          default: () => ({
            email: true,
            highRiskPRAlerts: true,
            criticalAlerts: true,
            weeklySummary: false,
          }),
        },
      },
      default: () => ({
        alertThresholds: {
          churnRate: 30,
          openPRs: 10,
          highRiskPRs: 3,
          criticalAlerts: 1,
        },
        notifications: {
          email: true,
          highRiskPRAlerts: true,
          criticalAlerts: true,
          weeklySummary: false,
        },
      }),
    },
  },
  { timestamps: true }
);

// ✅ Correct uniqueness: same repo allowed in different orgs
RepoSchema.index({ repoFullName: 1, orgId: 1 }, { unique: true });

export const RepoModel = model<IRepo>("Repo", RepoSchema);

import { Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
  githubId: string;
  login?: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  role: "admin" | "lead" | "dev" | "viewer";
  plan: "free" | "pro";
  subscriptionStatus: "active" | "expired" | "past_due" | "none";
  subscriptionExpiry?: Date;

  orgIds: Types.ObjectId[];

  defaultOrgId?: Types.ObjectId | null;

  githubAccessToken: string;
  githubRefreshToken?: string;
  githubScopes?: string[];

  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

const UserSchema = new Schema<IUser>(
  {
    githubId: { type: String, required: true, unique: true },
    login: { type: String },
    name: String,
    email: String,
    avatarUrl: String,

    role: { type: String, default: "dev" },
    plan: { type: String, enum: ["free", "pro"], default: "free" },
    subscriptionStatus: { type: String, enum: ["active", "expired", "past_due", "none"], default: "none" },
    subscriptionExpiry: { type: Date },

    orgIds: [{ type: Schema.Types.ObjectId, ref: "Org" }],

    defaultOrgId: {
      type: Schema.Types.ObjectId,
      ref: "Org",
      default: null,
    },

    githubAccessToken: { type: String, required: true },
    githubRefreshToken: { type: String },
    githubScopes: [String],
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const UserModel = model<IUser>("User", UserSchema);

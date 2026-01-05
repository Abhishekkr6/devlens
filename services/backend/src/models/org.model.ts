import { Schema, model, Document, Types } from "mongoose";

export interface IOrg extends Document {
  name: string;
  slug: string;
  createdBy: Types.ObjectId;

  members: {
    userId: Types.ObjectId;
    role: "ADMIN" | "MEMBER" | "VIEWER";
    status: "active" | "pending";
    invitedBy?: Types.ObjectId;
    joinedAt?: Date;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

const OrgSchema = new Schema<IOrg>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["ADMIN", "MEMBER", "VIEWER"],
          default: "MEMBER",
        },
        status: {
          type: String,
          enum: ["active", "pending"],
          default: "active",
        },
        invitedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export const OrgModel = model<IOrg>("Org", OrgSchema);

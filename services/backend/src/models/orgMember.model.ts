import { Schema, model, Document, Types } from "mongoose";

export interface IOrgMember extends Document {
    orgId: Types.ObjectId;
    userId: Types.ObjectId;
    role: "ADMIN" | "MEMBER" | "VIEWER";
    status: "active" | "pending";
    invitedBy?: Types.ObjectId;
    joinedAt: Date;
}

const OrgMemberSchema = new Schema<IOrgMember>(
    {
        orgId: {
            type: Schema.Types.ObjectId,
            ref: "Org",
            required: true,
        },
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
    { timestamps: true }
);

// Compound index to ensure a user is only in an org once
OrgMemberSchema.index({ orgId: 1, userId: 1 }, { unique: true });

// Index for fetching a user's organizations quickly
OrgMemberSchema.index({ userId: 1 });

export const OrgMemberModel = model<IOrgMember>("OrgMember", OrgMemberSchema);

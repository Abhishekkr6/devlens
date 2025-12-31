import { Schema, model, Document, Types } from "mongoose";

export interface INotification extends Document {
    recipientId: Types.ObjectId;
    type: "alert" | "invite" | "info" | "success";
    title: string;
    message: string;
    link?: string;
    link?: string;
    read: boolean;
    metadata?: {
        orgId?: string;
        role?: string;
    };
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        type: {
            type: String,
            enum: ["alert", "invite", "info", "success"],
            required: true,
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        link: { type: String },
        read: { type: Boolean, default: false },
        metadata: {
            orgId: { type: String },
            role: { type: String },
        },
    },
    { timestamps: true }
);

export const NotificationModel = model<INotification>(
    "Notification",
    NotificationSchema
);

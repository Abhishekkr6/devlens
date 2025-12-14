import { Schema, model, Document, Types } from "mongoose";

export interface IOrg extends Document {
  name: string;
  slug: string;
  createdBy: Types.ObjectId;

  members: {
    userId: Types.ObjectId;
    role: "ADMIN" | "MEMBER" | "VIEWER";
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
      },
    ],
  },
  { timestamps: true }
);

export const OrgModel = model<IOrg>("Org", OrgSchema);

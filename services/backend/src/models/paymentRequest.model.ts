import { Schema, model, Document, Types } from "mongoose";

export interface IPaymentRequest extends Document {
  userId: Types.ObjectId;
  amount: number;
  transactionId: string;
  screenshotUrl?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const PaymentRequestSchema = new Schema<IPaymentRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    transactionId: { type: String, required: true },
    screenshotUrl: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const PaymentRequestModel = model<IPaymentRequest>(
  "PaymentRequest",
  PaymentRequestSchema
);

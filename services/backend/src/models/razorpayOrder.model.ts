import { Schema, model, Document, Types } from "mongoose";

export interface IRazorpayOrder extends Document {
  userId: Types.ObjectId;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number; // in paise (100 = ₹1)
  currency: string;
  status: "created" | "paid" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const RazorpayOrderSchema = new Schema<IRazorpayOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
  },
  { timestamps: true }
);

export const RazorpayOrderModel = model<IRazorpayOrder>(
  "RazorpayOrder",
  RazorpayOrderSchema
);

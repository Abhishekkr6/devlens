import { Request, Response } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { RazorpayOrderModel } from "../models/razorpayOrder.model";
import { UserModel } from "../models/user.model";
import logger from "../utils/logger";

// Razorpay client will be initialized dynamically inside the route handler
// to prevent the entire app from crashing if keys are missing from the environment.

const PRO_AMOUNT_PAISE = 49900; // ₹499 in paise

// ── 1. Create Order ──────────────────────────────────────────────────────────
export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // If user is already Pro, no need to create an order
    const user = await UserModel.findById(userId).lean();
    if (user?.plan === "pro") {
      return res
        .status(400)
        .json({ success: false, error: "You are already on the Pro plan." });
    }

    // Create Razorpay order
    const options = {
      amount: PRO_AMOUNT_PAISE,
      currency: "INR",
      receipt: `devlens_${userId}_${Date.now()}`,
      notes: {
        userId: userId.toString(),
        plan: "pro",
      },
    };

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId.includes("yourActualKeyHere") || keySecret.includes("yourActualSecretHere")) {
      return res.status(500).json({ success: false, error: "Payment gateway is not configured properly. Missing or invalid API keys in server environment." });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create(options);

    // Persist the order in DB
    await RazorpayOrderModel.create({
      userId,
      razorpayOrderId: order.id,
      amount: PRO_AMOUNT_PAISE,
      currency: "INR",
      status: "created",
    });

    logger.info(
      { userId, orderId: order.id, action: "RAZORPAY_ORDER_CREATED" },
      "Razorpay order created"
    );

    return res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: PRO_AMOUNT_PAISE,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (err) {
    logger.error({ err }, "createOrder error");
    return res
      .status(500)
      .json({ success: false, error: "Failed to create payment order." });
  }
};

// ── 2. Verify Payment (called by frontend after checkout success) ────────────
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, error: "Missing payment details." });
    }

    // Verify HMAC-SHA256 signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      logger.warn(
        { userId, razorpay_order_id, action: "SIGNATURE_MISMATCH" },
        "Razorpay signature verification failed"
      );
      return res
        .status(400)
        .json({ success: false, error: "Payment verification failed. Invalid signature." });
    }

    // Signature is valid — upgrade user to Pro
    const orderRecord = await RazorpayOrderModel.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!orderRecord) {
      return res
        .status(404)
        .json({ success: false, error: "Order record not found." });
    }

    // Idempotency: if already paid, just return success
    if (orderRecord.status === "paid") {
      return res.json({ success: true, message: "Already upgraded to Pro." });
    }

    // Mark order as paid
    orderRecord.razorpayPaymentId = razorpay_payment_id;
    orderRecord.status = "paid";
    await orderRecord.save();

    // Upgrade user
    await UserModel.findByIdAndUpdate(orderRecord.userId, {
      plan: "pro",
      subscriptionStatus: "active",
      subscriptionExpiry: undefined,
    });

    logger.info(
      {
        userId: orderRecord.userId,
        razorpay_payment_id,
        action: "USER_UPGRADED_TO_PRO",
      },
      "User successfully upgraded to Pro via Razorpay"
    );

    return res.json({
      success: true,
      message: "Payment verified! You are now a Pro user.",
    });
  } catch (err) {
    logger.error({ err }, "verifyPayment error");
    return res
      .status(500)
      .json({ success: false, error: "Internal server error during verification." });
  }
};

// ── 3. Razorpay Webhook (backup — called directly by Razorpay servers) ───────
export const razorpayWebhook = async (req: Request, res: Response) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret) {
      // Verify webhook signature
      const receivedSignature = req.headers["x-razorpay-signature"] as string;
      const body = (req as any).rawBody || req.body;
      const bodyString =
        typeof body === "string" ? body : JSON.stringify(body);

      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(bodyString)
        .digest("hex");

      if (receivedSignature !== expectedSignature) {
        logger.warn("Razorpay webhook signature mismatch");
        return res.status(400).json({ error: "Invalid webhook signature" });
      }
    }

    const event = req.body;
    const eventType = event?.event;

    if (eventType === "payment.captured") {
      const payment = event?.payload?.payment?.entity;
      const orderId = payment?.order_id;
      const paymentId = payment?.id;

      if (!orderId) {
        return res.status(200).json({ received: true });
      }

      const orderRecord = await RazorpayOrderModel.findOne({
        razorpayOrderId: orderId,
      });

      if (orderRecord && orderRecord.status !== "paid") {
        orderRecord.razorpayPaymentId = paymentId;
        orderRecord.status = "paid";
        await orderRecord.save();

        // Upgrade user (idempotent)
        await UserModel.findByIdAndUpdate(orderRecord.userId, {
          plan: "pro",
          subscriptionStatus: "active",
          subscriptionExpiry: undefined,
        });

        logger.info(
          {
            userId: orderRecord.userId,
            orderId,
            paymentId,
            action: "WEBHOOK_USER_UPGRADED_TO_PRO",
          },
          "User upgraded to Pro via Razorpay webhook"
        );
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    logger.error({ err }, "razorpayWebhook error");
    return res.status(500).json({ error: "Webhook processing failed" });
  }
};

// ── 4. Get Payment Status (for frontend to check if user has paid) ───────────
export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const orders = await RazorpayOrderModel.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, data: orders });
  } catch (err) {
    logger.error({ err }, "getPaymentStatus error");
    return res.status(500).json({ success: false });
  }
};

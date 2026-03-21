import { Request, Response } from "express";
import { PaymentRequestModel } from "../models/paymentRequest.model";
import { UserModel } from "../models/user.model";
import logger from "../utils/logger";

export const submitRequest = async (req: Request, res: Response) => {
  try {
    const { transactionId, screenshotUrl } = req.body;
    const userId = (req as any).user?.id || (req as any).user?._id;

    if (!userId || !transactionId) {
      return res.status(400).json({ success: false, error: "Transaction ID is required" });
    }

    const pendingRequest = await PaymentRequestModel.findOne({ userId, status: "pending" });
    if (pendingRequest) {
      return res.status(429).json({ success: false, error: "You already have a pending verification request. Please wait for it to be processed." });
    }

    const existing = await PaymentRequestModel.findOne({ transactionId });
    if (existing) {
      return res.status(409).json({ success: false, error: "This transaction ID has already been submitted." });
    }

    const payload = await PaymentRequestModel.create({
      userId,
      amount: 499, // Updated default Pro amount
      transactionId,
      screenshotUrl,
      status: "pending",
    });

    logger.info({ userId, transactionId, action: "PAYMENT_REQUEST_CREATED" }, "User created a manual payment request");

    return res.json({ success: true, data: payload });
  } catch (err) {
    logger.error({ err }, "submitRequest error");
    return res.status(500).json({ success: false, error: "Internal Error" });
  }
};

export const getUserRequests = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const requests = await PaymentRequestModel.find({ userId }).sort({ createdAt: -1 });
    return res.json({ success: true, data: requests });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

export const listPendingRequests = async (req: Request, res: Response) => {
  try {
    const requests = await PaymentRequestModel.find().populate("userId", "name email plan").sort({ createdAt: -1 });
    return res.json({ success: true, data: requests });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

export const approveRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requestItem = await PaymentRequestModel.findById(id);

    if (!requestItem) {
      return res.status(404).json({ success: false, error: "Not found" });
    }

    if (requestItem.status !== "pending") {
      return res.status(400).json({ success: false, error: "Request is already processed" });
    }

    requestItem.status = "approved";
    await requestItem.save();

    const user = await UserModel.findById(requestItem.userId);
    if (user) {
      user.plan = "pro";
      user.subscriptionStatus = "active";
      const now = new Date();
      if (user.subscriptionExpiry && user.subscriptionExpiry > now) {
        user.subscriptionExpiry = new Date(user.subscriptionExpiry.getTime() + 30 * 24 * 60 * 60 * 1000);
      } else {
        user.subscriptionExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      }
      await user.save();
      logger.info({ userId: user._id, action: "ADMIN_APPROVED_UPGRADE" }, "Admin upgraded user to Pro manually");
    }

    return res.json({ success: true, message: "Approved successfully" });
  } catch (err) {
    logger.error({ err }, "approveRequest error");
    return res.status(500).json({ success: false });
  }
};

export const rejectRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const requestItem = await PaymentRequestModel.findById(id);

    if (!requestItem) {
      return res.status(404).json({ success: false, error: "Not found" });
    }

    requestItem.status = "rejected";
    await requestItem.save();

    return res.json({ success: true, message: "Rejected successfully" });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};

import { Router } from "express";
import * as razorpayController from "../controllers/razorpay.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// ── User Routes ──────────────────────────────────────────────────────────────
// Create a new Razorpay order (returns order_id to open checkout on frontend)
router.post("/create-order", authMiddleware, razorpayController.createOrder);

// Verify payment signature after Razorpay checkout success
router.post("/verify", authMiddleware, razorpayController.verifyPayment);

// Get user's payment history / status
router.get("/status", authMiddleware, razorpayController.getPaymentStatus);

// ── Razorpay Webhook Route ───────────────────────────────────────────────────
// NOTE: Raw body is handled in app.ts before express.json() for this path
router.post("/webhook", razorpayController.razorpayWebhook);

export default router;

import { Router } from "express";
import * as manualPaymentController from "../controllers/manualPayment.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

const requireAdmin = (req: any, res: any, next: any) => {
  // Simple check for global admin role set in the user model
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ error: "Admin access required" });
  }
};

// User Facing
router.post("/request", authMiddleware, manualPaymentController.submitRequest);
router.get("/status", authMiddleware, manualPaymentController.getUserRequests);

// Admin Facing
router.get("/admin", authMiddleware, requireAdmin, manualPaymentController.listPendingRequests);
router.post("/admin/:id/approve", authMiddleware, requireAdmin, manualPaymentController.approveRequest);
router.post("/admin/:id/reject", authMiddleware, requireAdmin, manualPaymentController.rejectRequest);

export default router;

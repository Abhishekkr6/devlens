import { Router } from "express";
import * as manualPaymentController from "../controllers/manualPayment.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

import { UserModel } from "../models/user.model";

const requireAdmin = async (req: any, res: any, next: any) => {
  try {
    const userId = req.userId || req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await UserModel.findById(userId).lean();
    if (user && user.role === "admin") {
      next();
    } else {
      res.status(403).json({ error: "Admin access required" });
    }
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
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

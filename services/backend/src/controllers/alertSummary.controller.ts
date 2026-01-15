import { Request, Response } from "express";
import { Types } from "mongoose";
import { AlertModel } from "../models/alert.model";

export const getAlertSummary = async (req: Request, res: Response) => {
  try {
    const { orgId } = req.params;

    // Security: Ensure we only fetch for this org
    // 🔥 FIXED: Return ALL alerts (both resolved and unresolved)
    // Frontend will handle filtering by resolved/unresolved status
    const alerts = await AlertModel.find({
      orgId: new Types.ObjectId(orgId),
      // Removed: resolvedAt: null - now returns both resolved and unresolved
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.json({ success: true, data: alerts });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};

export const acknowledgeAlert = async (req: any, res: Response) => {
  try {
    const { orgId, alertId } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

    const alert = await AlertModel.findOne({
      _id: alertId,
      orgId: new Types.ObjectId(orgId)
    });

    if (!alert) {
      return res.status(404).json({ success: false, error: "Alert not found" });
    }

    alert.resolvedAt = new Date();
    alert.resolvedBy = String(userId);
    await alert.save();

    return res.json({ success: true, data: alert });
  } catch (error) {
    console.error("ACKNOWLEDGE ALERT ERROR", error);
    return res.status(500).json({ success: false, error: "Failed to acknowledge alert" });
  }
};

import { Request, Response } from "express";
import { Types } from "mongoose";
import { AlertModel } from "../models/alert.model";
import { UserModel } from "../models/user.model";
import { checkUserSubscription } from "../services/subscription.service";

export const getAlertSummary = async (req: Request, res: Response) => {
  try {
    const { orgId } = req.params;
    const userId = (req as any).user?.id || (req as any).user?._id;

    let isPro = false;
    if (userId) {
      const user = await UserModel.findById(userId);
      isPro = await checkUserSubscription(user);
    }

    const alerts = await AlertModel.find({
      orgId: new Types.ObjectId(orgId),
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    let finalAlerts = alerts;
    let hiddenCount = 0;
    
    if (!isPro) {
      finalAlerts = alerts.filter(a => {
        const anyA = a as any;
        const isHighRisk = anyA.severity === 'high' || anyA.severity === 'critical' || anyA.type === 'high_risk_pr';
        if (isHighRisk) hiddenCount++;
        return !isHighRisk;
      });
    }

    return res.json({ 
      success: true, 
      data: finalAlerts,
      meta: {
        hiddenHighRiskCount: hiddenCount,
        isPro
      }
    });
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

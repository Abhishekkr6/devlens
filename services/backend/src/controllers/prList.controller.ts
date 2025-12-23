import { Request, Response } from "express";
import { Types } from "mongoose";
import { PRModel } from "../models/pr.model";

export const listPRs = async (req: Request, res: Response) => {
  try {
    const { orgId } = req.params;
    if (!orgId) {
      return res.status(400).json({ success: false, message: "orgId is required" });
    }

    const page = Math.max(Number(req.query.page) || 1, 1);
    const pageSize = Math.min(Number(req.query.pageSize) || 20, 100);

    const skip = (page - 1) * pageSize;
    const orgObjectId = new Types.ObjectId(orgId);

    const [items, total] = await Promise.all([
      PRModel.find({ orgId: orgObjectId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .select("title number state riskScore createdAt repoId")
        .lean(),

      PRModel.countDocuments({ orgId: orgObjectId }),
    ]);

    return res.json({
      success: true,
      data: {
        items,
        page,
        pageSize,
        total,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};

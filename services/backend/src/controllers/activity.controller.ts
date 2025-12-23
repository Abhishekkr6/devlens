import { Request, Response } from "express";
import { Types } from "mongoose";
import { CommitModel } from "../models/commit.model";

export const getCommitTimeline = async (req: Request, res: Response) => {
  try {
    const { orgId } = req.params;
    if (!orgId) {
      return res.status(400).json({ success: false, message: "orgId is required" });
    }

    const last30 = new Date();
    last30.setDate(last30.getDate() - 30);

    const timeline = await CommitModel.aggregate([
      {
        $match: {
          orgId: new Types.ObjectId(orgId),
          timestamp: { $gte: last30 }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.json({ success: true, data: timeline });
  } catch (err) {
    console.error("getCommitTimeline error:", err);
    return res.status(500).json({ success: false });
  }
};

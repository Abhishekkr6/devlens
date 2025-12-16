import { Request, Response } from "express";
import { CommitModel } from "../models/commit.model";
import { PRModel } from "../models/pr.model";
import { AlertModel } from "../models/alert.model";
import logger from "../utils/logger";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId;

    // Recent 7 days window
    const last7 = new Date();
    last7.setDate(last7.getDate() - 7);

    // Total commits for this org
    const commitsCount = await CommitModel.countDocuments({
      orgId,
      timestamp: { $gte: last7 }
    });

    // Active developers (unique commit authors) in this org
    const activeDevs = await CommitModel.distinct("authorGithubId", {
      orgId,
      timestamp: { $gte: last7 }
    });

    // Open PRs in this org
    const openPRs = await PRModel.countDocuments({ 
      orgId,
      state: "open" 
    });

    // Avg PR merge time (merged PRs only) in this org
    const merged = await PRModel.aggregate([
      { $match: { orgId, mergedAt: { $ne: null } } },
      {
        $project: {
          diffHours: {
            $divide: [
              { $subtract: ["$mergedAt", "$createdAt"] },
              1000 * 60 * 60,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgHours: { $avg: "$diffHours" },
        },
      },
    ]);

    const avgPRTime = merged.length ? merged[0].avgHours.toFixed(2) : 0;

    return res.json({
      success: true,
      data: {
        kpis: {
          commits: commitsCount,
          activeDevs: activeDevs.length,
          openPRs,
          avgPRTimeHours: avgPRTime,
        },
      },
    });
  } catch (err) {
    logger.error({ err }, "Dashboard error");
    return res.status(500).json({ success: false });
  }
};

import { Request, Response } from "express";
import { Types } from "mongoose";
import { CommitModel } from "../models/commit.model";
import { PRModel } from "../models/pr.model";
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

    // ---------------------------------------------
    // CHARTS DATA
    // ---------------------------------------------

    // 1. Commit Timeline (Daily for last 7 days)
    const commitTimelineAgg = await CommitModel.aggregate([
      {
        $match: {
          orgId: new Types.ObjectId(orgId),
          timestamp: { $gte: last7 }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill missing days
    const commitTimeline: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = commitTimelineAgg.find(c => c._id === dateStr);
      commitTimeline.push({
        date: dateStr,
        commitCount: found ? found.count : 0
      });
    }

    // 2. PR Velocity (Opened vs Merged daily)
    const prMobilityAgg = await PRModel.aggregate([
      {
        $match: {
          orgId: new Types.ObjectId(orgId),
          updatedAt: { $gte: last7 }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
          opened: {
            $sum: { $cond: [{ $eq: ["$state", "open"] }, 1, 0] }
          },
          merged: {
            $sum: { $cond: [{ $ne: ["$mergedAt", null] }, 1, 0] }
          }
        }
      }
    ]);

    const prVelocity: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = prMobilityAgg.find(p => p._id === dateStr);
      prVelocity.push({
        date: dateStr,
        opened: found ? found.opened : 0,
        merged: found ? found.merged : 0
      });
    }

    // 3. Top Contributors
    const topContributors = await CommitModel.aggregate([
      {
        $match: {
          orgId: new Types.ObjectId(orgId),
          timestamp: { $gte: last7 }
        }
      },
      {
        $group: {
          _id: "$authorName",
          commits: { $sum: 1 }
        }
      },
      { $sort: { commits: -1 } },
      { $limit: 5 }
    ]);

    const contributorBreakdown = topContributors.map(t => ({
      name: t._id || "Unknown",
      commits: t.commits
    }));


    return res.json({
      success: true,
      data: {
        kpis: {
          commits: commitsCount,
          activeDevs: activeDevs.length,
          openPRs,
          avgPRTimeHours: avgPRTime,
        },
        charts: {
          commitTimeline,
          prVelocity,
          contributorBreakdown
        }
      },
    });
  } catch (err) {
    logger.error({ err }, "Dashboard error");
    return res.status(500).json({ success: false });
  }
};

import { Request, Response } from "express";
import logger from "../utils/logger";

import { Types } from "mongoose";
import { CommitModel } from "../models/commit.model";
import { PRModel } from "../models/pr.model";
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
    logger.error({ error: err }, "getCommitTimeline error:");
    return res.status(500).json({ success: false });
  }
};

export const getAllActivities = async (req: Request, res: Response) => {
  try {
    const { orgId } = req.params;
    if (!orgId) {
      return res.status(400).json({ success: false, message: "orgId is required" });
    }

    const page = Math.max(Number(req.query.page) || 1, 1);
    const pageSize = Math.min(Number(req.query.pageSize) || 50, 100);
    const skip = (page - 1) * pageSize;

    const orgObjectId = new Types.ObjectId(orgId);

    // Fetch commits with repo details
    const commits = await CommitModel.find({ orgId: orgObjectId })
      .sort({ timestamp: -1 })
      .limit(pageSize * 2) // Fetch more to ensure we have enough after merging
      .select("sha authorName message timestamp repoId createdAt")
      .populate("repoId", "repoName")
      .lean();

    // Fetch PRs with repo details
    const prs = await PRModel.find({ orgId: orgObjectId })
      .sort({ createdAt: -1 })
      .limit(pageSize * 2)
      .select("number title state authorGithubId createdAt mergedAt updatedAt repoId")
      .populate("repoId", "repoName")
      .lean();

    // Transform commits to activity format
    const commitActivities = commits.map((commit: any) => ({
      id: commit._id.toString(),
      type: "commit",
      title: commit.message || "Commit",
      subtitle: "Merged to main branch",
      tag: commit.repoId?.repoName || "unknown-repo",
      author: commit.authorName || "Unknown",
      timestamp: commit.timestamp || commit.createdAt,
      icon: "commit",
    }));

    // Transform PRs to activity format
    const prActivities = prs.map((pr: any) => {
      const state = (pr.state || "").toLowerCase();
      let subtitle = "";
      let type = "pr";

      if (state === "merged") {
        subtitle = "Merged to main branch";
        type = "pr_merged";
      } else if (state === "open") {
        subtitle = `PR #${pr.number} opened for review`;
        type = "pr_opened";
      } else if (state === "closed") {
        subtitle = `PR #${pr.number} closed`;
        type = "pr_closed";
      } else {
        subtitle = `Approved PR #${pr.number} with suggestions`;
        type = "pr_review";
      }

      return {
        id: pr._id.toString(),
        type,
        title: pr.title || `Pull request #${pr.number}`,
        subtitle,
        tag: pr.repoId?.repoName || "unknown-repo",
        author: pr.authorGithubId || "Unknown",
        timestamp: pr.mergedAt || pr.createdAt || pr.updatedAt,
        icon: state === "merged" ? "pr_merged" : "pr",
      };
    });

    // Merge and sort all activities
    const allActivities = [...commitActivities, ...prActivities]
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA;
      })
      .slice(skip, skip + pageSize);

    const total = await Promise.all([
      CommitModel.countDocuments({ orgId: orgObjectId }),
      PRModel.countDocuments({ orgId: orgObjectId }),
    ]).then(([commitCount, prCount]) => commitCount + prCount);

    return res.json({
      success: true,
      data: {
        items: allActivities,
        page,
        pageSize,
        total,
      },
    });
  } catch (err) {
    logger.error({ error: err }, "getAllActivities error:");
    return res.status(500).json({ success: false, message: "Failed to fetch activities" });
  }
};

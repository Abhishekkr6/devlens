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
    const pageSize = Math.min(Number(req.query.pageSize) || 100, 100);

    const skip = (page - 1) * pageSize;
    const orgObjectId = new Types.ObjectId(orgId);

    const [items, total] = await Promise.all([
      PRModel.find({ orgId: orgObjectId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .select("title number state riskScore createdAt repoId authorGithubId reviewers")
        .populate("repoId", "repoName") // Populate repo details
        .lean(),

      PRModel.countDocuments({ orgId: orgObjectId }),
    ]);

    // Transform items to include repo name directly
    const transformedItems = items.map((pr: any) => ({
      ...pr,
      repoName: pr.repoId?.repoName || null,
      authorName: pr.authorGithubId || null, // Use GitHub ID as name for now
    }));

    return res.json({
      success: true,
      data: {
        items: transformedItems,
        page,
        pageSize,
        total,
      },
    });
  } catch (err) {
    console.error("listPRs error:", err);
    return res.status(500).json({ success: false });
  }
};

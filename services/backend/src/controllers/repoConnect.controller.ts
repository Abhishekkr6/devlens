import { Request, Response } from "express";
import { RepoModel } from "../models/repo.model";
import crypto from "crypto";
import logger from "../utils/logger";
import { UserModel } from "../models/user.model";
import { Types } from "mongoose";
import { verifyRepositoryExists } from "../services/github.service";

export const connectRepo = async (req: any, res: Response) => {
  try {
    logger.debug("------ DEBUG START ------");
    logger.debug({ body: req.body }, "REQ BODY");
    logger.debug({ orgId: req.params.orgId }, "ORG ID");
    logger.debug({ hasWebhookSecret: Boolean(process.env.WEBHOOK_SECRET) }, "WEBHOOK_SECRET configured");

    const { orgId } = req.params;
    const { repoFullName } = req.body; // "owner/repo"

    if (!repoFullName)
      return res
        .status(400)
        .json({ success: false, error: "repoFullName required" });

    if (!orgId || !Types.ObjectId.isValid(orgId)) {
      return res
        .status(400)
        .json({ success: false, error: "Valid organization id required" });
    }

    // Get user's GitHub token
    const userId = req.user?.id || req.user?._id;
    if (!userId || !Types.ObjectId.isValid(String(userId))) {
      return res
        .status(401)
        .json({ success: false, error: "User not authenticated" });
    }

    const user = await UserModel.findById(userId);
    if (!user || !user.githubAccessToken) {
      return res
        .status(401)
        .json({ success: false, error: "GitHub token not found" });
    }

    // Check if repo is already connected
    const existingRepo = await RepoModel.findOne({
      providerRepoId: repoFullName,
      orgId: orgId
    });

    if (existingRepo) {
      return res.status(409).json({
        success: false,
        error: "Repository already connected to this organization"
      });
    }

    // Verify that the repository exists on GitHub
    const verifyResult = await verifyRepositoryExists(repoFullName, user.githubAccessToken);
    if (!verifyResult.exists) {
      return res
        .status(404)
        .json({
          success: false,
          error: `Repository not found: ${verifyResult.reason || "The specified repository does not exist on GitHub"}`
        });
    }

    const secret = process.env.WEBHOOK_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        error: "Server configuration error: WEBHOOK_SECRET not set"
      });
    }
    const hashed = crypto.createHash("sha256").update(secret).digest("hex");

    const orgObjectId = new Types.ObjectId(orgId);

    const repo = await RepoModel.create({
      provider: "github",
      providerRepoId: repoFullName,
      orgId: orgObjectId,
      name: repoFullName,
      webhookSecretHash: hashed,
      connectedAt: new Date(),
    });

    if (userId && Types.ObjectId.isValid(String(userId))) {
      await UserModel.findByIdAndUpdate(
        userId,
        {
          defaultOrgId: orgObjectId,
          $addToSet: { orgIds: orgObjectId },
        },
        { new: true }
      );
    }

    return res.json({ success: true, data: repo });
  } catch (err: any) {
    logger.error({ err }, "CONNECT REPO ERROR");
    return res.status(500).json({
      success: false,
      error: err?.message || "Repo connect failed",
    });
  }
};

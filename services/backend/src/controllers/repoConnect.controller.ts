import { Request, Response } from "express";
import { RepoModel } from "../models/repo.model";
import crypto from "crypto";
import logger from "../utils/logger";
import { UserModel } from "../models/user.model";
import { Types } from "mongoose";
import { verifyRepositoryExists, createRepositoryWebhook } from "../services/github.service";
import { decrypt } from "../services/encryption.service";

export const connectRepo = async (req: any, res: Response) => {
  try {
    const { orgId } = req.params;
    const { repoFullName } = req.body; // "owner/repo"

    if (!repoFullName || !repoFullName.includes("/")) {
      return res.status(400).json({
        success: false,
        error: "repoFullName must be in owner/repo format",
      });
    }

    if (!orgId || !Types.ObjectId.isValid(orgId)) {
      return res.status(400).json({
        success: false,
        error: "Valid organization id required",
      });
    }

    const userId = req.user?.id || req.user?._id;
    if (!userId || !Types.ObjectId.isValid(String(userId))) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const user = await UserModel.findById(userId);
    if (!user || !user.githubAccessToken) {
      return res.status(401).json({
        success: false,
        error: "GitHub token not found",
      });
    }

    const orgObjectId = new Types.ObjectId(orgId);

    // ✅ CORRECT duplicate check
    const existingRepo = await RepoModel.findOne({
      repoFullName,
      orgId: orgObjectId,
    });

    if (existingRepo) {
      return res.status(409).json({
        success: false,
        error: "Repository already connected to this organization",
      });
    }

    // ✅ GitHub API verification (must return repo data)
    const verifyResult = await verifyRepositoryExists(
      repoFullName,
      decrypt(user.githubAccessToken)
    );

    if (!verifyResult.exists || !verifyResult.repo) {
      return res.status(404).json({
        success: false,
        error: "Repository does not exist on GitHub",
      });
    }

    const githubRepo = verifyResult.repo;
    const [owner, repoName] = repoFullName.split("/");

    const secret = process.env.WEBHOOK_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        error: "WEBHOOK_SECRET not set",
      });
    }

    const webhookSecretHash = crypto
      .createHash("sha256")
      .update(secret)
      .digest("hex");

    // ✅ CORRECT save
    const repo = await RepoModel.create({
      provider: "github",
      repoFullName,                 // "owner/repo"
      repoName,                     // "repo"
      owner,                        // "owner"
      providerRepoId: githubRepo.id, // ✅ NUMBER
      url: githubRepo.html_url,
      defaultBranch: githubRepo.default_branch,
      orgId: orgObjectId,
      webhookSecretHash,
      connectedAt: new Date(),
      webhookStatus: "pending",     // Initial status
    });

    // ✅ CREATE WEBHOOK AUTOMATICALLY
    const backendUrl = process.env.BACKEND_URL || "https://DevLens-w2s8.onrender.com";
    const webhookUrl = `${backendUrl}/api/v1/webhooks/github`;

    logger.info({ repo: repoFullName, webhookUrl }, "Creating GitHub webhook");

    const webhookResult = await createRepositoryWebhook(
      repoFullName,
      decrypt(user.githubAccessToken),
      webhookUrl,
      secret
    );

    // Update repository with webhook creation result
    if (webhookResult.success && webhookResult.webhookId) {
      repo.webhookId = webhookResult.webhookId;
      repo.webhookStatus = "active";
      await repo.save();
      logger.info(
        { repo: repoFullName, webhookId: webhookResult.webhookId },
        "Webhook created successfully"
      );
    } else if (webhookResult.error && (
      webhookResult.error.includes("Hook already exists") ||
      webhookResult.error.includes("already exists") ||
      webhookResult.error.includes("422") // GitHub returns 422 Unprocessable Entity for duplicates
    )) {
      // ✅ SUCCESS: Webhook already exists (created by another org), which is what we want.
      // We mark this as active because the events will FAN-OUT to this org too.
      repo.webhookStatus = "active";
      repo.webhookError = undefined; // Clear error
      await repo.save();
      logger.info(
        { repo: repoFullName },
        "Webhook already exists (multi-org connection successful)"
      );
    } else {
      repo.webhookStatus = "failed";
      repo.webhookError = webhookResult.error || "Unknown error";
      await repo.save();
      logger.warn(
        { repo: repoFullName, error: webhookResult.error },
        "Webhook creation failed (repo still connected)"
      );
    }

    await UserModel.findByIdAndUpdate(
      userId,
      {
        defaultOrgId: orgObjectId,
        $addToSet: { orgIds: orgObjectId },
      },
      { new: true }
    );

    return res.json({
      success: true,
      data: repo,
      webhook: {
        created: webhookResult.success,
        error: webhookResult.error,
      },
    });
  } catch (err: any) {
    logger.error({ err }, "CONNECT REPO ERROR");
    return res.status(500).json({
      success: false,
      error: err?.message || "Repo connect failed",
    });
  }
};

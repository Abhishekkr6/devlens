import { Request, Response } from "express";
import { verifyGithubSignature } from "../utils/verifySignature";
import { CommitModel } from "../models/commit.model";
import { PRModel } from "../models/pr.model";
import { RepoModel } from "../models/repo.model";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import logger from "../utils/logger";

/* -------------------------------------------
   REDIS CONNECTION
-------------------------------------------- */
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error("REDIS_URL environment variable is not set");
}

const redis = new IORedis(redisUrl, {
  tls: { rejectUnauthorized: false },
  maxRetriesPerRequest: null,
});

/* -------------------------------------------
   QUEUES
-------------------------------------------- */
const commitQueue = new Queue("commit-processing", {
  connection: redis,
});

const prQueue = new Queue("pr-analysis", {
  connection: redis,
});

/* -------------------------------------------
   WEBHOOK HANDLER (FINAL FIX)
-------------------------------------------- */
export const githubWebhookHandler = async (req: Request, res: Response) => {
  try {
    // Check if body exists and is a Buffer
    if (!req.body || !Buffer.isBuffer(req.body) || req.body.length === 0) {
      logger.error({ bodyType: typeof req.body, isBuffer: Buffer.isBuffer(req.body) }, "Invalid or missing raw body");
      return res.status(400).json({ success: false, error: "Invalid request body" });
    }

    const rawBody = req.body as Buffer;
    const signature = req.headers["x-hub-signature-256"] as string;
    const event = req.headers["x-github-event"] as string;

    if (!signature) {
      logger.warn("Missing webhook signature");
      return res.status(401).json({ error: "Missing signature" });
    }

    const payload = JSON.parse(rawBody.toString());
    const fullRepoName: string | undefined = payload?.repository?.full_name;

    if (!fullRepoName) {
      logger.warn({ event, repository: payload?.repository }, "Missing repository.full_name in webhook payload");
      return res.status(200).send("OK");
    }

    /* -------------------------------------------
       ✅ CORRECT REPO LOOKUP (NO REGEX)
    -------------------------------------------- */
    const repo = await RepoModel.findOne({
      repoFullName: fullRepoName,
    });

    if (!repo) {
      logger.warn({ fullRepoName }, "Webhook received for unknown repo");
      return res.status(200).send("OK");
    }

    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("WEBHOOK_SECRET not configured");
    }

    const isValid = verifyGithubSignature(
      webhookSecret,
      rawBody,
      signature
    );

    if (!isValid) {
      logger.warn({ fullRepoName }, "Invalid webhook signature");
      return res.status(403).json({ error: "Invalid signature" });
    }

    /* -------------------------------------------
       PUSH EVENT
    -------------------------------------------- */
    if (event === "push") {
      const commits = payload.commits || [];

      const commitDocs = await Promise.all(
        commits.map((c: any) =>
          CommitModel.findOneAndUpdate(
            {
              sha: c.id,
              repoId: repo._id, // 🔥 IMPORTANT (multi-repo safe)
            },
            {
              sha: c.id,
              repoId: repo._id,
              orgId: repo.orgId,
              authorGithubId: c.author?.username ?? null,
              authorName: c.author?.name ?? null,
              message: c.message,
              timestamp: c.timestamp,
              filesChangedCount:
                c.modified.length + c.added.length + c.removed.length,
              additions: c.added.length,
              deletions: c.removed.length,
              files: [...c.modified, ...c.added, ...c.removed],
            },
            { upsert: true, new: true }
          )
        )
      );

      await commitQueue.add("commit-batch", {
        repoId: repo._id,
        commitIds: commitDocs.map((d) => d._id),
      });

      logger.info(
        { repo: repo.repoFullName, commits: commitDocs.length },
        "Push processed"
      );
    }

    /* -------------------------------------------
       PULL REQUEST EVENT
    -------------------------------------------- */
    if (event === "pull_request") {
      const pr = payload.pull_request;

      const savedPR = await PRModel.findOneAndUpdate(
        {
          providerPrId: pr.id,
          repoId: repo._id,
        },
        {
          providerPrId: pr.id,
          repoId: repo._id,
          orgId: repo.orgId,
          number: pr.number,
          title: pr.title,
          authorGithubId: pr.user?.login ?? null,
          state: pr.state,
          createdAt: pr.created_at,
          mergedAt: pr.merged_at,
          closedAt: pr.closed_at,
          filesChanged: pr.changed_files,
          additions: pr.additions,
          deletions: pr.deletions,
        },
        { upsert: true, new: true }
      );

      await prQueue.add("pr-analysis", {
        prId: savedPR._id,
        repoId: repo._id,
        trigger: "webhook",
      });

      logger.info(
        { repo: repo.repoFullName, pr: pr.number },
        "PR processed"
      );
    }

    logger.info({ event, repo: fullRepoName }, "Webhook processed successfully");
    return res.status(200).json({ success: true });
  } catch (err) {
    logger.error({ err }, "Webhook processing failed");
    return res.status(500).json({ success: false });
  }
};

import { Request, Response } from "express";
import { verifyGithubSignature } from "../utils/verifySignature";
import { CommitModel } from "../models/commit.model";
import { PRModel } from "../models/pr.model";
import { RepoModel } from "../models/repo.model";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import logger from "../utils/logger";

/* -------------------------------------------
   REDIS CONNECTION (WITH ERROR HANDLING)
-------------------------------------------- */
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  logger.warn("REDIS_URL environment variable is not set - queue processing disabled");
}

let redis: IORedis | null = null;
let commitQueue: Queue | null = null;
let prQueue: Queue | null = null;

if (redisUrl) {
  try {
    redis = new IORedis(redisUrl, {
      tls: { rejectUnauthorized: false },
      maxRetriesPerRequest: null,
    });

    // Handle connection errors
    redis.on("error", (err) => {
      logger.warn(
        { err: err.message },
        "Redis connection error - queue processing may fail"
      );
    });

    redis.on("connect", () => {
      logger.info("Redis connected successfully");
    });

    /* -------------------------------------------
       QUEUES
    -------------------------------------------- */
    commitQueue = new Queue("commit-processing", {
      connection: redis,
    });

    prQueue = new Queue("pr-analysis", {
      connection: redis,
    });

    logger.info("Redis and queues initialized");
  } catch (err) {
    logger.warn(
      { err: err instanceof Error ? err.message : String(err) },
      "Redis initialization failed - queue processing disabled. Webhooks will still save data to database."
    );
    redis = null;
    commitQueue = null;
    prQueue = null;
  }
}

/* -------------------------------------------
   WEBHOOK IDEMPOTENCY TRACKING
-------------------------------------------- */
const processedDeliveries = new Set<string>();
const MAX_CACHE_SIZE = 1000;

function trackWebhookDelivery(deliveryId: string): boolean {
  if (processedDeliveries.has(deliveryId)) {
    return true; // Already processed
  }

  processedDeliveries.add(deliveryId);

  // Simple LRU: remove oldest if cache too large
  if (processedDeliveries.size > MAX_CACHE_SIZE) {
    const firstItem = processedDeliveries.values().next().value;
    if (firstItem) {
      processedDeliveries.delete(firstItem);
    }
  }

  return false; // New delivery
}

/* -------------------------------------------
   WEBHOOK HANDLER (FINAL FIX)
-------------------------------------------- */
export const githubWebhookHandler = async (req: Request, res: Response) => {
  try {
    // Idempotency check - prevent duplicate webhook processing
    const deliveryId = req.headers["x-github-delivery"] as string;
    if (deliveryId && trackWebhookDelivery(deliveryId)) {
      logger.info({ deliveryId }, "Duplicate webhook delivery detected, skipping processing");
      return res.status(200).json({ success: true, duplicate: true });
    }

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

    logger.info({ repoId: repo._id, repoFullName: repo.repoFullName }, "Repository found in database");

    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (!webhookSecret) {
      logger.error("WEBHOOK_SECRET environment variable is not set");
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

    logger.info({ fullRepoName, event }, "Webhook signature verified successfully");


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

      // Queue processing (optional if Redis available)
      if (commitQueue) {
        await commitQueue.add(
          "commit-batch",
          {
            repoId: repo._id,
            commitIds: commitDocs.map((d) => d._id),
          },
          {
            attempts: 1, // Only 1 attempt, no retries
            removeOnComplete: true, // Auto-delete after success
            removeOnFail: true, // Auto-delete after failure
          }
        );
        logger.info(
          { repo: repo.repoFullName, commits: commitDocs.length },
          "Push processed and queued for analysis"
        );
      } else {
        logger.info(
          { repo: repo.repoFullName, commits: commitDocs.length },
          "Push processed (queue unavailable - background processing skipped)"
        );
      }
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

      // Queue processing (optional if Redis available)
      if (prQueue) {
        await prQueue.add(
          "pr-analysis",
          {
            prId: savedPR._id,
            repoId: repo._id,
            trigger: "webhook",
          },
          {
            attempts: 1, // Only 1 attempt, no retries
            removeOnComplete: true, // Auto-delete after success
            removeOnFail: true, // Auto-delete after failure
          }
        );
        logger.info(
          { repo: repo.repoFullName, pr: pr.number },
          "PR processed and queued for analysis"
        );
      } else {
        logger.info(
          { repo: repo.repoFullName, pr: pr.number },
          "PR processed (queue unavailable - background processing skipped)"
        );
      }
    }

    logger.info({ event, repo: fullRepoName }, "Webhook processed successfully");
    return res.status(200).json({ success: true });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : undefined;
    const event = req.headers["x-github-event"] as string;

    logger.error({
      err,
      errorMessage,
      errorStack,
      event,
      hasBody: !!req.body,
      bodyType: typeof req.body,
      isBuffer: Buffer.isBuffer(req.body)
    }, "Webhook processing failed");

    return res.status(500).json({
      success: false,
      error: errorMessage // Include error in response for debugging
    });
  }
};

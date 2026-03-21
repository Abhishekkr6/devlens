import { Request, Response } from "express";
import { verifyGithubSignature } from "../utils/verifySignature";
import { UserModel } from "../models/user.model";
import { CommitModel } from "../models/commit.model";
import { PRModel } from "../models/pr.model";
import { RepoModel } from "../models/repo.model";
import { AlertModel } from "../models/alert.model";
import { analyzeCommitModules } from "../services/moduleAnalyzer";
import logger from "../utils/logger";
import { getCodeAnalysisService } from "../services/ai/codeAnalysis.service";

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
   PR RISK SCORE CALCULATION
   🔥 Calculates risk score based on PR complexity
-------------------------------------------- */
interface PRData {
  changed_files?: number;
  additions?: number;
  deletions?: number;
  created_at?: string;
}

/**
 * Calculate risk score for a PR based on multiple factors
 * @param pr - Pull request data from GitHub webhook
 * @returns Risk score between 0 and 1 (0.7+ is high risk)
 * 
 * Formula:
 * - Files changed: 40% weight (normalized to max 20 files)
 * - Total lines changed: 40% weight (normalized to max 500 lines)
 * - PR age without merge: 20% weight (normalized to max 7 days)
 */
function calculatePRRiskScore(pr: PRData): number {
  // Factor 1: Files changed (40% weight)
  const filesChanged = pr.changed_files || 0;
  const fileScore = Math.min(filesChanged / 20, 1.0) * 0.4;

  // Factor 2: Total lines changed (40% weight)
  const additions = pr.additions || 0;
  const deletions = pr.deletions || 0;
  const totalLines = additions + deletions;
  const lineScore = Math.min(totalLines / 500, 1.0) * 0.4;

  // Factor 3: PR age (20% weight)
  // Older PRs without merge are riskier
  const createdAt = pr.created_at ? new Date(pr.created_at) : new Date();
  const ageInDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const ageScore = Math.min(ageInDays / 7, 1.0) * 0.2;

  // Total risk score (0-1 range)
  const riskScore = fileScore + lineScore + ageScore;

  // Round to 2 decimal places
  return Math.round(riskScore * 100) / 100;
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
       ✅ MULTI-ORG FIX: Find ALL repos that match this webhook
       (same repo can be connected to multiple organizations)
    -------------------------------------------- */
    const repos = await RepoModel.find({
      repoFullName: fullRepoName,
    });

    if (!repos || repos.length === 0) {
      logger.warn({ fullRepoName }, "Webhook received for unknown repo");
      return res.status(200).send("OK");
    }

    logger.info(
      {
        repoFullName: fullRepoName,
        orgCount: repos.length,
        orgIds: repos.map(r => r.orgId)
      },
      "Repository found - processing for multiple organizations"
    );

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
       PUSH EVENT - MULTI-ORG FAN-OUT
    -------------------------------------------- */
    if (event === "push") {
      const commits = payload.commits || [];

      // 🔥 CRITICAL: Process webhook for EACH organization that connected this repo
      for (const repo of repos) {
        // Per-org idempotency check
        const orgDeliveryKey = `${deliveryId}-${repo.orgId}`;
        if (deliveryId && trackWebhookDelivery(orgDeliveryKey)) {
          logger.info(
            { deliveryId, orgId: repo.orgId },
            "Duplicate webhook delivery for this org, skipping"
          );
          continue; // Skip this org, but continue processing for other orgs
        }

        logger.info(
          {
            orgId: repo.orgId,
            repoId: repo._id,
            commitCount: commits.length
          },
          "Processing push event for organization"
        );

        const commitDocs = await Promise.all(
          commits.map((c: any) =>
            CommitModel.findOneAndUpdate(
              {
                orgId: repo.orgId, // 🔥 MULTI-TENANT: Scoped by orgId
                sha: c.id,         // 🔥 Combined with sha for uniqueness
              },
              {
                sha: c.id,
                repoId: repo._id,
                orgId: repo.orgId, // 🔥 CRITICAL: Each org gets its own commit record
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

        // 🔥 NEW: Inline module analysis (replaces background queue processing)
        // This processes commits immediately instead of queuing them
        await analyzeCommitModules(commitDocs);

        logger.info(
          {
            orgId: repo.orgId,
            repo: repo.repoFullName,
            commits: commitDocs.length
          },
          "Push processed with inline module analysis (org-scoped)"
        );
      }
    }

    /* -------------------------------------------
       PULL REQUEST EVENT - MULTI-ORG FAN-OUT
    -------------------------------------------- */
    if (event === "pull_request") {
      const pr = payload.pull_request;

      // 🔥 CRITICAL: Process webhook for EACH organization that connected this repo
      for (const repo of repos) {
        // Per-org idempotency check
        const orgDeliveryKey = `${deliveryId}-${repo.orgId}`;
        if (deliveryId && trackWebhookDelivery(orgDeliveryKey)) {
          logger.info(
            { deliveryId, orgId: repo.orgId },
            "Duplicate webhook delivery for this org, skipping"
          );
          continue; // Skip this org, but continue processing for other orgs
        }

        logger.info(
          {
            orgId: repo.orgId,
            repoId: repo._id,
            prNumber: pr.number
          },
          "Processing pull_request event for organization"
        );

        // 🔥 Calculate risk score based on PR complexity
        const riskScore = calculatePRRiskScore({
          changed_files: pr.changed_files,
          additions: pr.additions,
          deletions: pr.deletions,
          created_at: pr.created_at,
        });

        const savedPR = await PRModel.findOneAndUpdate(
          {
            orgId: repo.orgId,      // 🔥 MULTI-TENANT: Scoped by orgId
            providerPrId: pr.id,    // 🔥 Combined with providerPrId for uniqueness
          },
          {
            providerPrId: pr.id,
            repoId: repo._id,
            orgId: repo.orgId,      // 🔥 CRITICAL: Each org gets its own PR record
            number: pr.number,
            title: pr.title,
            authorGithubId: pr.user?.login ?? null,
            // 🔥 FIX: GitHub sends 'closed' for both closed and merged PRs
            // We need to check merged_at to determine if it was actually merged
            state: pr.merged_at ? "merged" : pr.state,
            createdAt: pr.created_at,
            mergedAt: pr.merged_at,
            closedAt: pr.closed_at,
            filesChanged: pr.changed_files,
            additions: pr.additions,
            deletions: pr.deletions,
            riskScore,              // 🔥 NEW: Store calculated risk score
          },
          { upsert: true, new: true }
        );

        // 🔥 NEW: Create alert for high-risk PRs (score >= 0.6)
        if (riskScore >= 0.6 && pr.state === 'open') {
          // Check if alert already exists for this PR
          const existingAlert = await AlertModel.findOne({
            orgId: repo.orgId,
            type: 'high_risk_pr',
            'metadata.prNumber': pr.number,
            'metadata.repoId': repo._id.toString(),
            resolvedAt: null, // Only check unresolved alerts
          });

          if (!existingAlert) {
            await AlertModel.create({
              orgId: repo.orgId,
              repoId: repo._id,
              type: 'high_risk_pr',
              severity: 'high',
              metadata: {
                prNumber: pr.number,
                prTitle: pr.title,
                repoId: repo._id.toString(),
                repoName: repo.repoFullName,
                riskScore,
                filesChanged: pr.changed_files,
                linesChanged: (pr.additions || 0) + (pr.deletions || 0),
                author: pr.user?.login,
              },
            });

            logger.info(
              {
                orgId: repo.orgId,
                prNumber: pr.number,
                riskScore,
              },
              "High-risk PR alert created"
            );
          }
        }

        // 🔥 NEW: Auto-resolve alert when PR is merged or closed
        if (pr.state === 'closed' || pr.merged_at) {
          await AlertModel.updateMany(
            {
              orgId: repo.orgId,
              type: 'high_risk_pr',
              'metadata.prNumber': pr.number,
              'metadata.repoId': repo._id.toString(),
              resolvedAt: null,
            },
            {
              resolvedAt: new Date(),
              resolvedBy: 'system',
            }
          );

          logger.info(
            {
              orgId: repo.orgId,
              prNumber: pr.number,
              state: pr.state,
            },
            "High-risk PR alert auto-resolved (PR closed/merged)"
          );
        }

        logger.info(
          {
            orgId: repo.orgId,
            repo: repo.repoFullName,
            pr: pr.number,
            riskScore,              // 🔥 Log risk score for debugging
            filesChanged: pr.changed_files,
            linesChanged: (pr.additions || 0) + (pr.deletions || 0)
          },
          "PR processed and saved to database (org-scoped)"
        );

        // 🔥 NEW: Create notification for new PRs to prompt AI analysis
        const action = payload.action;
        if (action === 'opened' || action === 'synchronize') {
          try {
            logger.info(
              {
                orgId: repo.orgId,
                repoId: repo._id,
                prId: savedPR._id,
                action
              },
              "Creating notification for PR AI analysis"
            );

            // Create notification to prompt user to run AI analysis
            // This avoids the complexity of fetching user tokens in webhook context
            await AlertModel.create({
              orgId: repo.orgId,
              repoId: repo._id,
              type: 'ai_analysis_available',
              severity: 'info',
              metadata: {
                prNumber: pr.number,
                prTitle: pr.title,
                prId: savedPR._id.toString(),
                repoId: repo._id.toString(),
                repoName: repo.repoFullName,
                action,
                message: `AI analysis available for PR #${pr.number}: ${pr.title}`
              },
            });

            logger.info(
              {
                orgId: repo.orgId,
                prNumber: pr.number
              },
              "AI analysis notification created"
            );
          } catch (error) {
            logger.error(
              {
                error,
                orgId: repo.orgId,
                prId: savedPR._id
              },
              "Failed to create AI analysis notification"
            );
          }
        }
      }
    }

    /* -------------------------------------------
       PULL REQUEST REVIEW EVENT - MULTI-ORG FAN-OUT
       🔥 NEW: Handle review submissions to update PR review status
    -------------------------------------------- */
    if (event === "pull_request_review") {
      const pr = payload.pull_request;
      const review = payload.review;

      // 🔥 CRITICAL: Process webhook for EACH organization that connected this repo
      for (const repo of repos) {
        // Per-org idempotency check
        const orgDeliveryKey = `${deliveryId}-${repo.orgId}`;
        if (deliveryId && trackWebhookDelivery(orgDeliveryKey)) {
          logger.info(
            { deliveryId, orgId: repo.orgId },
            "Duplicate webhook delivery for this org, skipping"
          );
          continue; // Skip this org, but continue processing for other orgs
        }

        logger.info(
          {
            orgId: repo.orgId,
            repoId: repo._id,
            prNumber: pr.number,
            reviewState: review.state,
            reviewer: review.user?.login
          },
          "Processing pull_request_review event for organization"
        );

        // Find existing PR and update review information
        const existingPR = await PRModel.findOne({
          orgId: repo.orgId,
          providerPrId: pr.id,
        });

        if (existingPR) {
          // Update reviewers array (avoid duplicates)
          const reviewers = existingPR.reviewers || [];
          const reviewerLogin = review.user?.login;

          if (reviewerLogin && !reviewers.some((r: any) => r.login === reviewerLogin)) {
            reviewers.push({
              login: reviewerLogin,
              state: review.state,
              submittedAt: review.submitted_at,
            });
          } else if (reviewerLogin) {
            // Update existing reviewer's state
            const existingReviewer = reviewers.find((r: any) => r.login === reviewerLogin);
            if (existingReviewer) {
              existingReviewer.state = review.state;
              existingReviewer.submittedAt = review.submitted_at;
            }
          }

          await PRModel.findOneAndUpdate(
            {
              orgId: repo.orgId,
              providerPrId: pr.id,
            },
            {
              reviewers,
              lastReviewAt: review.submitted_at,
              // Update state to 'review' if PR is still open and has reviews
              state: existingPR.state === 'open' && reviewers.length > 0 ? 'review' : existingPR.state,
            },
            { new: true }
          );

          logger.info(
            {
              orgId: repo.orgId,
              repo: repo.repoFullName,
              pr: pr.number,
              reviewersCount: reviewers.length
            },
            "PR review processed and saved to database (org-scoped)"
          );
        } else {
          logger.warn(
            {
              orgId: repo.orgId,
              providerPrId: pr.id,
              prNumber: pr.number
            },
            "PR not found for review event - creating new PR record"
          );

          // Create PR if it doesn't exist (edge case)
          await PRModel.findOneAndUpdate(
            {
              orgId: repo.orgId,
              providerPrId: pr.id,
            },
            {
              providerPrId: pr.id,
              repoId: repo._id,
              orgId: repo.orgId,
              number: pr.number,
              title: pr.title,
              authorGithubId: pr.user?.login ?? null,
              state: 'review', // Set to review since we got a review event
              createdAt: pr.created_at,
              mergedAt: pr.merged_at,
              closedAt: pr.closed_at,
              filesChanged: pr.changed_files,
              additions: pr.additions,
              deletions: pr.deletions,
              reviewers: [{
                login: review.user?.login,
                state: review.state,
                submittedAt: review.submitted_at,
              }],
              lastReviewAt: review.submitted_at,
            },
            { upsert: true, new: true }
          );
        }
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

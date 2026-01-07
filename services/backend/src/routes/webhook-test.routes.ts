import { Router, Request, Response } from "express";
import { verifyGithubSignature } from "../utils/verifySignature";
import { RepoModel } from "../models/repo.model";
import logger from "../utils/logger";

const router = Router();

/**
 * Diagnostic endpoint to test webhook signature and payload
 * POST /api/v1/webhooks/test-github
 */
router.post("/test-github", async (req: Request, res: Response) => {
    try {
        const diagnostics: any = {
            timestamp: new Date().toISOString(),
            checks: {},
            errors: [],
            warnings: [],
        };

        // Check 1: Raw body
        const hasRawBody = req.body && Buffer.isBuffer(req.body);
        diagnostics.checks.rawBody = {
            exists: !!req.body,
            isBuffer: Buffer.isBuffer(req.body),
            length: req.body ? req.body.length : 0,
            status: hasRawBody ? "✓ PASS" : "✗ FAIL",
        };

        if (!hasRawBody) {
            diagnostics.errors.push("Raw body is missing or not a Buffer");
            return res.status(400).json(diagnostics);
        }

        const rawBody = req.body as Buffer;

        // Check 2: Headers
        const signature = req.headers["x-hub-signature-256"] as string;
        const event = req.headers["x-github-event"] as string;

        diagnostics.checks.headers = {
            signature: signature ? "✓ Present" : "✗ Missing",
            event: event || "Missing",
            status: signature ? "✓ PASS" : "✗ FAIL",
        };

        if (!signature) {
            diagnostics.errors.push("x-hub-signature-256 header is missing");
            return res.status(400).json(diagnostics);
        }

        // Check 3: Parse payload
        let payload: any;
        try {
            payload = JSON.parse(rawBody.toString());
            diagnostics.checks.payload = {
                parsed: true,
                hasRepository: !!payload?.repository,
                fullName: payload?.repository?.full_name || "Missing",
                status: payload?.repository?.full_name ? "✓ PASS" : "✗ FAIL",
            };
        } catch (err) {
            diagnostics.checks.payload = {
                parsed: false,
                error: "Failed to parse JSON",
                status: "✗ FAIL",
            };
            diagnostics.errors.push("Failed to parse webhook payload as JSON");
            return res.status(400).json(diagnostics);
        }

        const fullRepoName = payload?.repository?.full_name;
        if (!fullRepoName) {
            diagnostics.errors.push("repository.full_name not found in payload");
            return res.status(400).json(diagnostics);
        }

        // Check 4: Repository lookup
        const repo = await RepoModel.findOne({ repoFullName: fullRepoName });
        diagnostics.checks.repository = {
            fullName: fullRepoName,
            found: !!repo,
            repoId: repo?._id?.toString() || null,
            webhookStatus: repo?.webhookStatus || null,
            status: repo ? "✓ PASS" : "✗ FAIL",
        };

        if (!repo) {
            diagnostics.warnings.push(
                `Repository "${fullRepoName}" not found in database`
            );
            return res.status(404).json(diagnostics);
        }

        // Check 5: Webhook secret
        const webhookSecret = process.env.WEBHOOK_SECRET;
        diagnostics.checks.webhookSecret = {
            configured: !!webhookSecret,
            status: webhookSecret ? "✓ PASS" : "✗ FAIL",
        };

        if (!webhookSecret) {
            diagnostics.errors.push("WEBHOOK_SECRET environment variable not set");
            return res.status(500).json(diagnostics);
        }

        // Check 6: Signature verification
        const isValid = verifyGithubSignature(webhookSecret, rawBody, signature);
        diagnostics.checks.signatureVerification = {
            valid: isValid,
            providedSignature: signature.substring(0, 20) + "...",
            status: isValid ? "✓ PASS" : "✗ FAIL",
        };

        if (!isValid) {
            diagnostics.errors.push("Signature verification failed");
            diagnostics.hints = [
                "The WEBHOOK_SECRET in your environment might not match the secret configured in GitHub webhook settings",
                "GitHub webhook secret: Go to repo → Settings → Webhooks → Edit webhook → Secret",
                "Backend WEBHOOK_SECRET: Check your Render environment variables",
            ];
            return res.status(403).json(diagnostics);
        }

        // All checks passed!
        diagnostics.summary = "✓ All checks passed! Webhook payload is valid.";
        diagnostics.nextSteps = [
            "The webhook should work correctly",
            "If still failing, check the actual GitHub webhook delivery logs in GitHub",
        ];

        return res.status(200).json(diagnostics);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        logger.error({ err }, "Webhook diagnostic test failed");
        return res.status(500).json({
            error: "Diagnostic test failed",
            message: errorMessage,
            stack: err instanceof Error ? err.stack : undefined,
        });
    }
});

export default router;

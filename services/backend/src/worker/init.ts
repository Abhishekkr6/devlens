import { Worker } from "bullmq";
import Redis from "ioredis";
import "dotenv/config";
import { commitProcessingHandler } from "./processors/commitProcessing";
import { prAnalysisHandler } from "./processors/prAnalysis";
import logger from "../utils/logger";

export const initWorker = () => {
    // Redis connection
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
        logger.error("REDIS_URL environment variable is not set for Worker");
        return;
    }

    const connection = new Redis(redisUrl, {
        tls: { rejectUnauthorized: false },
        maxRetriesPerRequest: null,
    });

    // Workers
    const commitWorker = new Worker("commit-processing", commitProcessingHandler, {
        connection,
        concurrency: 5,
    });

    const prWorker = new Worker("pr-analysis", prAnalysisHandler, {
        connection,
        concurrency: 3,
    });

    //-----------------------------------------------
    // 🔥 EVENT LOGGING STARTS HERE
    //-----------------------------------------------

    // On job start (very important for debugging slow jobs)
    commitWorker.on("active", (job) => {
        logger.info(
            { jobId: job.id, name: job.name, queue: "commit-processing" },
            "⚙️ [commit-processing] job started"
        );
    });

    // Job success
    commitWorker.on("completed", (job) => {
        logger.info(
            { jobId: job.id, name: job.name, queue: "commit-processing" },
            "✅ [commit-processing] job completed"
        );
    });

    // Job fail
    commitWorker.on("failed", (job, err) => {
        logger.error(
            {
                jobId: job?.id,
                name: job?.name,
                queue: "commit-processing",
                attemptsMade: job?.attemptsMade,
                err,
            },
            "❌ [commit-processing] job failed"
        );
    });

    // Same logs for PR worker
    prWorker.on("active", (job) => {
        logger.info(
            { jobId: job.id, name: job.name, queue: "pr-analysis" },
            "⚙️ [pr-analysis] job started"
        );
    });

    prWorker.on("completed", (job) => {
        logger.info(
            { jobId: job.id, name: job.name, queue: "pr-analysis" },
            "✅ [pr-analysis] job completed"
        );
    });

    prWorker.on("failed", (job, err) => {
        logger.error(
            {
                jobId: job?.id,
                name: job?.name,
                queue: "pr-analysis",
                attemptsMade: job?.attemptsMade,
                err,
            },
            "❌ [pr-analysis] job failed"
        );
    });

    logger.info("🚀 Worker service initialized within Backend (commit-processing + pr-analysis)");
};

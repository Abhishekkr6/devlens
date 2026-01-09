import { Job } from "bullmq";
import mongoose from "mongoose";
import { CommitModel } from "../../models/commit.model";
import "dotenv/config";
import Redis from "ioredis";
import logger from "../../utils/logger";

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/teampulse";

if (!mongoose.connection.readyState) {
    mongoose
        .connect(MONGO_URL)
        .then(() => logger.info("[worker] Mongo connected for commits"))
        .catch((err) => logger.error({ err }, "[worker] Mongo connection error for commits"));
}

export const commitProcessingHandler = async (job: Job) => {
    const { commitIds, repoId } = job.data as { commitIds: string[]; repoId: string };

    const commits = await CommitModel.find({ _id: { $in: commitIds } });

    for (const c of commits) {
        if (!c.message) continue;

        const files = c.files || [];
        const moduleSet = new Set<string>();

        // Simple heuristic to identify modules
        files.forEach((f) => {
            if (f.startsWith("apps/frontend")) moduleSet.add("frontend");
            if (f.startsWith("services/backend")) moduleSet.add("backend");
            if (f.includes("auth")) moduleSet.add("auth");
            if (f.includes("database") || f.includes("models")) moduleSet.add("database");
            if (f.includes("components")) moduleSet.add("ui");
            if (f.includes("worker")) moduleSet.add("worker");
        });

        c.modulePaths = Array.from(moduleSet);
        c.processed = true;
        await c.save();
    }

    logger.info({ repoId, commitCount: commits.length }, "[commit-processing] commits processed");

    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
        const redis = new Redis(redisUrl, {
            tls: { rejectUnauthorized: false },
            maxRetriesPerRequest: null,
        });
        await redis.publish(
            "events",
            JSON.stringify({
                type: "COMMIT_PROCESSED",
                repoId,
                orgId: job.data.orgId, // 🔥 Included for UI filtering
                commitCount: commits.length,
                timestamp: Date.now(),
            })
        );
        await redis.quit();
    }
};

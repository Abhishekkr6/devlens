import "dotenv/config";
import mongoose from "mongoose";
import { RepoModel } from "../models/repo.model";
import { CommitModel } from "../models/commit.model";
import { PRModel } from "../models/pr.model";
import logger from "../utils/logger";

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/teampulse";

const runBackfill = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        logger.info("Connected to MongoDB for backfill");

        const repos = await RepoModel.find({});
        logger.info(`Found ${repos.length} repositories to process`);

        for (const repo of repos) {
            const orgId = repo.orgId;
            if (!orgId) {
                logger.warn(`Repo ${repo.name} (${repo._id}) has no orgId, skipping`);
                continue;
            }

            // Update Commits
            const commitResult = await CommitModel.updateMany(
                { repoId: repo._id, orgId: { $exists: false } },
                { $set: { orgId: orgId } }
            );
            logger.info(`Updated ${commitResult.modifiedCount} commits for repo ${repo.name}`);

            // Update PRs
            const prResult = await PRModel.updateMany(
                { repoId: repo._id, orgId: { $exists: false } },
                { $set: { orgId: orgId } }
            );
            logger.info(`Updated ${prResult.modifiedCount} PRs for repo ${repo.name}`);
        }

        logger.info("Backfill completed successfully");
    } catch (err) {
        logger.error({ err }, "Backfill failed");
    } finally {
        await mongoose.disconnect();
    }
};

runBackfill();

import { Request, Response } from "express";
import logger from "../utils/logger";
import mongoose from "mongoose";

/**
 * 🔒 PROTECTED MIGRATION ENDPOINT
 * 
 * This endpoint allows running database migrations via HTTP request.
 * Only accessible with correct MIGRATION_SECRET token.
 */

export const runMultiOrgMigration = async (req: Request, res: Response) => {
    try {
        // Security: Check migration secret
        // Use environment variable or fallback to hardcoded secret (for initial deployment)
        const migrationSecret = process.env.MIGRATION_SECRET || "35051fb10f54799debc5f44e2d8e0716f158b75cb7ce20a69e8cd4f4eeb57c44";
        const providedSecret = req.headers["x-migration-secret"] || req.query.secret;

        if (providedSecret !== migrationSecret) {
            logger.warn({ providedSecret: providedSecret ? "***" : "none" }, "Unauthorized migration attempt");
            return res.status(403).json({
                error: "Unauthorized",
                hint: "Provide correct secret via ?secret=xxx or X-Migration-Secret header"
            });
        }

        logger.info("Starting multi-org migration via API...");

        // Check database connection
        if (mongoose.connection.readyState !== 1) {
            throw new Error("Database not connected. ReadyState: " + mongoose.connection.readyState);
        }

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Database connection.db is undefined");
        }

        // ============================================
        // COMMITS COLLECTION
        // ============================================
        const commitsCollection = db.collection("commits");
        const commitIndexes = await commitsCollection.indexes();

        // Drop old sha_1 unique index if exists
        const oldShaIndex = commitIndexes.find((idx) => idx.name === "sha_1");
        if (oldShaIndex) {
            logger.info("Dropping old sha_1 index...");
            await commitsCollection.dropIndex("sha_1");
            logger.info("✅ Dropped sha_1 index");
        } else {
            logger.info("ℹ️  sha_1 index not found (already migrated)");
        }

        // Create new composite index
        const newCommitIndex = commitIndexes.find((idx) => idx.name === "orgId_1_sha_1");
        if (!newCommitIndex) {
            logger.info("Creating orgId_1_sha_1 composite index...");
            await commitsCollection.createIndex(
                { orgId: 1, sha: 1 },
                { unique: true, name: "orgId_1_sha_1" }
            );
            logger.info("✅ Created orgId_1_sha_1 index");
        } else {
            logger.info("ℹ️  orgId_1_sha_1 index already exists");
        }

        // ============================================
        // PULL REQUESTS COLLECTION
        // ============================================
        const prsCollection = db.collection("pullrequests");
        const prIndexes = await prsCollection.indexes();

        // Drop old providerPrId_1 unique index if exists
        const oldPrIndex = prIndexes.find((idx) => idx.name === "providerPrId_1");
        if (oldPrIndex) {
            logger.info("Dropping old providerPrId_1 index...");
            await prsCollection.dropIndex("providerPrId_1");
            logger.info("✅ Dropped providerPrId_1 index");
        } else {
            logger.info("ℹ️  providerPrId_1 index not found (already migrated)");
        }

        // Create new composite index
        const newPrIndex = prIndexes.find((idx) => idx.name === "orgId_1_providerPrId_1");
        if (!newPrIndex) {
            logger.info("Creating orgId_1_providerPrId_1 composite index...");
            await prsCollection.createIndex(
                { orgId: 1, providerPrId: 1 },
                { unique: true, name: "orgId_1_providerPrId_1" }
            );
            logger.info("✅ Created orgId_1_providerPrId_1 index");
        } else {
            logger.info("ℹ️  orgId_1_providerPrId_1 index already exists");
        }

        logger.info("🎉 Migration completed successfully!");

        return res.status(200).json({
            success: true,
            message: "Migration completed successfully",
            changes: {
                commits: {
                    droppedOldIndex: !!oldShaIndex,
                    createdNewIndex: !newCommitIndex,
                },
                pullRequests: {
                    droppedOldIndex: !!oldPrIndex,
                    createdNewIndex: !newPrIndex,
                },
            },
        });
    } catch (error) {
        logger.error({ err: error }, "Migration failed");
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : String(error),
        });
    }
};

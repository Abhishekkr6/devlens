import mongoose from "mongoose";
import "dotenv/config";

/**
 * 🔥 MULTI-TENANT DATABASE MIGRATION
 * 
 * This script migrates the database to support multi-organization webhook processing.
 * 
 * CHANGES:
 * 1. Commits: Remove global uniqueness on 'sha', add composite index (orgId + sha)
 * 2. PRs: Remove global uniqueness on 'providerPrId', add composite index (orgId + providerPrId)
 * 
 * WHY:
 * - Same GitHub commit/PR must exist separately for each organization
 * - Multi-tenant SaaS requires org-scoped data isolation
 * - Prevents data leakage between organizations
 * 
 * SAFETY:
 * - Existing data is NOT modified
 * - Only indexes are changed
 * - No data loss expected
 */

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/teampulse";

async function migrateIndexes() {
    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(MONGO_URL);
        console.log("✅ Connected to MongoDB");

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Database connection not established");
        }

        // ============================================
        // COMMITS COLLECTION
        // ============================================
        console.log("\n📊 Migrating Commits collection...");
        const commitsCollection = db.collection("commits");

        // List current indexes
        const commitIndexes = await commitsCollection.indexes();
        console.log("Current indexes:", commitIndexes.map((idx) => idx.name));

        // Drop old global unique index on 'sha' if it exists
        const oldShaIndex = commitIndexes.find((idx) => idx.name === "sha_1");
        if (oldShaIndex) {
            console.log("⚠️  Dropping old global unique index: sha_1");
            await commitsCollection.dropIndex("sha_1");
            console.log("✅ Dropped sha_1 index");
        } else {
            console.log("ℹ️  No sha_1 index found (already migrated or never existed)");
        }

        // Create new composite unique index (orgId + sha)
        const newCommitIndex = commitIndexes.find(
            (idx) => idx.name === "orgId_1_sha_1"
        );
        if (!newCommitIndex) {
            console.log("🔧 Creating composite unique index: orgId_1_sha_1");
            await commitsCollection.createIndex(
                { orgId: 1, sha: 1 },
                { unique: true, name: "orgId_1_sha_1" }
            );
            console.log("✅ Created orgId_1_sha_1 index");
        } else {
            console.log("ℹ️  orgId_1_sha_1 index already exists");
        }

        // ============================================
        // PULL REQUESTS COLLECTION
        // ============================================
        console.log("\n📊 Migrating PullRequests collection...");
        const prsCollection = db.collection("pullrequests");

        // List current indexes
        const prIndexes = await prsCollection.indexes();
        console.log("Current indexes:", prIndexes.map((idx) => idx.name));

        // Drop old global unique index on 'providerPrId' if it exists
        const oldProviderPrIdIndex = prIndexes.find(
            (idx) => idx.name === "providerPrId_1"
        );
        if (oldProviderPrIdIndex) {
            console.log("⚠️  Dropping old global unique index: providerPrId_1");
            await prsCollection.dropIndex("providerPrId_1");
            console.log("✅ Dropped providerPrId_1 index");
        } else {
            console.log(
                "ℹ️  No providerPrId_1 index found (already migrated or never existed)"
            );
        }

        // Create new composite unique index (orgId + providerPrId)
        const newPrIndex = prIndexes.find(
            (idx) => idx.name === "orgId_1_providerPrId_1"
        );
        if (!newPrIndex) {
            console.log("🔧 Creating composite unique index: orgId_1_providerPrId_1");
            await prsCollection.createIndex(
                { orgId: 1, providerPrId: 1 },
                { unique: true, name: "orgId_1_providerPrId_1" }
            );
            console.log("✅ Created orgId_1_providerPrId_1 index");
        } else {
            console.log("ℹ️  orgId_1_providerPrId_1 index already exists");
        }

        // ============================================
        // REPOS COLLECTION
        // ============================================
        console.log("\n📊 Migrating Repos collection...");
        const reposCollection = db.collection("repos");

        // List current indexes
        const repoIndexes = await reposCollection.indexes();
        console.log("Current indexes:", repoIndexes.map((idx) => idx.name));

        // Drop old global unique index on 'repoFullName' if it exists
        const oldRepoNameIndex = repoIndexes.find(
            (idx) => idx.name === "repoFullName_1"
        );
        if (oldRepoNameIndex && oldRepoNameIndex.unique) {
            console.log("⚠️  Dropping old global unique index: repoFullName_1");
            await reposCollection.dropIndex("repoFullName_1");
            console.log("✅ Dropped repoFullName_1 index");
        } else {
            console.log(
                "ℹ️  No unique repoFullName_1 index found (already migrated or never existed)"
            );
        }

        // Create new composite unique index (repoFullName + orgId)
        const newRepoIndex = repoIndexes.find(
            (idx) => idx.name === "repoFullName_1_orgId_1"
        );
        if (!newRepoIndex) {
            console.log("🔧 Creating composite unique index: repoFullName_1_orgId_1");
            await reposCollection.createIndex(
                { repoFullName: 1, orgId: 1 },
                { unique: true, name: "repoFullName_1_orgId_1" }
            );
            console.log("✅ Created repoFullName_1_orgId_1 index");
        } else {
            console.log("ℹ️  repoFullName_1_orgId_1 index already exists");
        }

        // ============================================
        // VERIFY MIGRATION
        // ============================================
        console.log("\n🔍 Verifying migration...");

        const finalCommitIndexes = await commitsCollection.indexes();
        const finalPrIndexes = await prsCollection.indexes();

        const hasCommitCompositeIndex = finalCommitIndexes.some(
            (idx) => idx.name === "orgId_1_sha_1"
        );
        const hasPrCompositeIndex = finalPrIndexes.some(
            (idx) => idx.name === "orgId_1_providerPrId_1"
        );
        const hasOldCommitIndex = finalCommitIndexes.some(
            (idx) => idx.name === "sha_1"
        );
        const hasOldPrIndex = finalPrIndexes.some(
            (idx) => idx.name === "providerPrId_1"
        );

        console.log("\n✅ MIGRATION COMPLETE");
        console.log("\nCommits indexes:");
        console.log(`  ✅ orgId_1_sha_1: ${hasCommitCompositeIndex ? "EXISTS" : "MISSING"}`);
        console.log(`  ${hasOldCommitIndex ? "⚠️" : "✅"} sha_1: ${hasOldCommitIndex ? "STILL EXISTS (UNEXPECTED)" : "REMOVED"}`);

        console.log("\nPullRequests indexes:");
        console.log(`  ✅ orgId_1_providerPrId_1: ${hasPrCompositeIndex ? "EXISTS" : "MISSING"}`);
        console.log(`  ${hasOldPrIndex ? "⚠️" : "✅"} providerPrId_1: ${hasOldPrIndex ? "STILL EXISTS (UNEXPECTED)" : "REMOVED"}`);

        if (hasCommitCompositeIndex && hasPrCompositeIndex && !hasOldCommitIndex && !hasOldPrIndex) {
            console.log("\n🎉 Migration successful! Multi-tenant indexes are ready.");
        } else {
            console.log("\n⚠️  Migration completed with warnings. Please review the output above.");
        }

    } catch (error) {
        console.error("\n❌ Migration failed:");
        console.error(error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log("\n🔌 Disconnected from MongoDB");
        process.exit(0);
    }
}

// Run migration
console.log("🚀 Starting multi-tenant database migration...\n");
migrateIndexes();

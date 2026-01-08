import mongoose from "mongoose";
import { RepoModel } from "../models/repo.model";
import { CommitModel } from "../models/commit.model";
import "dotenv/config";

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/teampulse";

async function debugMultiOrgIssue() {
    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(MONGO_URL);
        console.log("✅ Connected\n");

        const db = mongoose.connection.db;
        if (!db) throw new Error("No DB connection");

        // 1. Check indexes
        console.log("📊 CHECKING INDEXES:\n");
        const commitsCollection = db.collection("commits");
        const commitIndexes = await commitsCollection.indexes();

        console.log("Commits collection indexes:");
        commitIndexes.forEach(idx => {
            console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)} ${idx.unique ? '(UNIQUE)' : ''}`);
        });

        const hasOldIndex = commitIndexes.some(idx => idx.name === "sha_1" && idx.unique);
        const hasNewIndex = commitIndexes.some(idx => idx.name === "orgId_1_sha_1" && idx.unique);

        console.log(`\n  Old sha_1 unique index: ${hasOldIndex ? '❌ STILL EXISTS (PROBLEM!)' : '✅ Removed'}`);
        console.log(`  New orgId_1_sha_1 index: ${hasNewIndex ? '✅ Present' : '❌ MISSING (PROBLEM!)'}\n`);

        // 2. Find repos connected to multiple orgs
        console.log("📊 REPOS CONNECTED TO MULTIPLE ORGS:\n");

        const repos = await RepoModel.aggregate([
            {
                $group: {
                    _id: "$repoFullName",
                    count: { $sum: 1 },
                    orgIds: { $push: "$orgId" },
                    repoIds: { $push: "$_id" }
                }
            },
            { $match: { count: { $gt: 1 } } }
        ]);

        if (repos.length === 0) {
            console.log("⚠️  No repos are connected to multiple orgs yet.");
            console.log("   This might be why you're not seeing the multi-org behavior.\n");
        } else {
            console.log(`Found ${repos.length} repos connected to multiple orgs:\n`);

            for (const repo of repos) {
                console.log(`Repository: ${repo._id}`);
                console.log(`  Orgs: ${repo.count} (${repo.orgIds.join(", ")})\n`);

                // Check commits for each org
                for (const repoId of repo.repoIds) {
                    const repoDoc = await RepoModel.findById(repoId);
                    const commitCount = await CommitModel.countDocuments({ repoId });
                    console.log(`  RepoId ${repoId} (orgId: ${repoDoc?.orgId}): ${commitCount} commits`);
                }
                console.log();
            }
        }

        // 3. Check for duplicate sha errors
        console.log("📊 CHECKING FOR DUPLICATE SHA ISSUES:\n");

        const duplicateShas = await CommitModel.aggregate([
            {
                $group: {
                    _id: "$sha",
                    count: { $sum: 1 },
                    orgIds: { $push: "$orgId" },
                    repoIds: { $push: "$repoId" }
                }
            },
            { $match: { count: { $gt: 1 } } },
            { $limit: 5 }
        ]);

        if (duplicateShas.length > 0) {
            console.log(`✅ Found ${duplicateShas.length} commits that exist for multiple orgs (GOOD!):\n`);
            duplicateShas.forEach(dup => {
                console.log(`  SHA ${dup._id.substring(0, 7)}: ${dup.count} orgs`);
                console.log(`    OrgIds: ${dup.orgIds.join(", ")}\n`);
            });
        } else {
            console.log("⚠️  No duplicate commits found across orgs.");
            console.log("   This means webhooks are still only creating commits for one org.\n");
        }

        // 4. Check recent commits
        console.log("📊 RECENT COMMITS (Last 10):\n");
        const recentCommits = await CommitModel.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("sha orgId repoId message createdAt");

        recentCommits.forEach(commit => {
            console.log(`  ${commit.sha.substring(0, 7)} | Org: ${commit.orgId} | ${new Date(commit.createdAt).toISOString()}`);
        });

        console.log("\n");

        // 5. Summary
        console.log("📊 DIAGNOSIS:\n");

        if (hasOldIndex) {
            console.log("❌ PROBLEM: Old unique index on 'sha' still exists!");
            console.log("   This prevents same commit from being saved for multiple orgs.");
            console.log("   SOLUTION: Run migration script again or manually drop the index.\n");
        }

        if (!hasNewIndex) {
            console.log("❌ PROBLEM: New composite index (orgId + sha) is missing!");
            console.log("   SOLUTION: Run migration script to create it.\n");
        }

        if (repos.length === 0) {
            console.log("⚠️  No repos connected to multiple orgs.");
            console.log("   Connect the same GitHub repo to 2+ orgs to test multi-tenant behavior.\n");
        }

        if (!hasOldIndex && hasNewIndex && repos.length > 0 && duplicateShas.length === 0) {
            console.log("⚠️  Indexes are correct, repos are shared, but no duplicate commits found.");
            console.log("   This suggests the backend server needs to be RESTARTED.");
            console.log("   The code changes won't take effect until the server restarts.\n");
        }

    } catch (error) {
        console.error("\n❌ Error:", error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

debugMultiOrgIssue();

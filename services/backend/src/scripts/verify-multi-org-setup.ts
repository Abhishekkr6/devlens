import mongoose from "mongoose";
import { RepoModel } from "../models/repo.model";
import { CommitModel } from "../models/commit.model";
import { PRModel } from "../models/pr.model";
import "dotenv/config";

/**
 * 🔍 MULTI-TENANT VERIFICATION SCRIPT
 * 
 * This script verifies that the multi-tenant webhook fix is working correctly:
 * 1. Checks database indexes are correct
 * 2. Tests that same commit can exist for multiple orgs
 * 3. Verifies data isolation between organizations
 */

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/teampulse";

async function verifyMultiTenantSetup() {
    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(MONGO_URL);
        console.log("✅ Connected to MongoDB\n");

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Database connection not established");
        }

        // ============================================
        // 1. VERIFY INDEXES
        // ============================================
        console.log("📊 STEP 1: Verifying Database Indexes\n");

        const commitsCollection = db.collection("commits");
        const prsCollection = db.collection("pullrequests");

        const commitIndexes = await commitsCollection.indexes();
        const prIndexes = await prsCollection.indexes();

        console.log("Commits indexes:");
        commitIndexes.forEach((idx) => {
            console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
        });

        console.log("\nPullRequests indexes:");
        prIndexes.forEach((idx) => {
            console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
        });

        const hasCommitCompositeIndex = commitIndexes.some(
            (idx) => idx.name === "orgId_1_sha_1" && idx.unique === true
        );
        const hasPrCompositeIndex = prIndexes.some(
            (idx) => idx.name === "orgId_1_providerPrId_1" && idx.unique === true
        );
        const hasOldCommitIndex = commitIndexes.some(
            (idx) => idx.name === "sha_1" && idx.unique === true
        );
        const hasOldPrIndex = prIndexes.some(
            (idx) => idx.name === "providerPrId_1" && idx.unique === true
        );

        console.log("\n✅ Index Verification:");
        console.log(`  ${hasCommitCompositeIndex ? "✅" : "❌"} Commits: orgId_1_sha_1 (unique)`);
        console.log(`  ${hasPrCompositeIndex ? "✅" : "❌"} PRs: orgId_1_providerPrId_1 (unique)`);
        console.log(`  ${!hasOldCommitIndex ? "✅" : "❌"} Old sha_1 index removed`);
        console.log(`  ${!hasOldPrIndex ? "✅" : "❌"} Old providerPrId_1 index removed`);

        // ============================================
        // 2. FIND REPOS WITH SAME GITHUB REPO
        // ============================================
        console.log("\n\n📊 STEP 2: Finding Repositories Connected to Multiple Orgs\n");

        const repos = await RepoModel.aggregate([
            {
                $group: {
                    _id: "$repoFullName",
                    count: { $sum: 1 },
                    orgIds: { $push: "$orgId" },
                    repoIds: { $push: "$_id" },
                },
            },
            {
                $match: { count: { $gt: 1 } },
            },
        ]);

        if (repos.length === 0) {
            console.log("⚠️  No repositories are connected to multiple organizations yet.");
            console.log("   To fully test multi-tenant support:");
            console.log("   1. Connect the same GitHub repo to 2+ organizations");
            console.log("   2. Push a commit or create a PR");
            console.log("   3. Run this script again to verify data appears in both orgs\n");
        } else {
            console.log(`✅ Found ${repos.length} repositories connected to multiple orgs:\n`);

            for (const repo of repos) {
                console.log(`Repository: ${repo._id}`);
                console.log(`  Connected to ${repo.count} organizations`);
                console.log(`  Org IDs: ${repo.orgIds.join(", ")}`);

                // Check commits for this repo
                const commits = await CommitModel.find({
                    repoId: { $in: repo.repoIds },
                }).select("sha orgId repoId message");

                console.log(`  Commits found: ${commits.length}`);

                // Group commits by SHA to find duplicates (good for multi-tenant)
                const commitsBySha = commits.reduce((acc, commit) => {
                    if (!acc[commit.sha]) {
                        acc[commit.sha] = [];
                    }
                    acc[commit.sha].push(commit);
                    return acc;
                }, {} as Record<string, typeof commits>);

                const duplicateShas = Object.entries(commitsBySha).filter(
                    ([_, commits]) => commits.length > 1
                );

                if (duplicateShas.length > 0) {
                    console.log(`  ✅ ${duplicateShas.length} commits exist for multiple orgs (CORRECT)`);
                    duplicateShas.slice(0, 3).forEach(([sha, commits]) => {
                        console.log(`    - ${sha.substring(0, 7)}: ${commits.length} orgs (${commits.map(c => c.orgId).join(", ")})`);
                    });
                } else {
                    console.log(`  ⚠️  No commits are duplicated across orgs yet`);
                }

                // Check PRs for this repo
                const prs = await PRModel.find({
                    repoId: { $in: repo.repoIds },
                }).select("providerPrId number orgId repoId title");

                console.log(`  PRs found: ${prs.length}`);

                const prsByProviderId = prs.reduce((acc, pr) => {
                    if (!acc[pr.providerPrId]) {
                        acc[pr.providerPrId] = [];
                    }
                    acc[pr.providerPrId].push(pr);
                    return acc;
                }, {} as Record<string, typeof prs>);

                const duplicatePrs = Object.entries(prsByProviderId).filter(
                    ([_, prs]) => prs.length > 1
                );

                if (duplicatePrs.length > 0) {
                    console.log(`  ✅ ${duplicatePrs.length} PRs exist for multiple orgs (CORRECT)`);
                    duplicatePrs.slice(0, 3).forEach(([providerId, prs]) => {
                        console.log(`    - PR #${prs[0].number}: ${prs.length} orgs (${prs.map(p => p.orgId).join(", ")})`);
                    });
                } else {
                    console.log(`  ⚠️  No PRs are duplicated across orgs yet`);
                }

                console.log("");
            }
        }

        // ============================================
        // 3. VERIFY DATA ISOLATION
        // ============================================
        console.log("\n📊 STEP 3: Verifying Data Isolation\n");

        const allOrgs = await RepoModel.distinct("orgId");
        console.log(`Total organizations with connected repos: ${allOrgs.length}\n`);

        for (const orgId of allOrgs.slice(0, 5)) {
            const commitCount = await CommitModel.countDocuments({ orgId });
            const prCount = await PRModel.countDocuments({ orgId });
            console.log(`Org ${orgId}:`);
            console.log(`  - ${commitCount} commits`);
            console.log(`  - ${prCount} PRs`);
        }

        // ============================================
        // SUMMARY
        // ============================================
        console.log("\n\n🎉 VERIFICATION SUMMARY\n");

        const allGood = hasCommitCompositeIndex && hasPrCompositeIndex && !hasOldCommitIndex && !hasOldPrIndex;

        if (allGood) {
            console.log("✅ Database indexes are correctly configured for multi-tenancy");
            console.log("✅ Ready to handle same repo connected to multiple orgs");
            console.log("\nNext steps:");
            console.log("1. Push a commit to a shared repository");
            console.log("2. Verify webhook creates commits for ALL connected orgs");
            console.log("3. Check each org's dashboard shows their scoped data");
        } else {
            console.log("⚠️  Some index issues detected. Please review output above.");
        }

    } catch (error) {
        console.error("\n❌ Verification failed:");
        console.error(error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log("\n🔌 Disconnected from MongoDB");
        process.exit(0);
    }
}

console.log("🚀 Starting multi-tenant verification...\n");
verifyMultiTenantSetup();

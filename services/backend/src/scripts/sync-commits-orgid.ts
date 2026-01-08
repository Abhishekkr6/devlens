import "dotenv/config";
import mongoose from "mongoose";
import { CommitModel } from "../models/commit.model";
import { RepoModel } from "../models/repo.model";

/**
 * CRITICAL FIX: Update ALL commits' orgId to match their repo's current orgId
 * This fixes the case where repos moved to different orgs
 */
const syncAllCommitsOrgId = async () => {
    await mongoose.connect(process.env.MONGO_URL!);

    console.log("\n=== SYNCING ALL COMMITS ORGID ===\n");

    const repos = await RepoModel.find({}).lean();
    console.log(`Found ${repos.length} repos\n`);

    let totalUpdated = 0;

    for (const repo of repos) {
        const count = await CommitModel.countDocuments({ repoId: repo._id });

        if (count === 0) {
            console.log(`⚪ ${repo.repoFullName}: no commits`);
            continue;
        }

        // Update ALL commits for this repo to have the repo's orgId
        const result = await CommitModel.updateMany(
            { repoId: repo._id },
            { $set: { orgId: repo.orgId } }
        );

        console.log(`✅ ${repo.repoFullName}: updated ${result.modifiedCount}/${count} commits → org ${repo.orgId}`);
        totalUpdated += result.modifiedCount;
    }

    console.log(`\n✅ TOTAL UPDATED: ${totalUpdated} commits\n`);

    // Verification - show commits by org
    console.log("=== VERIFICATION: Commits by Org ===\n");
    const orgs = await CommitModel.aggregate([
        {
            $group: {
                _id: "$orgId",
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } }
    ]);

    for (const org of orgs) {
        console.log(`Org ${org._id}: ${org.count} commits`);
    }

    await mongoose.disconnect();
};

syncAllCommitsOrgId();

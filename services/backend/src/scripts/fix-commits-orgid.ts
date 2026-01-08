import "dotenv/config";
import mongoose from "mongoose";
import { CommitModel } from "../models/commit.model";
import { RepoModel } from "../models/repo.model";

const fixCommitsOrgId = async () => {
    await mongoose.connect(process.env.MONGO_URL!);

    console.log("\n=== FIXING COMMITS ORGID ===\n");

    // Get all repos with their orgIds
    const repos = await RepoModel.find({}, 'orgId').lean();
    console.log(`Found ${repos.length} repos`);

    let totalFixed = 0;

    for (const repo of repos) {
        if (!repo.orgId) {
            console.log(`⚠️  Repo ${repo._id} has no orgId, skipping`);
            continue;
        }

        // Update ALL commits for this repo with the repo's orgId
        const result = await CommitModel.updateMany(
            { repoId: repo._id },
            { $set: { orgId: repo.orgId } }
        );

        if (result.modifiedCount > 0) {
            console.log(`✅ Fixed ${result.modifiedCount} commits for repo ${repo._id}`);
            totalFixed += result.modifiedCount;
        }
    }

    console.log(`\n✅ TOTAL FIXED: ${totalFixed} commits\n`);

    // Verification
    const totalCommits = await CommitModel.countDocuments({});
    const withOrgId = await CommitModel.countDocuments({ orgId: { $exists: true, $ne: null } });

    console.log("=== VERIFICATION ===");
    console.log(`Total commits: ${totalCommits}`);
    console.log(`With orgId: ${withOrgId}`);
    console.log(`Without orgId: ${totalCommits - withOrgId}`);

    await mongoose.disconnect();
};

fixCommitsOrgId();

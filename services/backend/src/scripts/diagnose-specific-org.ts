import "dotenv/config";
import mongoose from "mongoose";
import { CommitModel } from "../models/commit.model";
import { RepoModel } from "../models/repo.model";
import { OrgModel } from "../models/org.model";
import { Types } from "mongoose";

const diagnoseSpecificOrg = async () => {
    await mongoose.connect(process.env.MONGO_URL!);

    const orgId = "695f3acb2313bfeb5d48ef2c";

    console.log(`\n=== DIAGNOSING ORG: ${orgId} ===\n`);

    // Find org
    const org = await OrgModel.findById(orgId).lean();
    if (!org) {
        console.log("❌ Org not found!");
        return;
    }

    console.log(`Org name: ${org.name}\n`);

    // Find repos
    const repos = await RepoModel.find({ orgId: new Types.ObjectId(orgId) }).lean();
    console.log(`Repos connected: ${repos.length}`);

    if (repos.length === 0) {
        console.log("\n❌ NO REPOS CONNECTED TO THIS ORG!");
        console.log("\nThis is why no commits are showing.");
        console.log("User needs to CONNECT REPOS to this org first.\n");
    } else {
        console.log("\nRepos:");
        for (const repo of repos) {
            console.log(`  - ${repo.repoFullName} (ID: ${repo._id})`);

            // Count commits for this repo
            const commitCount = await CommitModel.countDocuments({ repoId: repo._id });
            console.log(`    Commits: ${commitCount}`);

            if (commitCount > 0) {
                // Check if commits have correct orgId
                const withCorrectOrg = await CommitModel.countDocuments({
                    repoId: repo._id,
                    orgId: new Types.ObjectId(orgId)
                });
                console.log(`    With correct orgId: ${withCorrectOrg}/${commitCount}`);
            }
        }
    }

    // Check if there are commits with wrong orgId
    const allCommitsForRepos = repos.length > 0
        ? await CommitModel.countDocuments({
            repoId: { $in: repos.map(r => r._id) }
        })
        : 0;

    const commitsWithWrongOrg = repos.length > 0
        ? await CommitModel.countDocuments({
            repoId: { $in: repos.map(r => r._id) },
            orgId: { $ne: new Types.ObjectId(orgId) }
        })
        : 0;

    if (commitsWithWrongOrg > 0) {
        console.log(`\n⚠️  Found ${commitsWithWrongOrg} commits with WRONG orgId!`);
        console.log("These need to be fixed.\n");
    }

    await mongoose.disconnect();
};

diagnoseSpecificOrg();

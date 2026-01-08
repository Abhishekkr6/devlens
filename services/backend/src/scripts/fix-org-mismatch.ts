import "dotenv/config";
import mongoose from "mongoose";
import { RepoModel } from "../models/repo.model";
import { CommitModel } from "../models/commit.model";
import { PRModel } from "../models/pr.model";
import { Types } from "mongoose";

/**
 * Fix for manual org deletion issue:
 * Move all repos and their data to the NEW org
 */
const fixOrgMismatch = async () => {
    await mongoose.connect(process.env.MONGO_URL!);

    console.log("\n=== FIXING ORG MISMATCH ===\n");

    // NEW org ID (जो अभी frontend पर है)
    const newOrgId = "695f3acb2313bfeb5d48ef2c";

    console.log(`New Org ID: ${newOrgId}\n`);

    // Find all repos (किसी भी org से)
    const allRepos = await RepoModel.find({}).lean();
    console.log(`Found ${allRepos.length} total repos\n`);

    // Update ALL repos to new org
    const repoResult = await RepoModel.updateMany(
        {},
        { $set: { orgId: new Types.ObjectId(newOrgId) } }
    );
    console.log(`✅ Updated ${repoResult.modifiedCount} repos to new org`);

    // Update ALL commits to new org
    const commitResult = await CommitModel.updateMany(
        {},
        { $set: { orgId: new Types.ObjectId(newOrgId) } }
    );
    console.log(`✅ Updated ${commitResult.modifiedCount} commits to new org`);

    // Update ALL PRs to new org (if any)
    const prResult = await PRModel.updateMany(
        {},
        { $set: { orgId: new Types.ObjectId(newOrgId) } }
    );
    console.log(`✅ Updated ${prResult.modifiedCount} PRs to new org`);

    // Verification
    console.log("\n=== VERIFICATION ===\n");
    const repos = await RepoModel.countDocuments({ orgId: new Types.ObjectId(newOrgId) });
    const commits = await CommitModel.countDocuments({ orgId: new Types.ObjectId(newOrgId) });
    const prs = await PRModel.countDocuments({ orgId: new Types.ObjectId(newOrgId) });

    console.log(`Repos in new org: ${repos}`);
    console.log(`Commits in new org: ${commits}`);
    console.log(`PRs in new org: ${prs}`);

    console.log("\n✅ DONE! Now refresh frontend and check.\n");

    await mongoose.disconnect();
};

fixOrgMismatch();

import "dotenv/config";
import mongoose from "mongoose";
import { RepoModel } from "../models/repo.model";

/**
 * CRITICAL FIX: repoFullName missing है database में
 * यह script सभी repos के repoFullName fix करेगा
 */
const fixRepoFullNames = async () => {
    await mongoose.connect(process.env.MONGO_URL!);

    console.log("\n🔧 FIXING REPO FULL NAMES...\n");

    const repos = await RepoModel.find({});

    for (const repo of repos) {
        console.log(`\nRepo ID: ${repo._id}`);
        console.log(`Current repoFullName: ${repo.repoFullName || "MISSING"}`);
        console.log(`repoName: ${repo.repoName}`);
        console.log(`owner: ${repo.owner}`);

        // Fix: repoFullName = owner/repoName
        if (!repo.repoFullName && repo.owner && repo.repoName) {
            repo.repoFullName = `${repo.owner}/${repo.repoName}`;
            await repo.save();
            console.log(`✅ FIXED: ${repo.repoFullName}`);
        } else if (repo.repoFullName) {
            console.log(`✅ Already OK`);
        } else {
            console.log(`❌ Cannot fix - owner or repoName missing`);
        }
    }

    console.log("\n=== AFTER FIX ===\n");
    const fixed = await RepoModel.find({}, 'repoFullName owner repo Name').lean();
    fixed.forEach((r: any) => {
        console.log(`${r.repoFullName} ✅`);
    });

    await mongoose.disconnect();
    console.log("\n✅ Done!\n");
};

fixRepoFullNames().catch(console.error);

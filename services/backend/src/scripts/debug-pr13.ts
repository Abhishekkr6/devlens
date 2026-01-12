import mongoose from "mongoose";
import { PRModel } from "../models/pr.model";
import { CommitModel } from "../models/commit.model";
import { RepoModel } from "../models/repo.model";

async function debugMergedPR() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error("MONGODB_URI not set");
        }

        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // Find the repo for teampulse_testing_2
        const repo = await RepoModel.findOne({ repoFullName: /teampulse_testing_2/i });

        if (!repo) {
            console.log("❌ Repo 'teampulse_testing_2' not found");
            await mongoose.disconnect();
            return;
        }

        console.log("\n📦 Found Repo:");
        console.log({
            _id: repo._id,
            repoFullName: repo.repoFullName,
            repoName: repo.repoName,
            orgId: repo.orgId,
        });

        // Find PR #13
        const pr13 = await PRModel.findOne({
            repoId: repo._id,
            number: 13
        });

        if (!pr13) {
            console.log("\n❌ PR #13 not found in database");

            // Check all PRs for this repo
            const allPRs = await PRModel.find({ repoId: repo._id }).sort({ number: -1 }).limit(5);
            console.log(`\n📋 Recent PRs for this repo (found ${allPRs.length}):`);
            allPRs.forEach(pr => {
                console.log({
                    number: pr.number,
                    title: pr.title,
                    state: pr.state,
                    mergedAt: pr.mergedAt,
                    createdAt: pr.createdAt,
                });
            });
        } else {
            console.log("\n✅ Found PR #13:");
            console.log({
                _id: pr13._id,
                number: pr13.number,
                title: pr13.title,
                state: pr13.state,
                mergedAt: pr13.mergedAt,
                createdAt: pr13.createdAt,
                updatedAt: pr13.updatedAt,
                orgId: pr13.orgId,
                repoId: pr13.repoId,
            });
        }

        // Check recent commits from this repo
        const recentCommits = await CommitModel.find({ repoId: repo._id })
            .sort({ timestamp: -1 })
            .limit(5)
            .populate("repoId", "repoName");

        console.log(`\n📝 Recent commits for this repo (found ${recentCommits.length}):`);
        recentCommits.forEach((commit: any) => {
            console.log({
                sha: commit.sha.substring(0, 7),
                message: commit.message?.substring(0, 50),
                author: commit.authorName,
                timestamp: commit.timestamp,
                repo: commit.repoId?.repoName,
            });
        });

        // Check what the activity endpoint would return
        const allActivities = await PRModel.find({ orgId: repo.orgId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select("number title state createdAt mergedAt repoId")
            .populate("repoId", "repoName");

        console.log(`\n🎯 Recent PRs that would show in activity feed (found ${allActivities.length}):`);
        allActivities.forEach((pr: any) => {
            console.log({
                number: pr.number,
                title: pr.title?.substring(0, 40),
                state: pr.state,
                mergedAt: pr.mergedAt,
                repo: pr.repoId?.repoName,
            });
        });

        await mongoose.disconnect();
        console.log("\n✅ Disconnected from MongoDB");
    } catch (err) {
        console.error("❌ Error:", err);
        await mongoose.disconnect();
    }
}

debugMergedPR();

import "dotenv/config";
import mongoose from "mongoose";
import { RepoModel } from "../models/repo.model";
import { CommitModel } from "../models/commit.model";

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/teampulse";

const debugAll = async () => {
    try {
        await mongoose.connect(MONGO_URL);

        console.log("\n========= REPOSITORY STATUS =========\n");
        const repos = await RepoModel.find({}).lean();

        for (const repo of repos) {
            console.log(`Repo: ${repo.repoFullName}`);
            console.log(`  - ID: ${repo._id}`);
            console.log(`  - Webhook ID: ${(repo as any).webhookId || "❌ MISSING"}`);
            console.log(`  - Webhook Status: ${(repo as any).webhookStatus || "❌ NOT SET"}`);

            // Count commits for this repo
            const commitCount = await CommitModel.countDocuments({ repoId: repo._id });
            console.log(`  - Commits in DB: ${commitCount}`);

            if ((repo as any).webhookError) {
                console.log(`  - Error: ${(repo as any).webhookError}`);
            }
            console.log("");
        }

        console.log("\n========= COMMITS BY REPO =========\n");
        const commitsByRepo = await CommitModel.aggregate([
            {
                $lookup: {
                    from: "repos",
                    localField: "repoId",
                    foreignField: "_id",
                    as: "repo"
                }
            },
            {
                $unwind: "$repo"
            },
            {
                $group: {
                    _id: "$repoId",
                    count: { $sum: 1 },
                    repoName: { $first: "$repo.repoFullName" }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        if (commitsByRepo.length === 0) {
            console.log("❌ NO COMMITS FOUND IN DATABASE!");
        } else {
            commitsByRepo.forEach(item => {
                console.log(`${item.repoName}: ${item.count} commits`);
            });
        }

        console.log("\n========= LATEST 5 COMMITS =========\n");
        const latestCommits = await CommitModel.find({})
            .sort({ timestamp: -1 })
            .limit(5)
            .populate('repoId', 'repoFullName')
            .lean();

        if (latestCommits.length === 0) {
            console.log("❌ NO COMMITS IN DATABASE");
        } else {
            latestCommits.forEach(commit => {
                console.log(`${new Date(commit.timestamp ?? new Date()).toLocaleString()}`);
                console.log(`  Repo: ${(commit.repoId as any)?.repoFullName || 'Unknown'}`);
                console.log(`  SHA: ${commit.sha?.substring(0, 7)}`);
                console.log(`  Message: ${commit.message?.substring(0, 50)}`);
                console.log("");
            });
        }

        await mongoose.disconnect();

    } catch (err) {
        console.error("Error:", err);
    }
};

debugAll();

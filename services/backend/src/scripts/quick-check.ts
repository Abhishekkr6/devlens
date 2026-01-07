import "dotenv/config";
import mongoose from "mongoose";
import { RepoModel } from "../models/repo.model";
import { CommitModel } from "../models/commit.model";

const checkStatus = async () => {
    await mongoose.connect(process.env.MONGO_URL!);

    console.log("\n=== REPOSITORIES ===\n");
    const repos = await RepoModel.find({}).lean();
    repos.forEach((r: any) => {
        console.log(`${r.repoFullName}`);
        console.log(`  webhookId: ${r.webhookId || "MISSING"}`);
        console.log(`  status: ${r.webhookStatus || "NOT SET"}`);
    });

    console.log("\n=== COMMITS COUNT ===\n");
    const commits = await CommitModel.aggregate([
        { $lookup: { from: "repos", localField: "repoId", foreignField: "_id", as: "repo" } },
        { $unwind: "$repo" },
        { $group: { _id: "$repoId", count: { $sum: 1 }, name: { $first: "$repo.repoFullName" } } }
    ]);

    commits.forEach((c: any) => {
        console.log(`${c.name}: ${c.count} commits`);
    });

    if (commits.length === 0) {
        console.log("NO COMMITS FOUND!");
    }

    await mongoose.disconnect();
};

checkStatus().catch(console.error);

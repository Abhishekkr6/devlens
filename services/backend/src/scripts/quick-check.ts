import mongoose from "mongoose";
import "dotenv/config";

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/teampulse";

async function quickCheck() {
    await mongoose.connect(MONGO_URL);
    const db = mongoose.connection.db!;

    // Check commits indexes
    const commitsCollection = db.collection("commits");
    const indexes = await commitsCollection.indexes();

    console.log("\n=== COMMITS INDEXES ===");
    indexes.forEach(idx => {
        console.log(`${idx.name}: ${JSON.stringify(idx.key)} ${idx.unique ? '(UNIQUE)' : ''}`);
    });

    const hasOld = indexes.some(i => i.name === "sha_1" && i.unique);
    const hasNew = indexes.some(i => i.name === "orgId_1_sha_1" && i.unique);

    console.log(`\nOld sha_1 index (should be GONE): ${hasOld ? '❌ EXISTS' : '✅ REMOVED'}`);
    console.log(`New orgId_1_sha_1 index (should EXIST): ${hasNew ? '✅ EXISTS' : '❌ MISSING'}`);

    // Count docs
    const totalCommits = await commitsCollection.countDocuments({});
    console.log(`\nTotal commits in DB: ${totalCommits}`);

    // Find repos in multiple orgs
    const { RepoModel } = await import("../models/repo.model");
    const sharedRepos = await RepoModel.aggregate([
        { $group: { _id: "$repoFullName", count: { $sum: 1 }, orgs: { $push: "$orgId" } } },
        { $match: { count: { $gt: 1 } } }
    ]);

    console.log(`\nRepos in multiple orgs: ${sharedRepos.length}`);
    if (sharedRepos.length > 0) {
        sharedRepos.forEach(r => {
            console.log(`  ${r._id}: ${r.count} orgs (${r.orgs.join(", ")})`);
        });
    }

    await mongoose.disconnect();
}

quickCheck().catch(console.error);

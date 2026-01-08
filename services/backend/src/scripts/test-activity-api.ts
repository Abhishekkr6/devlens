import "dotenv/config";
import mongoose from "mongoose";
import { CommitModel } from "../models/commit.model";
import { Types } from "mongoose";

const testActivityAPI = async () => {
    await mongoose.connect(process.env.MONGO_URL!);

    // Get first org from commits
    const sampleCommit = await CommitModel.findOne({}).lean();

    if (!sampleCommit) {
        console.log("❌ No commits found in database!");
        return;
    }

    const orgId = sampleCommit.orgId;
    console.log(`\nTesting with orgId: ${orgId}\n`);

    // Simulate the API query
    const last30 = new Date();
    last30.setDate(last30.getDate() - 30);

    const timeline = await CommitModel.aggregate([
        {
            $match: {
                orgId: new Types.ObjectId(String(orgId)),
                timestamp: { $gte: last30 }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                total: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    console.log(`=== API RESPONSE ===`);
    console.log(`Total days with commits: ${timeline.length}`);
    console.log(`\nSample data:`);
    console.log(JSON.stringify(timeline.slice(0, 5), null, 2));

    if (timeline.length === 0) {
        console.log("\n❌ NO DATA RETURNED!");
        console.log("\nDEBUG INFO:");
        const totalForOrg = await CommitModel.countDocuments({ orgId: new Types.ObjectId(String(orgId)) });
        console.log(`- Total commits for this orgId: ${totalForOrg}`);

        const recentCommits = await CommitModel.find({ orgId: new Types.ObjectId(String(orgId)) })
            .sort({ timestamp: -1 })
            .limit(3)
            .lean();
        console.log(`- Recent commits:`, recentCommits.map(c => ({
            timestamp: c.timestamp,
            message: c.message?.substring(0, 50)
        })));
    }

    await mongoose.disconnect();
};

testActivityAPI();

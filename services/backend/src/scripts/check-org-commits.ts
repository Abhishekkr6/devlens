import "dotenv/config";
import mongoose from "mongoose";
import { CommitModel } from "../models/commit.model";
import { Types } from "mongoose";

const checkOrgCommits = async () => {
    await mongoose.connect(process.env.MONGO_URL!);

    const orgId = "695f3acb2313bfeb5d48ef2c";

    console.log(`\nChecking commits for org: ${orgId}\n`);

    const total = await CommitModel.countDocuments({
        orgId: new Types.ObjectId(orgId)
    });

    console.log(`Total commits: ${total}`);

    if (total > 0) {
        const recent = await CommitModel.find({
            orgId: new Types.ObjectId(orgId)
        })
            .sort({ timestamp: -1 })
            .limit(5)
            .lean();

        console.log(`\nRecent commits:`);
        recent.forEach((c, i) => {
            console.log(`${i + 1}. ${c.timestamp?.toISOString()} - ${c.message?.substring(0, 50)}`);
        });
    } else {
        console.log("\n❌ NO COMMITS for this org!");
    }

    await mongoose.disconnect();
};

checkOrgCommits();

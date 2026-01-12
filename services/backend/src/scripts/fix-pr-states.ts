import mongoose from "mongoose";
import { PRModel } from "../models/pr.model";

async function fixPR13State() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error("MONGODB_URI not set");
        }

        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // Find all PRs that have mergedAt but state is 'closed'
        const result = await PRModel.updateMany(
            {
                mergedAt: { $ne: null },
                state: "closed"
            },
            {
                $set: { state: "merged" }
            }
        );

        console.log(`✅ Updated ${result.modifiedCount} PRs from 'closed' to 'merged'`);

        // Verify PR #13
        const pr13 = await PRModel.findOne({ number: 13 });
        if (pr13) {
            console.log("\n📋 PR #13 after fix:");
            console.log({
                number: pr13.number,
                title: pr13.title,
                state: pr13.state,
                mergedAt: pr13.mergedAt,
            });
        }

        await mongoose.disconnect();
        console.log("✅ Disconnected from MongoDB");
    } catch (err) {
        console.error("❌ Error:", err);
        await mongoose.disconnect();
    }
}

fixPR13State();

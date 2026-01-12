import mongoose from "mongoose";
import { PRModel } from "../models/pr.model";

async function checkPRStatus() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error("MONGODB_URI not set");
        }

        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB\n");

        // Find all PRs
        const allPRs = await PRModel.find({}).select("number title state mergedAt closedAt").lean();

        console.log(`📊 Total PRs in database: ${allPRs.length}\n`);

        // Group by state
        const byState: Record<string, number> = {};
        allPRs.forEach((pr: any) => {
            const state = pr.state || "unknown";
            byState[state] = (byState[state] || 0) + 1;
        });

        console.log("📋 PRs by State:");
        Object.entries(byState).forEach(([state, count]) => {
            console.log(`  ${state}: ${count}`);
        });

        // Find PRs that should be merged but aren't
        const shouldBeMerged = allPRs.filter((pr: any) => pr.mergedAt && pr.state !== "merged");

        if (shouldBeMerged.length > 0) {
            console.log(`\n⚠️  Found ${shouldBeMerged.length} PRs with mergedAt but state is not 'merged':`);
            shouldBeMerged.forEach((pr: any) => {
                console.log(`  PR #${pr.number}: "${pr.title}" - state: ${pr.state}, mergedAt: ${pr.mergedAt}`);
            });

            console.log("\n💡 Run fix-pr-states.ts to fix these PRs");
        } else {
            console.log("\n✅ All PRs have correct states!");
        }

        await mongoose.disconnect();
        console.log("\n✅ Disconnected from MongoDB");
    } catch (err) {
        console.error("❌ Error:", err);
        await mongoose.disconnect();
    }
}

checkPRStatus();

import "dotenv/config";
import mongoose from "mongoose";
import { RepoModel } from "../models/repo.model";
import { UserModel } from "../models/user.model";
import { createRepositoryWebhook } from "../services/github.service";

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/teampulse";
const BACKEND_URL = process.env.BACKEND_URL || "https://teampulse-w2s8.onrender.com";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

/**
 * इस script से सभी repos के लिए webhooks automatically create होंगे
 * जिन repos के webhooks पहले नहीं बने थे
 */
const setupWebhooksForAllRepos = async () => {
    try {
        if (!WEBHOOK_SECRET) {
            console.error("❌ WEBHOOK_SECRET not found in .env file!");
            return;
        }

        await mongoose.connect(MONGO_URL);
        console.log("✅ Connected to MongoDB\n");

        // सभी repos fetch करें जिनके webhooks नहीं बने
        const repos = await RepoModel.find({
            $or: [
                { webhookId: { $exists: false } },
                { webhookId: null },
                { webhookStatus: "failed" },
                { webhookStatus: "pending" }
            ]
        });

        console.log(`📊 Found ${repos.length} repos without working webhooks\n`);

        if (repos.length === 0) {
            console.log("✅ All repos already have webhooks configured!");
            return;
        }

        const webhookUrl = `${BACKEND_URL}/api/v1/webhooks/github`;
        console.log(`🔧 Webhook URL: ${webhookUrl}\n`);
        console.log("========================================\n");

        for (const repo of repos) {
            console.log(`\n🔄 Processing: ${repo.repoFullName}`);
            console.log(`   Repo ID: ${repo._id}`);
            console.log(`   Current Status: ${repo.webhookStatus || "not set"}`);

            try {
                // User ko find करें जो इस org से associated है
                const user = await UserModel.findOne({
                    orgIds: repo.orgId,
                    githubAccessToken: { $exists: true, $ne: null }
                });

                if (!user || !user.githubAccessToken) {
                    console.error(`   ❌ No user with GitHub token found for this org`);
                    repo.webhookStatus = "failed";
                    repo.webhookError = "No user with GitHub access token";
                    await repo.save();
                    continue;
                }

                console.log(`   👤 Using token from user: ${user.githubId}`);

                // Webhook create करें
                const result = await createRepositoryWebhook(
                    repo.repoFullName,
                    user.githubAccessToken,
                    webhookUrl,
                    WEBHOOK_SECRET
                );

                if (result.success && result.webhookId) {
                    repo.webhookId = result.webhookId;
                    repo.webhookStatus = "active";
                    repo.webhookError = undefined;
                    await repo.save();
                    console.log(`   ✅ Webhook created successfully!`);
                    console.log(`   Webhook ID: ${result.webhookId}`);
                } else {
                    repo.webhookStatus = "failed";
                    repo.webhookError = result.error || "Unknown error";
                    await repo.save();
                    console.error(`   ❌ Webhook creation failed: ${result.error}`);
                }
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : String(err);
                console.error(`   ❌ Error: ${errorMsg}`);
                repo.webhookStatus = "failed";
                repo.webhookError = errorMsg;
                await repo.save();
            }
        }

        console.log("\n========================================");
        console.log("📊 FINAL SUMMARY");
        console.log("========================================\n");

        // Final status check करें
        const allRepos = await RepoModel.find({});
        const activeWebhooks = allRepos.filter((r: any) => r.webhookStatus === "active");
        const failedWebhooks = allRepos.filter((r: any) => r.webhookStatus === "failed");
        const pendingWebhooks = allRepos.filter((r: any) => !r.webhookStatus || r.webhookStatus === "pending");

        console.log(`✅ Active webhooks: ${activeWebhooks.length}`);
        console.log(`❌ Failed webhooks: ${failedWebhooks.length}`);
        console.log(`⏳ Pending webhooks: ${pendingWebhooks.length}`);

        if (failedWebhooks.length > 0) {
            console.log("\n❌ Failed repositories:");
            failedWebhooks.forEach((r: any) => {
                console.log(`   - ${r.repoFullName}: ${r.webhookError}`);
            });
            console.log("\n💡 Tip: Check if GitHub token has 'admin:repo_hook' permission");
        }

        if (activeWebhooks.length === allRepos.length) {
            console.log("\n🎉 All repositories now have active webhooks!");
            console.log("✅ Commits from all repos should now be saved to database");
        }

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await mongoose.disconnect();
        console.log("\n✅ Disconnected from MongoDB");
    }
};

console.log("========================================");
console.log("🚀 WEBHOOK SETUP SCRIPT");
console.log("========================================\n");
console.log("This script will create webhooks for all");
console.log("repositories that don't have them yet.\n");

setupWebhooksForAllRepos();

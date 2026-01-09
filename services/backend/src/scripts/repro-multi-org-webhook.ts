import mongoose, { Types } from "mongoose";
import "dotenv/config";
import { RepoModel } from "../models/repo.model";
import { CommitModel } from "../models/commit.model";
import { OrgModel } from "../models/org.model";
import { githubWebhookHandler } from "../controllers/webhook.controller";
import { Request, Response } from "express";

// MOCK CONSTANTS
const REPO_FULL_NAME = "test-owner/multi-org-repo";
const COMMIT_SHA = "sha-test-multi-org-001";
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/teampulse";

async function runTest() {
    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(MONGO_URL);

        // 1. CLEANUP
        console.log("🧹 Cleaning up old test data...");
        await OrgModel.deleteMany({ name: /^TEST_ORG_/ });
        await RepoModel.deleteMany({ repoFullName: REPO_FULL_NAME });
        await CommitModel.deleteMany({ sha: COMMIT_SHA });

        // 2. CREATE 2 ORGANIZATIONS
        console.log("🏢 Creating 2 test organizations...");
        const org1 = await OrgModel.create({ name: "TEST_ORG_1", slug: "test-org-1", members: [] });
        const org2 = await OrgModel.create({ name: "TEST_ORG_2", slug: "test-org-2", members: [] });

        console.log(`✅ Created Org1: ${org1._id}, Org2: ${org2._id}`);

        // 3. CONNECT REPO TO BOTH ORGS
        console.log("🔗 Connecting repo to both orgs...");
        const repo1 = await RepoModel.create({
            provider: "github",
            repoFullName: REPO_FULL_NAME,
            repoName: "multi-org-repo",
            owner: "test-owner",
            providerRepoId: 1001,
            orgId: org1._id,
            webhookStatus: "active"
        });

        const repo2 = await RepoModel.create({
            provider: "github",
            repoFullName: REPO_FULL_NAME,
            repoName: "multi-org-repo",
            owner: "test-owner",
            providerRepoId: 1001,
            orgId: org2._id,
            webhookStatus: "active"
        });
        console.log("✅ Repo connected to both orgs");

        // 4. SIMULATE WEBHOOK
        console.log("📨 Simulating GitHub Push Webhook...");

        const payload = {
            repository: { full_name: REPO_FULL_NAME, id: 1001 },
            commits: [
                {
                    id: COMMIT_SHA,
                    message: "Test Multi-Org Commit",
                    timestamp: new Date().toISOString(),
                    author: { username: "tester", name: "Tester" },
                    modified: ["file.txt"],
                    added: [],
                    removed: []
                }
            ]
        };

        const req = {
            headers: {
                "x-github-event": "push",
                "x-github-delivery": "delivery-id-001",
                "x-hub-signature-256": "sha256=dummy"
            },
            body: Buffer.from(JSON.stringify(payload))
        } as unknown as Request;

        const res = {
            status: (code: number) => ({
                json: (data: any) => {
                    console.log(`[WEBHOOK RESPONSE] ${code}:`, data);
                    return res;
                },
                send: (data: any) => {
                    console.log(`[WEBHOOK RESP] ${code}:`, data);
                    return res;
                }
            })
        } as unknown as Response;

        // Mock signature verification
        const originalVerify = require("../utils/verifySignature").verifyGithubSignature;
        require("../utils/verifySignature").verifyGithubSignature = () => true;

        await githubWebhookHandler(req, res);

        // 5. VERIFY DATA FAN-OUT
        console.log("🔍 Verifying data...");

        const commit1 = await CommitModel.findOne({ sha: COMMIT_SHA, orgId: org1._id });
        const commit2 = await CommitModel.findOne({ sha: COMMIT_SHA, orgId: org2._id });

        console.log(`Commit for Org1: ${commit1 ? "✅ FOUND" : "❌ MISSING"}`);
        console.log(`Commit for Org2: ${commit2 ? "✅ FOUND" : "❌ MISSING"}`);

        if (commit1 && commit2 && commit1._id.toString() !== commit2._id.toString()) {
            console.log("🎉 SUCCESS: Commit fanned out to both organizations independently!");
        } else {
            console.error("❌ FAILED: Data did not fan out correctly.");
            process.exit(1);
        }

    } catch (err) {
        console.error("❌ TEST FAILED:", err);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

runTest();

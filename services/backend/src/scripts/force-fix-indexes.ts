import mongoose from "mongoose";
import "dotenv/config";
import { RepoModel } from "../models/repo.model";
import { CommitModel } from "../models/commit.model";
import { PRModel } from "../models/pr.model";

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/teampulse";

async function forceFix() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected");

        // REPOS
        try { await RepoModel.collection.dropIndex("repoFullName_1"); console.log("Dropped repoFullName_1"); } catch (e) { }
        try { await RepoModel.collection.createIndex({ repoFullName: 1, orgId: 1 }, { unique: true, name: "repoFullName_1_orgId_1" }); console.log("Created Repo Multi-Org Index"); } catch (e) { console.log((e as any).message); }
        // Ensure non-unique lookup index
        try { await RepoModel.collection.createIndex({ repoFullName: 1 }, { name: "repoFullName_1" }); console.log("Created Repo Lookup Index"); } catch (e) { console.log((e as any).message); }

        // COMMITS
        try { await CommitModel.collection.dropIndex("sha_1"); console.log("Dropped sha_1"); } catch (e) { }
        try { await CommitModel.collection.createIndex({ orgId: 1, sha: 1 }, { unique: true, name: "orgId_1_sha_1" }); console.log("Created Commit Multi-Org Index"); } catch (e) { console.log((e as any).message); }

        // PRs
        try { await PRModel.collection.dropIndex("providerPrId_1"); console.log("Dropped providerPrId_1"); } catch (e) { }
        try { await PRModel.collection.createIndex({ orgId: 1, providerPrId: 1 }, { unique: true, name: "orgId_1_providerPrId_1" }); console.log("Created PR Multi-Org Index"); } catch (e) { console.log((e as any).message); }

        console.log("DONE");
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

forceFix();

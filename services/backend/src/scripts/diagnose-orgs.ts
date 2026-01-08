import "dotenv/config";
import mongoose from "mongoose";
import { CommitModel } from "../models/commit.model";
import { OrgModel } from "../models/org.model";
import { RepoModel } from "../models/repo.model";

const diagnose = async () => {
    await mongoose.connect(process.env.MONGO_URL!);

    console.log("\n=== ALL ORGANIZATIONS ===\n");
    const orgs = await OrgModel.find({}, 'name').lean();
    orgs.forEach(o => console.log(`${o.name} - ${o._id}`));

    console.log("\n=== COMMITS BY ORG ===\n");
    for (const org of orgs) {
        const count = await CommitModel.countDocuments({ orgId: org._id });
        if (count > 0) {
            console.log(`✅ ${org.name}: ${count} commits`);
        } else {
            console.log(`❌ ${org.name}: 0 commits`);
        }
    }

    console.log("\n=== REPOS BY ORG ===\n");
    for (const org of orgs) {
        const repos = await RepoModel.find({ orgId: org._id }, 'repoFullName').lean();
        console.log(`\n${org.name}:`);
        if (repos.length === 0) {
            console.log("  No repos");
        } else {
            repos.forEach(r => console.log(`  - ${r.repoFullName}`));
        }
    }

    await mongoose.disconnect();
};

diagnose();

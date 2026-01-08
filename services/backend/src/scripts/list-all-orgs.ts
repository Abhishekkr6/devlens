import "dotenv/config";
import mongoose from "mongoose";
import { OrgModel } from "../models/org.model";
import { RepoModel } from "../models/repo.model";
import { CommitModel } from "../models/commit.model";

const listAllOrgs = async () => {
    await mongoose.connect(process.env.MONGO_URL!);

    console.log("\n=== ALL ORGANIZATIONS WITH DATA ===\n");

    const orgs = await OrgModel.find({}).lean();

    for (const org of orgs) {
        const repoCount = await RepoModel.countDocuments({ orgId: org._id });
        const commitCount = await CommitModel.countDocuments({ orgId: org._id });

        console.log(`\nOrg: ${org.name}`);
        console.log(`  ID: ${org._id}`);
        console.log(`  Repos: ${repoCount}`);
        console.log(`  Commits: ${commitCount}`);
        console.log(`  URL: https://teampulse18.vercel.app/organization/${org.slug}`);

        if (repoCount > 0) {
            const repos = await RepoModel.find({ orgId: org._id }, 'repoFullName').lean();
            console.log(`  Connected repos:`);
            repos.forEach(r => console.log(`    - ${r.repoFullName}`));
        }
    }

    console.log("\n=== SUMMARY ===\n");
    console.log("Go to the URL of the org that has commits.");
    console.log("That's where your data will show!\n");

    await mongoose.disconnect();
};

listAllOrgs();

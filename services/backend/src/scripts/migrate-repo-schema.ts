import "dotenv/config";
import mongoose from "mongoose";

/**
 * MIGRATION: Rename 'name' field to 'repoFullName'
 * Old schema used 'name', new schema uses 'repoFullName'
 */
const migrateRepoSchema = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL!);
        const db = mongoose.connection.db;

        if (!db) throw new Error("No DB connection");

        console.log("\n🔧 MIGRATING REPO SCHEMA...\n");

        // Get all repos with old 'name' field
        const repos = await db.collection('repos').find({ name: { $exists: true } }).toArray();

        console.log(`Found ${repos.length} repos with old 'name' field\n`);

        if (repos.length === 0) {
            console.log("✅ No migration needed - all repos already have correct schema");
            return;
        }

        for (const repo of repos) {
            console.log(`Migrating: ${repo.name}`);

            // Rename 'name' to 'repoFullName'
            await db.collection('repos').updateOne(
                { _id: repo._id },
                {
                    $rename: { name: 'repoFullName' },
                    $set: {
                        // Set repoName and owner if not already set
                        ...(!repo.repoName && repo.name && repo.name.includes('/')
                            ? { repoName: repo.name.split('/')[1] }
                            : {}),
                        ...(!repo.owner && repo.name && repo.name.includes('/')
                            ? { owner: repo.name.split('/')[0] }
                            : {})
                    }
                }
            );

            console.log(`  ✅ ${repo.name} → repoFullName`);
        }

        console.log("\n=== VERIFICATION ===\n");
        const updated = await db.collection('repos').find({}, { projection: { repoFullName: 1, owner: 1, repoName: 1 } }).toArray();

        updated.forEach((r: any) => {
            console.log(`✅ ${r.repoFullName} (owner: ${r.owner}, repo: ${r.repoName})`);
        });

        console.log("\n✅ MIGRATION COMPLETE!\n");
        console.log("Now webhooks should work for all repos.");

        await mongoose.disconnect();
    } catch (err) {
        console.error("❌ Migration failed:", err);
    }
};

migrateRepoSchema();

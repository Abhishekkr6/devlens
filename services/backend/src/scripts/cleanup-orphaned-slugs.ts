import "dotenv/config";
import mongoose from "mongoose";

async function cleanupOrphanedSlugs() {
    try {
        await mongoose.connect(process.env.MONGO_URL!);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;
        if (!db) {
            console.error('❌ Database connection not established');
            process.exit(1);
        }

        const orgsCollection = db.collection('orgs');

        console.log('🔍 Checking for data integrity issues...\n');

        // Check 1: Find organizations with empty or null slugs
        const invalidSlugs = await orgsCollection.find({
            $or: [
                { slug: null },
                { slug: "" },
                { slug: { $exists: false } }
            ]
        }).toArray();

        if (invalidSlugs.length > 0) {
            console.log(`⚠️  Found ${invalidSlugs.length} organizations with invalid slugs:`);
            invalidSlugs.forEach((org: any) => {
                console.log(`  - ID: ${org._id}, Name: ${org.name}, Slug: ${org.slug}`);
            });
            console.log('');
        } else {
            console.log('✅ No organizations with invalid slugs\n');
        }

        // Check 2: Find duplicate slugs
        console.log('🔍 Checking for duplicate slugs...');
        const duplicates = await orgsCollection.aggregate([
            { $group: { _id: "$slug", count: { $sum: 1 }, ids: { $push: "$_id" } } },
            { $match: { count: { $gt: 1 } } }
        ]).toArray();

        if (duplicates.length > 0) {
            console.log(`⚠️  Found ${duplicates.length} duplicate slugs:`);
            duplicates.forEach((dup: any) => {
                console.log(`  - Slug: "${dup._id}" (${dup.count} times)`);
                console.log(`    Organization IDs: ${dup.ids.join(', ')}`);
            });
            console.log('\n💡 Manual intervention required to resolve duplicates');
        } else {
            console.log('✅ No duplicate slugs found\n');
        }

        // Check 3: List all slugs
        const allOrgs = await orgsCollection.find({}).project({ slug: 1, name: 1, createdAt: 1 }).sort({ createdAt: -1 }).toArray();
        console.log(`📋 Total organizations: ${allOrgs.length}`);
        if (allOrgs.length > 0) {
            console.log('\nAll slugs:');
            allOrgs.forEach((org: any) => {
                console.log(`  - ${org.slug} (${org.name})`);
            });
        }

        await mongoose.disconnect();
        console.log('\n✅ Cleanup check completed');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

cleanupOrphanedSlugs();

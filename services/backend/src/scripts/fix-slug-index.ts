import "dotenv/config";
import mongoose from "mongoose";

async function fixSlugIndex() {
    try {
        await mongoose.connect(process.env.MONGO_URL!);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;
        if (!db) {
            console.error('❌ Database connection not established');
            process.exit(1);
        }

        const orgsCollection = db.collection('orgs');

        // Step 1: List all current indexes
        console.log('📋 Current indexes on orgs collection:');
        const indexes = await orgsCollection.indexes();
        indexes.forEach(index => {
            console.log(`  - ${index.name}:`, JSON.stringify(index.key));
        });
        console.log('');

        // Step 2: Check for duplicate slugs in the database
        console.log('🔍 Checking for duplicate slugs...');
        const duplicates = await orgsCollection.aggregate([
            { $group: { _id: "$slug", count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } }
        ]).toArray();

        if (duplicates.length > 0) {
            console.log('⚠️  Found duplicate slugs:');
            duplicates.forEach((dup: any) => {
                console.log(`  - "${dup._id}" appears ${dup.count} times`);
            });
            console.log('\n❌ Cannot proceed with index rebuild until duplicates are resolved.');
            await mongoose.disconnect();
            process.exit(1);
        } else {
            console.log('✅ No duplicate slugs found\n');
        }

        // Step 3: Drop the existing unique index on slug
        console.log('🔧 Dropping existing slug index...');
        try {
            // Find the index name for slug
            const slugIndex = indexes.find(idx => idx.key.slug === 1);
            if (slugIndex && slugIndex.name && slugIndex.name !== '_id_') {
                await orgsCollection.dropIndex(slugIndex.name);
                console.log(`✅ Dropped index: ${slugIndex.name}\n`);
            } else {
                console.log('ℹ️  No slug index found to drop\n');
            }
        } catch (error: any) {
            if (error.codeName === 'IndexNotFound') {
                console.log('ℹ️  Slug index already removed\n');
            } else {
                throw error;
            }
        }

        // Step 4: Create a new unique index on slug
        console.log('🔧 Creating new unique index on slug...');
        await orgsCollection.createIndex({ slug: 1 }, { unique: true, name: 'slug_1' });
        console.log('✅ Created new unique index on slug\n');

        // Step 5: Verify the new index
        console.log('✅ Verification - Current indexes:');
        const newIndexes = await orgsCollection.indexes();
        newIndexes.forEach(index => {
            console.log(`  - ${index.name}:`, JSON.stringify(index.key));
            if (index.name === 'slug_1') {
                console.log(`    Unique: ${index.unique || false}`);
            }
        });

        console.log('\n✅ Slug index has been successfully rebuilt!');
        console.log('\n💡 You can now try creating an organization with slug "test1"');

        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixSlugIndex();

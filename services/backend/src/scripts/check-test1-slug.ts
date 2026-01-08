import "dotenv/config";
import mongoose from "mongoose";

async function checkSlug() {
    try {
        await mongoose.connect(process.env.MONGO_URL!);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;
        if (!db) {
            console.error('❌ Database connection not established');
            process.exit(1);
        }

        const orgsCollection = db.collection('orgs');

        // Check for test1 slug
        const orgWithTest1 = await orgsCollection.findOne({ slug: 'test1' });

        if (orgWithTest1) {
            console.log('⚠️  Organization with slug "test1" STILL EXISTS in database!');
            console.log('\nDetails:');
            console.log('  _id:', orgWithTest1._id);
            console.log('  name:', orgWithTest1.name);
            console.log('  slug:', orgWithTest1.slug);
            console.log('  createdBy:', orgWithTest1.createdBy);
            console.log('  members:', JSON.stringify(orgWithTest1.members, null, 2));
            console.log('\n💡 Solution: Delete this organization from the database');
        } else {
            console.log('✅ No organization found with slug "test1"');
            console.log('\n💡 This means the slug should be available.');
            console.log('   The error might be due to MongoDB unique index issues.');
        }

        // List all organizations
        const allOrgs = await orgsCollection.find({}).project({ slug: 1, name: 1 }).toArray();
        console.log('\n📋 All organizations in database:');
        if (allOrgs.length === 0) {
            console.log('  (empty)');
        } else {
            allOrgs.forEach((org: any) => {
                console.log(`  - ${org.slug} (${org.name}) [${org._id}]`);
            });
        }

        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkSlug();

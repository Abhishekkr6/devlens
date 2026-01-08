import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkSlug() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || '');
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        if (!db) {
            console.error('Database connection not established');
            process.exit(1);
        }

        const orgsCollection = db.collection('orgs');

        const orgWithTest1 = await orgsCollection.findOne({ slug: 'test1' });
        console.log('\n Org with slug "test1":', orgWithTest1);

        if (orgWithTest1) {
            console.log('\n⚠️  Organization with slug "test1" still exists!');
            console.log('  _id:', orgWithTest1._id);
            console.log('  name:', orgWithTest1.name);
            console.log('  slug:', orgWithTest1.slug);
        } else {
            console.log('\n✅ No organization found with slug "test1"');
        }

        // Check all orgs
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

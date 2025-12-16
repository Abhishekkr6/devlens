/**
 * Migration Script: Ensure all org creators and users are in org.members
 * 
 * This script runs once to fix existing orgs where members array is missing
 * or incomplete. Production-safe: idempotent (safe to run multiple times).
 * 
 * Usage:
 *   MONGO_URI="mongodb+srv://..." node services/backend/scripts/migrate_org_members.js
 * 
 * Or with npm from backend folder:
 *   npm run migrate:org-members (if you add the script to package.json)
 */

const mongoose = require('mongoose');

// Define schemas inline to avoid import complexity
const OrgSchema = new mongoose.Schema({
  name: String,
  slug: String,
  createdBy: mongoose.Schema.Types.ObjectId,
  members: [{
    userId: mongoose.Schema.Types.ObjectId,
    role: { type: String, enum: ['ADMIN', 'MEMBER', 'VIEWER'], default: 'MEMBER' }
  }],
  createdAt: Date,
  updatedAt: Date
});

const UserSchema = new mongoose.Schema({
  githubId: String,
  orgIds: [mongoose.Schema.Types.ObjectId],
  defaultOrgId: mongoose.Schema.Types.ObjectId,
  createdAt: Date,
  updatedAt: Date
});

const Org = mongoose.model('Org', OrgSchema);
const User = mongoose.model('User', UserSchema);

async function migrate() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('ERROR: MONGO_URI env var not set');
    process.exit(1);
  }

  console.log('🔄 Connecting to MongoDB...');
  await mongoose.connect(mongoUri, { useUnifiedTopology: true });
  console.log('✅ Connected\n');

  try {
    console.log('📋 Starting org members migration...\n');

    // Get all orgs
    const orgs = await Org.find({});
    console.log(`Found ${orgs.length} organizations\n`);

    let fixed = 0;

    for (const org of orgs) {
      const creatorId = org.createdBy;
      if (!creatorId) {
        console.log(`⚠️  Org ${org._id} (${org.name}) - no createdBy, skipping`);
        continue;
      }

      // Check if creator is in members
      const isMemberAlready = org.members && org.members.some(
        m => String(m.userId) === String(creatorId)
      );

      if (isMemberAlready) {
        console.log(`✅ Org ${org._id} (${org.name}) - creator already in members`);
        continue;
      }

      // Add creator to members as ADMIN
      console.log(`🔧 Org ${org._id} (${org.name}) - adding creator to members...`);
      
      await Org.updateOne(
        { _id: org._id },
        { 
          $addToSet: { 
            members: { userId: creatorId, role: 'ADMIN' } 
          } 
        }
      );

      // Also ensure user has this org in orgIds
      await User.updateOne(
        { _id: creatorId },
        {
          $addToSet: { orgIds: org._id },
          $set: { defaultOrgId: org._id }
        }
      );

      console.log(`   ✅ Added\n`);
      fixed++;
    }

    console.log(`\n✨ Migration complete!`);
    console.log(`   - Total orgs: ${orgs.length}`);
    console.log(`   - Fixed: ${fixed}`);
    console.log(`   - Already correct: ${orgs.length - fixed}`);

  } catch (err) {
    console.error('\n❌ Migration error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

migrate().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

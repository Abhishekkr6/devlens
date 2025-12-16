/**
 * Debug Script: Check org membership and user data
 * 
 * Usage:
 *   MONGO_URI="..." node services/backend/scripts/debug_org_membership.js
 * 
 * This will show:
 * - Your user ID and org IDs
 * - Your org details including members array
 * - Whether you're in org.members
 */

const mongoose = require('mongoose');

// Define schemas inline
const UserSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  githubId: String,
  login: String,
  orgIds: [mongoose.Schema.Types.ObjectId],
  defaultOrgId: mongoose.Schema.Types.ObjectId,
});

const OrgSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  slug: String,
  createdBy: mongoose.Schema.Types.ObjectId,
  members: [{
    userId: mongoose.Schema.Types.ObjectId,
    role: { type: String, enum: ['ADMIN', 'MEMBER', 'VIEWER'] }
  }],
});

const User = mongoose.model('User', UserSchema);
const Org = mongoose.model('Org', OrgSchema);

async function debug() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('ERROR: MONGO_URI env var not set');
    process.exit(1);
  }

  console.log('🔄 Connecting to MongoDB...\n');
  await mongoose.connect(mongoUri, { useUnifiedTopology: true });
  console.log('✅ Connected\n');

  try {
    // Hardcode your user ID for testing
    const USER_ID = '694168c668be8055aa7a8f9a';
    const ORG_ID = '693987b22421d7a147ddfd16';

    console.log('🔍 Checking user data:\n');
    const user = await User.findById(USER_ID);
    
    if (!user) {
      console.log(`❌ User ${USER_ID} NOT found in database\n`);
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.login || 'Unknown'}`);
    console.log(`   ID: ${user._id}`);
    console.log(`   defaultOrgId: ${user.defaultOrgId}`);
    console.log(`   orgIds: [${user.orgIds?.map(id => id.toString()).join(', ') || 'none'}]\n`);

    console.log('🔍 Checking org data:\n');
    const org = await Org.findById(ORG_ID);
    
    if (!org) {
      console.log(`❌ Org ${ORG_ID} NOT found in database\n`);
      process.exit(1);
    }

    console.log(`✅ Found org: ${org.name}`);
    console.log(`   ID: ${org._id}`);
    console.log(`   slug: ${org.slug}`);
    console.log(`   createdBy: ${org.createdBy}`);
    console.log(`\n📋 Members in org.members array:`);
    
    if (!org.members || org.members.length === 0) {
      console.log(`   ❌ EMPTY - No members found!\n`);
    } else {
      org.members.forEach((member, i) => {
        const isYou = String(member.userId) === String(USER_ID) ? ' ← THIS IS YOU!' : '';
        console.log(`   ${i + 1}. ${member.userId} (role: ${member.role})${isYou}`);
      });
      console.log();
    }

    // Check membership
    const isMember = org.members && org.members.some(
      m => String(m.userId) === String(USER_ID)
    );

    console.log('🔐 Membership Check:\n');
    if (isMember) {
      console.log(`✅ YES - You are in org.members as ${org.members.find(m => String(m.userId) === String(USER_ID))?.role}`);
    } else {
      console.log(`❌ NO - You are NOT in org.members`);
      console.log(`   This is why you're getting 403!\n`);
      console.log(`   Quick fix - add to members:\n`);
      console.log(`   db.orgs.updateOne(`);
      console.log(`     { _id: ObjectId("${ORG_ID}") },`);
      console.log(`     { \\$push: { members: { userId: ObjectId("${USER_ID}"), role: "ADMIN" } } }`);
      console.log(`   )`);
    }

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected');
  }
}

debug().then(() => process.exit(0)).catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});

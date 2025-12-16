/*
Simple script to inspect an Org and User membership and optionally add the user to the org.
Usage:
  # install dependency once
  npm install mongodb

  # just inspect
  node scripts/org_member_check.js --mongo "<MONGO_URI>" --org 693987b22421d7a147ddfd16 --user 694168c668be8055aa7a8f9a

  # inspect and add user as MEMBER
  node scripts/org_member_check.js --mongo "<MONGO_URI>" --org 693987b22421d7a147ddfd16 --user 694168c668be8055aa7a8f9a --add

Notes:
- The script uses the MongoDB Node driver and will print org.members and user.orgIds.
- It will not change anything unless you pass --add.
*/

const { MongoClient, ObjectId } = require('mongodb');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--mongo') out.mongo = args[++i];
    else if (a === '--org') out.org = args[++i];
    else if (a === '--user') out.user = args[++i];
    else if (a === '--add') out.add = true;
  }
  return out;
}

(async function main(){
  const { mongo, org, user, add } = parseArgs();
  if (!mongo) {
    console.error('Missing --mongo <MONGO_URI>');
    process.exit(2);
  }
  if (!org || !user) {
    console.error('Missing --org or --user');
    process.exit(2);
  }

  const client = new MongoClient(mongo, { useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db();

    const orgColl = db.collection('orgs');
    const usersColl = db.collection('users');

    const orgDoc = await orgColl.findOne({ _id: new ObjectId(org) });
    if (!orgDoc) {
      console.error('Org not found:', org);
      process.exit(1);
    }

    console.log('Org found:');
    console.log('  _id:', String(orgDoc._id));
    console.log('  name:', orgDoc.name);
    console.log('  createdBy:', String(orgDoc.createdBy));
    console.log('  members:');
    (orgDoc.members || []).forEach(m => {
      console.log('   -', String(m.userId), m.role);
    });

    const userDoc = await usersColl.findOne({ _id: new ObjectId(user) });
    if (!userDoc) {
      console.error('User not found:', user);
    } else {
      console.log('\nUser found:');
      console.log('  _id:', String(userDoc._id));
      console.log('  login/name:', userDoc.login || userDoc.name || '(no name)');
      console.log('  orgIds:', (userDoc.orgIds || []).map(x => String(x)).join(', '));
      console.log('  defaultOrgId:', userDoc.defaultOrgId ? String(userDoc.defaultOrgId) : null);
    }

    const isMember = (orgDoc.members || []).some(m => String(m.userId) === String(user));
    console.log('\nIs member of org?', isMember);

    if (!isMember && add) {
      console.log('\nAdding user to org.members as MEMBER and updating user.orgIds...');

      await orgColl.updateOne(
        { _id: new ObjectId(org) },
        { $addToSet: { members: { userId: new ObjectId(user), role: 'MEMBER' } } }
      );

      await usersColl.updateOne(
        { _id: new ObjectId(user) },
        { $addToSet: { orgIds: new ObjectId(org) }, $set: { defaultOrgId: new ObjectId(org) } }
      );

      console.log('Done. Verify by re-running without --add.');
    }

    console.log('\nFinished.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  } finally {
    try { await client.close(); } catch(e){}
  }
})();

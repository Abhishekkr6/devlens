const mongoose = require('mongoose');

const OrgSchema = new mongoose.Schema({});
const Org = mongoose.model('Org', OrgSchema);

async function check() {
  const mongoUri = process.env.MONGO_URI;
  await mongoose.connect(mongoUri, { useUnifiedTopology: true });

  const USER_ID = '69417759f468d9dbfdf5ca17';
  const ORG_ID = '693987b22421d7a147ddfd16';

  const org = await Org.findById(ORG_ID).lean();
  
  console.log(`\n🔍 Checking Org: ${org.name} (${ORG_ID})\n`);
  console.log(`Members count: ${org.members?.length || 0}`);
  
  if (org.members && org.members.length > 0) {
    console.log('\nMembers:');
    org.members.forEach((m, i) => {
      const isYou = String(m.userId) === USER_ID ? ' ← YOU' : '';
      console.log(`  ${i+1}. ${m.userId} (${m.role})${isYou}`);
    });
  }
  
  const isMember = org.members?.some(m => String(m.userId) === USER_ID);
  console.log(`\n${isMember ? '✅ YOU ARE A MEMBER' : '❌ YOU ARE NOT A MEMBER'}\n`);
  
  await mongoose.disconnect();
}

check();

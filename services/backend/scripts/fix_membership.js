const mongoose = require('mongoose');

async function fixMembership() {
  const mongoUri = process.env.MONGO_URI;
  await mongoose.connect(mongoUri, { useUnifiedTopology: true });

  const USER_ID = '69417759f468d9dbfdf5ca17';
  const ORG_ID = '693987b22421d7a147ddfd16';
  
  const OrgSchema = new mongoose.Schema({}, { strict: false });
  const Org = mongoose.model('Org', OrgSchema);
  
  console.log('\n🔧 Adding CORRECT user to org.members...\n');
  
  const result = await Org.updateOne(
    { _id: ORG_ID },
    { 
      $addToSet: { 
        members: { userId: USER_ID, role: 'ADMIN' } 
      } 
    }
  );
  
  console.log('✅ Update result:', result);
  
  // Verify
  const updated = await Org.findById(ORG_ID).lean();
  console.log('\n📋 Updated members:');
  updated.members.forEach((m, i) => {
    const isYou = String(m.userId) === USER_ID ? ' ← YOU' : '';
    console.log(`  ${i+1}. ${m.userId} (${m.role})${isYou}`);
  });
  
  console.log('\n✨ Done!\n');
  await mongoose.disconnect();
}

fixMembership().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

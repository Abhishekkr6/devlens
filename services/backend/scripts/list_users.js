/**
 * List all users in the database
 */

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({});

const User = mongoose.model('User', UserSchema);

async function listUsers() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('ERROR: MONGO_URI env var not set');
    process.exit(1);
  }

  console.log('🔄 Connecting to MongoDB...\n');
  await mongoose.connect(mongoUri, { useUnifiedTopology: true });

  try {
    const users = await User.find({}).limit(10).lean();
    
    console.log(`Found ${users.length} users (showing first 10):\n`);
    users.forEach((user, i) => {
      console.log(`${i + 1}. ID: ${user._id}`);
      console.log(`   login: ${user.login || 'N/A'}`);
      console.log(`   defaultOrgId: ${user.defaultOrgId || 'N/A'}`);
      console.log(`   orgIds: [${user.orgIds?.map(id => id.toString()).join(', ') || 'none'}]`);
      console.log();
    });

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
    process.exit(0);
  }
}

listUsers();

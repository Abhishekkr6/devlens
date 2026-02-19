const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Configuration
const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;

if (!ENCRYPTION_KEY || (ENCRYPTION_KEY.length !== 32 && ENCRYPTION_KEY.length !== 64)) {
    console.error('CRITICAL: ENCRYPTION_KEY is missing or invalid! Must be 32 characters (raw) or 64 characters (hex).');
    process.exit(1);
}

// Encryption Helper (same as service)
const encrypt = (text) => {
    if (!text) return text;
    // If already encrypted, skip
    if (text.includes(':')) return text;

    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const key = ENCRYPTION_KEY.length === 64
            ? Buffer.from(ENCRYPTION_KEY, 'hex')
            : Buffer.from(ENCRYPTION_KEY);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
    } catch (error) {
        console.error('Encryption failed for text:', text);
        return text; // Return original if fail, to avoid data loss
    }
};

// Connect to DB
const mongoUrl = process.env.MONGO_URL;
if (!mongoUrl) {
    console.error("MONGO_URL not set");
    process.exit(1);
}

// Define User Schema (minimal)
const userSchema = new mongoose.Schema({
    githubAccessToken: String,
    githubRefreshToken: String
}, { strict: false });
const User = mongoose.model('User', userSchema);

async function migrate() {
    try {
        await mongoose.connect(mongoUrl);
        console.log("Connected to MongoDB");

        const users = await User.find({});
        console.log(`Found ${users.length} users to check.`);

        let updatedCount = 0;
        for (const user of users) {
            let changed = false;

            if (user.githubAccessToken && !user.githubAccessToken.includes(':')) {
                user.githubAccessToken = encrypt(user.githubAccessToken);
                changed = true;
            }

            if (user.githubRefreshToken && !user.githubRefreshToken.includes(':')) {
                user.githubRefreshToken = encrypt(user.githubRefreshToken);
                changed = true;
            }

            if (changed) {
                await user.save();
                updatedCount++;
                process.stdout.write('.');
            }
        }

        console.log(`\nMigration complete. Encrypted tokens for ${updatedCount} users.`);
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();

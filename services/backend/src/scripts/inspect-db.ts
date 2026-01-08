import "dotenv/config";
import mongoose from "mongoose";

const inspect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL!);
        const db = mongoose.connection.db;

        if (!db) throw new Error("No DB connection");

        // Get one repo to see ALL fields
        const sampleRepo = await db.collection('repos').findOne({});

        if (!sampleRepo) {
            console.log("❌ NO REPOS IN DATABASE!");
            return;
        }

        console.log("\n=== FIELDS IN DATABASE ===");
        console.log(Object.keys(sampleRepo));

        console.log("\n=== SAMPLE REPO (first one) ===");
        for (const [key, value] of Object.entries(sampleRepo)) {
            if (key === '_id') {
                console.log(`${key}: ${value}`);
            } else if (typeof value === 'string') {
                console.log(`${key}: "${value}"`);
            } else {
                console.log(`${key}: ${JSON.stringify(value)}`);
            }
        }

        // Count total repos
        const count = await db.collection('repos').countDocuments();
        console.log(`\n=== TOTAL REPOS: ${count} ===`);

        await mongoose.disconnect();
    } catch (err) {
        console.error("Error:", err);
    }
};

inspect();

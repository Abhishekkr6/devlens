import mongoose from "mongoose";
import "dotenv/config";

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/teampulse";

async function checkIndexes() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB");
        const db = mongoose.connection.db;
        if (!db) throw new Error("No DB");

        const collections = ["repos", "commits", "pullrequests"];

        for (const colName of collections) {
            console.log(`\n--- Indexes for ${colName} ---`);
            try {
                const indexes = await db.collection(colName).indexes();
                indexes.forEach(idx => {
                    console.log(`- ${idx.name}: ${JSON.stringify(idx.key)} (unique: ${idx.unique})`);
                });
            } catch (e) {
                console.log(`Error checking ${colName}:`, e);
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}
checkIndexes();

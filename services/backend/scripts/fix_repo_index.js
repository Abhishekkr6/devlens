const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/teampulse";

const run = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected.");

        const db = mongoose.connection.db;
        const collection = db.collection("repos");

        console.log("Listing current indexes...");
        const indexes = await collection.indexes();
        console.log(indexes);

        const oldIndexName = "providerRepoId_1"; // Default name for { providerRepoId: 1 } unique

        // check if old index exists
        const exists = indexes.find(i => i.name === oldIndexName);

        if (exists) {
            console.log(`Found old index '${oldIndexName}'. Dropping it...`);
            await collection.dropIndex(oldIndexName);
            console.log("Dropped old unique index.");
        } else {
            console.log("Old index not found, skipping drop.");
        }

        console.log("Creating new compound index...");
        // Ensure new index matches the model definition: { providerRepoId: 1, orgId: 1 } unique
        await collection.createIndex({ providerRepoId: 1, orgId: 1 }, { unique: true });
        console.log("Created new compound unique index.");

        console.log("Migration complete.");
        process.exit(0);

    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

run();

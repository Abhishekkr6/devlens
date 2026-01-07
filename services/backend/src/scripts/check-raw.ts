import "dotenv/config";
import mongoose from "mongoose";

const checkRawData = async () => {
    await mongoose.connect(process.env.MONGO_URL!);

    const db = mongoose.connection.db;
    if (!db) {
        throw new Error("Database connection not established");
    }

    const repos = await db.collection('repos').find({}).limit(3).toArray();

    console.log("\n=== RAW DATABASE DATA ===\n");
    repos.forEach((r, i) => {
        console.log(`\nRepo ${i + 1}:`);
        console.log(JSON.stringify(r, null, 2));
    });

    await mongoose.disconnect();
};

checkRawData().catch(console.error);

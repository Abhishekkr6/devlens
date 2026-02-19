
import mongoose from "mongoose";
import dotenv from "dotenv";
import { OrgModel } from "../src/models/org.model";
import { OrgMemberModel } from "../src/models/orgMember.model";

// Load environment variables
dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
    console.error("❌ MONGO_URL not found in environment variables");
    process.exit(1);
}

const migrateMembers = async () => {
    try {
        console.log("🚀 Connecting to MongoDB...");
        await mongoose.connect(MONGO_URL);
        console.log("✅ Connected to MongoDB");

        console.log("🔍 Fetching all organizations...");
        // We need to use 'any' or a relaxed interface because we removed 'members' from the strict TS interface
        // but the data still exists in the DB if not yet overwritten.
        // However, if we already deployed the code that removes it from the schema, Mongoose might not return it
        // unless strict: false or we use lean().
        const orgs = await OrgModel.find({}).lean();

        console.log(`Found ${orgs.length} organizations to check.`);

        let migratedCount = 0;
        let skippedCount = 0;

        for (const org of orgs) {
            const orgId = org._id;
            // Access members from lean document (it might still be there if not overwritten)
            // Note: If the field was removed from Schema, Mongoose might strip it unless we used lean().
            const members = (org as any).members || [];

            if (!Array.isArray(members) || members.length === 0) {
                console.log(`ℹ️ Org ${org.name} (${orgId}) has no embedded members.`);
                skippedCount++;
                continue;
            }

            console.log(`🔄 Migrating ${members.length} members for Org: ${org.name}...`);

            for (const member of members) {
                // Check if exists
                const exists = await OrgMemberModel.findOne({
                    orgId: orgId,
                    userId: member.userId,
                });

                if (!exists) {
                    try {
                        await OrgMemberModel.create({
                            orgId: orgId,
                            userId: member.userId,
                            role: member.role || "MEMBER",
                            status: member.status || "active",
                            invitedBy: member.invitedBy,
                            joinedAt: new Date(),
                        });
                        migratedCount++;
                    } catch (err) {
                        console.error(`❌ Failed to migrate member ${member.userId} for org ${orgId}:`, err);
                    }
                } else {
                    console.log(`  - Member ${member.userId} already exists in new collection. Skipping.`);
                }
            }

            // Optional: We can $unset the members field here to clean up, 
            // but maybe safer to keep it for a bit or let the user decide.
            // For now, let's just migrate.
            // await OrgModel.findByIdAndUpdate(orgId, { $unset: { members: 1 } });
        }

        console.log(`
    🎉 Migration Complete!
    - Organizations checked: ${orgs.length}
    - Members migrated: ${migratedCount}
    - Organizations skipped (no members): ${skippedCount}
    `);

        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
};

migrateMembers();

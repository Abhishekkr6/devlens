import { Request, Response } from "express";

/**
 * 🔍 DEBUG ENDPOINT
 * Shows migration secret info for debugging
 */
export const debugMigrationSecret = async (req: Request, res: Response) => {
    const migrationSecret = process.env.MIGRATION_SECRET || "35051fb10f54799debc5f44e2d8e0716f158b75cb7ce20a69e8cd4f4eeb57c44";
    const providedSecret = req.headers["x-migration-secret"] || req.query.secret;

    return res.status(200).json({
        hasEnvVariable: !!process.env.MIGRATION_SECRET,
        expectedSecretLength: migrationSecret.length,
        expectedSecretStart: migrationSecret.substring(0, 10) + "...",
        expectedSecretEnd: "..." + migrationSecret.substring(migrationSecret.length - 10),
        providedSecret: providedSecret ? String(providedSecret).substring(0, 10) + "..." : "none",
        providedSecretLength: providedSecret ? String(providedSecret).length : 0,
        match: providedSecret === migrationSecret,
        hint: "Use ?secret=YOUR_SECRET in URL",
    });
};

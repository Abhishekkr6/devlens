import { Router } from "express";
import { runMultiOrgMigration } from "../controllers/migration.controller";
import { debugMigrationSecret } from "../controllers/debug.controller";

const router = Router();

/**
 * GET/POST /api/migration/multi-org
 * 
 * Run multi-org database migration
 * Requires X-Migration-Secret header or ?secret=xxx query param
 * 
 * Accepts both GET and POST for convenience (can trigger from browser URL)
 */
router.get("/multi-org", runMultiOrgMigration);
router.post("/multi-org", runMultiOrgMigration);

/**
 * GET /api/migration/debug
 * Debug endpoint to check secret status
 */
router.get("/debug", debugMigrationSecret);

export default router;

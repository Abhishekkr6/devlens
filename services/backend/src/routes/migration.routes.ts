import { Router } from "express";
import { runMultiOrgMigration } from "../controllers/migration.controller";

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

export default router;

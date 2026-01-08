import { Router } from "express";
import { runMultiOrgMigration } from "../controllers/migration.controller";

const router = Router();

/**
 * POST /api/migration/multi-org
 * 
 * Run multi-org database migration
 * Requires X-Migration-Secret header or ?secret=xxx query param
 */
router.post("/multi-org", runMultiOrgMigration);

export default router;

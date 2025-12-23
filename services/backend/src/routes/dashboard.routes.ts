import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller";
import { getCommitTimeline } from "../controllers/activity.controller";
import { getDevelopers } from "../controllers/developer.controller";
import { listPRs } from "../controllers/prList.controller";
import { getAlertSummary } from "../controllers/alertSummary.controller";
import { requireOrgAccess } from "../middlewares/authOrg";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireOrgRole } from "../middlewares/requireOrgRole";

const router = Router();

router.get(
  "/orgs/:orgId/dashboard",
  authMiddleware,
  requireOrgRole(["ADMIN", "MEMBER", "VIEWER"]),
  getDashboardStats
);

router.get(
  "/orgs/:orgId/activity/commits",
  authMiddleware,
  requireOrgRole(["ADMIN", "MEMBER", "VIEWER"]),
  getCommitTimeline
);

router.get(
  "/orgs/:orgId/developers",
  authMiddleware,
  requireOrgRole(["ADMIN", "MEMBER", "VIEWER"]),
  getDevelopers
);

router.get(
  "/orgs/:orgId/prs",
  authMiddleware,
  requireOrgRole(["ADMIN", "MEMBER", "VIEWER"]),
  listPRs
);

export default router;

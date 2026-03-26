import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller";
import { getCommitTimeline, getAllActivities } from "../controllers/activity.controller";
import { getDevelopers, getDeveloperProfile } from "../controllers/developer.controller";
import { listPRs } from "../controllers/prList.controller";
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

router.get(
  "/orgs/:orgId/activities",
  authMiddleware,
  requireOrgRole(["ADMIN", "MEMBER", "VIEWER"]),
  getAllActivities
);

router.get(
  "/orgs/:orgId/developers/:developerId",
  authMiddleware,
  requireOrgRole(["ADMIN", "MEMBER", "VIEWER"]),
  getDeveloperProfile
);

export default router;

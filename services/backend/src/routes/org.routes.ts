import { Router } from "express";
import { createOrg, getUserOrgs } from "../controllers/org.controller";
import { getRepoDetail, getRepos } from "../controllers/repo.controller";
import { connectRepo } from "../controllers/repoConnect.controller";
import { getAlertSummary } from "../controllers/alertSummary.controller";
import { inviteUser } from "../controllers/org.controller";
import { validate } from "../middlewares/validate";
import { createOrgSchema } from "../validators/org.validator";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireOrgAccess } from "../middlewares/authOrg";
import { requireOrgRole } from "../middlewares/requireOrgRole";

const router = Router();

// Org create
router.post("/orgs", authMiddleware, validate(createOrgSchema), createOrg);

// Repo list in org
router.get("/orgs/:orgId/repos", authMiddleware, requireOrgAccess, getRepos);

// Repo detail
router.get("/orgs/:orgId/repos/:repoId", authMiddleware, requireOrgAccess, getRepoDetail);

// Connect repo
router.post(
  "/orgs/:orgId/repos/connect",
  authMiddleware,
  requireOrgRole(["ADMIN"]),
  connectRepo
);

// Org alerts
router.get(
  "/orgs/:orgId/alerts",
  authMiddleware,
  requireOrgRole(["ADMIN", "MEMBER"]),
  getAlertSummary
);

// Invite user to org
router.post(
  "/orgs/:orgId/invite",
  authMiddleware,
  requireOrgRole(["ADMIN"]),
  inviteUser
);

router.get("/orgs", authMiddleware, getUserOrgs);

export default router;

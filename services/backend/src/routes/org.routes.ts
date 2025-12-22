import { Router } from "express";
import { createOrg, getUserOrgs, getOrgMembers, inviteUser, removeMember, updateMemberRole } from "../controllers/org.controller";
import { getRepoDetail, getRepos, deleteRepo } from "../controllers/repo.controller";
import { connectRepo } from "../controllers/repoConnect.controller";
import { getAlertSummary, acknowledgeAlert } from "../controllers/alertSummary.controller";
import { validate } from "../middlewares/validate";
import { createOrgSchema } from "../validators/org.validator";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireOrgRole } from "../middlewares/requireOrgRole";

const router = Router();

// Org create
router.post("/orgs", authMiddleware, validate(createOrgSchema), createOrg);

// Repo list in org
router.get(
  "/orgs/:orgId/repos",
  authMiddleware,
  requireOrgRole(["ADMIN", "MEMBER", "VIEWER"]),
  getRepos
);

// Repo detail
router.get(
  "/orgs/:orgId/repos/:repoId",
  authMiddleware,
  requireOrgRole(["ADMIN", "MEMBER", "VIEWER"]),
  getRepoDetail
);

// Connect repo
router.post(
  "/orgs/:orgId/repos/connect",
  authMiddleware,
  requireOrgRole(["ADMIN"]),
  connectRepo
);

// Delete repo
router.delete(
  "/orgs/:orgId/repos/:repoId",
  authMiddleware,
  requireOrgRole(["ADMIN"]),
  deleteRepo
);

// Org alerts
router.get(
  "/orgs/:orgId/alerts",
  authMiddleware,
  requireOrgRole(["ADMIN", "MEMBER"]),
  getAlertSummary
);

// Acknowledge alert
router.post(
  "/orgs/:orgId/alerts/:alertId/acknowledge",
  authMiddleware,
  requireOrgRole(["ADMIN"]),
  acknowledgeAlert
);

// Invite user to org
router.post(
  "/orgs/:orgId/invite",
  authMiddleware,
  requireOrgRole(["ADMIN"]),
  inviteUser
);

// Update member role
router.patch(
  "/orgs/:orgId/members/:userId",
  authMiddleware,
  requireOrgRole(["ADMIN"]),
  updateMemberRole
);

// Remove member
router.delete(
  "/orgs/:orgId/members/:userId",
  authMiddleware,
  requireOrgRole(["ADMIN"]),
  removeMember
);

router.get("/orgs", authMiddleware, getUserOrgs);

// Get organization members
router.get(
  "/orgs/:orgId/members",
  authMiddleware,
  requireOrgRole(["ADMIN", "MEMBER", "VIEWER"]),
  getOrgMembers
);

export default router;

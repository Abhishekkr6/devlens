
import { Router } from "express";
import {
  createOrg, getUserOrgs, getOrgMembers, inviteUser, removeMember, updateMemberRole,
  deleteOrg,
  acceptInvite,
  rejectInvite,
  leaveOrg,
  getUserGithubRepos,
} from "../controllers/org.controller";
import { getRepoDetail, getRepos, deleteRepo, updateRepoSettings } from "../controllers/repo.controller";
import { connectRepo } from "../controllers/repoConnect.controller";
import { getAlertSummary, acknowledgeAlert } from "../controllers/alertSummary.controller";
import { validate } from "../middlewares/validate";
import { createOrgSchema } from "../validators/org.validator";
import { updateRepoSettingsSchema } from "../validators/repoSettings.validator";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireOrgRole } from "../middlewares/requireOrgRole";
import { enforceRepoLimit } from "../middlewares/requirePro";

const router = Router();

// Org create
router.post("/orgs", authMiddleware, validate(createOrgSchema), createOrg);

// Org delete
router.delete(
  "/orgs/:orgId",
  authMiddleware,
  requireOrgRole(["ADMIN"]),
  deleteOrg
);

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
  enforceRepoLimit,
  connectRepo
);

// Delete repo
router.delete(
  "/orgs/:orgId/repos/:repoId",
  authMiddleware,
  requireOrgRole(["ADMIN"]),
  deleteRepo
);

// Update repo settings
router.patch(
  "/orgs/:orgId/repos/:repoId/settings",
  authMiddleware,
  requireOrgRole(["ADMIN"]),
  validate(updateRepoSettingsSchema),
  updateRepoSettings
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

// Invite Flow
router.post("/orgs/:orgId/invite/accept", authMiddleware, acceptInvite);
router.post("/orgs/:orgId/invite/reject", authMiddleware, rejectInvite);
router.delete("/orgs/:orgId/leave", authMiddleware, leaveOrg);

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

// Get user's GitHub repositories
router.get(
  "/orgs/:orgId/github/repos",
  authMiddleware,
  requireOrgRole(["ADMIN", "MEMBER", "VIEWER"]),
  getUserGithubRepos
);

export default router;


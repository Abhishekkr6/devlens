
import { Router } from "express";
import {
  createOrg, getUserOrgs, getOrgMembers, inviteUser, removeMember, updateMemberRole,
  deleteOrg,
  acceptInvite,
  rejectInvite,
  leaveOrg,
} from "../controllers/org.controller";
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

// Org delete
router.delete(
  "/orgs/:orgSlug",
  authMiddleware,
  requireOrgRole(["ADMIN"]),
  deleteOrg
);

// Repo list in org
router.get(
  "/orgs/:orgSlug/repos",
  authMiddleware,
  requireOrgRole(["ADMIN", "MEMBER", "VIEWER"]),
  getRepos
);

// Repo detail
router.get(
  "/orgs/:orgSlug/repos/:repoId",
  authMiddleware,
  requireOrgRole(["ADMIN", "MEMBER", "VIEWER"]),
  getRepoDetail
);

// Connect repo
router.post(
  "/orgs/:orgSlug/repos/connect",
  authMiddleware,
  requireOrgRole(["ADMIN"]),
  connectRepo
);

// Delete repo
router.delete(
  "/orgs/:orgSlug/repos/:repoId",
  authMiddleware,
  requireOrgRole(["ADMIN"]),
  deleteRepo
);

// Org alerts
router.get(
  "/orgs/:orgSlug/alerts",
  authMiddleware,
  requireOrgRole(["ADMIN", "MEMBER"]),
  getAlertSummary
);

// Acknowledge alert
router.post(
  "/orgs/:orgSlug/alerts/:alertId/acknowledge",
  authMiddleware,
  requireOrgRole(["ADMIN"]),
  acknowledgeAlert
);

// Invite user to org
router.post(
  "/orgs/:orgSlug/invite",
  authMiddleware,
  requireOrgRole(["ADMIN"]),
  inviteUser
);

// Invite Flow
router.post("/orgs/:orgSlug/invite/accept", authMiddleware, acceptInvite);
router.post("/orgs/:orgSlug/invite/reject", authMiddleware, rejectInvite);
router.delete("/orgs/:orgSlug/leave", authMiddleware, leaveOrg);

// Update member role
router.patch(
  "/orgs/:orgSlug/members/:userId",
  authMiddleware,
  requireOrgRole(["ADMIN"]),
  updateMemberRole
);

// Remove member
router.delete(
  "/orgs/:orgSlug/members/:userId",
  authMiddleware,
  requireOrgRole(["ADMIN"]),
  removeMember
);

router.get("/orgs", authMiddleware, getUserOrgs);

// Get organization members
router.get(
  "/orgs/:orgSlug/members",
  authMiddleware,
  requireOrgRole(["ADMIN", "MEMBER", "VIEWER"]),
  getOrgMembers
);

export default router;


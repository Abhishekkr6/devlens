import { OrgModel } from "../models/org.model";
import { OrgMemberModel } from "../models/orgMember.model";
import { UserModel } from "../models/user.model";
import { Types } from "mongoose";
import logger from "../utils/logger";

export const requireOrgRole =
  (allowedRoles: ("ADMIN" | "MEMBER" | "VIEWER")[]) =>
    async (req: any, res: any, next: any) => {
      try {
        const { orgId } = req.params;
        const userId = req.user?.id || req.user?._id;

        if (!userId) {
          return res.status(401).json({ error: "User not found in request" });
        }

        // Support both ID and slug
        let org;
        if (Types.ObjectId.isValid(orgId)) {
          // Try finding by ID first
          org = await OrgModel.findById(orgId);
        }

        // If not found by ID or not a valid ObjectId, try slug
        if (!org) {
          org = await OrgModel.findOne({ slug: orgId });
        }
        if (!org) {
          return res.status(404).json({ error: "Org not found" });
        }

        // Find member in OrgMember collection
        let member = await OrgMemberModel.findOne({
          orgId: org._id,
          userId: userId,
        });

        // 🔥 FIX: If user is not a member but created the org, auto-add them as ADMIN
        if (!member) {
          const isCreator = String(org.createdBy) === String(userId);

          if (isCreator) {
            // User created the org but is not in members - add them as ADMIN
            member = await OrgMemberModel.create({
              orgId: org._id,
              userId: userId,
              role: "ADMIN",
              status: "active",
              joinedAt: new Date(),
            });
            logger.info({ orgId: org._id, userId }, "Auto-added org creator as ADMIN member");
          } else {
            // Check if user has orgId reference in their User model (legacy sync check)
            const userDoc = await UserModel.findById(userId, { orgIds: 1 }).lean();
            const orgIds = Array.isArray(userDoc?.orgIds)
              ? userDoc.orgIds.map(String)
              : [];

            if (orgIds.includes(String(org._id))) {
              // User has orgId reference but not in members - add as MEMBER
              member = await OrgMemberModel.create({
                orgId: org._id,
                userId: userId,
                role: "MEMBER",
                status: "active",
                joinedAt: new Date(),
              });
              logger.info({ orgId: org._id, userId }, "Auto-added user with orgId reference as MEMBER");
            }
          }
        }

        if (!member) {
          logger.warn(
            { orgId: org._id, userId },
            "User not member of org"
          );
          return res.status(403).json({ error: "Not part of this org" });
        }

        if (!allowedRoles.includes(member.role)) {
          logger.warn(
            { orgId: org._id, userId, role: member.role, allowed: allowedRoles },
            "User role not allowed"
          );
          return res.status(403).json({ error: "Insufficient permission" });
        }

        // 🔒 BLOCK PENDING MEMBERS
        if (member.status !== "active") {
          logger.warn({ orgId: org._id, userId, status: member.status }, "User status mismatch (pending)");
          return res.status(403).json({ error: "Membership not active. Please accept the invite first." });
        }

        req.org = org;
        req.orgRole = member.role;
        next();
      } catch (err) {
        logger.error({ err }, "requireOrgRole error");
        return res.status(500).json({ error: "Internal server error" });
      }
    };

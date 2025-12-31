import { OrgModel } from "../models/org.model";
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

        const org = await OrgModel.findById(orgId);
        if (!org) {
          return res.status(404).json({ error: "Org not found" });
        }

        // Safely handle members array
        const members = Array.isArray(org.members) ? org.members : [];

        let member = members.find(
          (m: any) => m && m.userId && String(m.userId) === String(userId)
        );

        // 🔥 FIX: If user is not a member but created the org or has orgId reference, auto-add them
        if (!member) {
          const isCreator = String(org.createdBy) === String(userId);

          if (isCreator) {
            // User created the org but is not in members - add them as ADMIN
            org.members.push({ userId: new Types.ObjectId(String(userId)), role: "ADMIN", status: "active" });
            await org.save();
            member = org.members[org.members.length - 1];
            logger.info({ orgId, userId }, "Auto-added org creator as ADMIN member");
          } else {
            // Check if user has orgId reference
            const userDoc = await UserModel.findById(userId, { orgIds: 1 }).lean();
            const orgIds = Array.isArray(userDoc?.orgIds)
              ? userDoc.orgIds.map(String)
              : [];

            if (orgIds.includes(String(orgId))) {
              // User has orgId reference but not in members - add as MEMBER
              org.members.push({ userId: new Types.ObjectId(String(userId)), role: "MEMBER", status: "active" });
              await org.save();
              member = org.members[org.members.length - 1];
              logger.info({ orgId, userId }, "Auto-added user with orgId reference as MEMBER");
            }
          }
        }

        if (!member) {
          logger.warn(
            { orgId, userId, memberCount: members.length },
            "User not member of org"
          );
          return res.status(403).json({ error: "Not part of this org" });
        }

        if (!allowedRoles.includes(member.role)) {
          logger.warn(
            { orgId, userId, role: member.role, allowed: allowedRoles },
            "User role not allowed"
          );
          return res.status(403).json({ error: "Insufficient permission" });
        }

        req.org = org;
        req.orgRole = member.role;
        next();
      } catch (err) {
        logger.error({ err }, "requireOrgRole error");
        return res.status(500).json({ error: "Internal server error" });
      }
    };

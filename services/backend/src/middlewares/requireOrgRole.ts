import { OrgModel } from "../models/org.model";
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
      
      const member = members.find(
        (m: any) => m && m.userId && String(m.userId) === String(userId)
      );

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

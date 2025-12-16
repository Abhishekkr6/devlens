import { OrgModel } from "../models/org.model";

export const requireOrgRole =
  (allowedRoles: ("ADMIN" | "MEMBER" | "VIEWER")[]) =>
  async (req: any, res: any, next: any) => {
    const { orgId } = req.params;
    const userId = req.user.id;

    const org = await OrgModel.findById(orgId);
    if (!org) {
      return res.status(404).json({ error: "Org not found" });
    }

    const member = org.members.find(
      (m: any) => m.userId.toString() === userId
    );

    if (!member) {
      return res.status(403).json({ error: "Not part of this org" });
    }

    if (!allowedRoles.includes(member.role)) {
      return res.status(403).json({ error: "Insufficient permission" });
    }

    req.org = org;
    req.orgRole = member.role;
    next();
  };

import { Request, Response } from "express";
import logger from "../utils/logger";

import { UserModel } from "../models/user.model";
import { OrgModel } from "../models/org.model";
import { OrgMemberModel } from "../models/orgMember.model";

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId =
      (req as any).userId ||
      (req as any).user?.id ||
      (req as any).user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: "Unauthorized" },
      });
    }

    const user = await UserModel.findOne({ _id: userId, deletedAt: null }).populate("orgIds").lean();

    if (!user) {
      // IMPORTANT:
      // Clear invalid cookies because token is stale / user deleted
      res.clearCookie("DevLens_token", { path: "/" });
      res.clearCookie("token", { path: "/" });

      return res.status(404).json({
        success: false,
        error: { message: "User not found" },
      });
    }

    const defaultOrgId =
      user.defaultOrgId ? String(user.defaultOrgId) : null;

    // Get all org IDs this user belongs to
    const orgIds = Array.isArray(user.orgIds)
      ? user.orgIds.map((o: any) => o._id)
      : [];

    // Fetch all memberships for this user in a single query (OrgMember is a separate collection)
    const memberships = await OrgMemberModel.find({
      userId: user._id,
      orgId: { $in: orgIds },
    }).lean();

    // Build a map: orgId → role so we can look up quickly
    const roleMap = new Map<string, string>();
    for (const m of memberships) {
      roleMap.set(String(m.orgId), m.role);
    }

    const orgs = Array.isArray(user.orgIds)
      ? user.orgIds.map((o: any) => ({
        id: String(o._id),
        name: o.name,
        slug: o.slug,
        role: (roleMap.get(String(o._id)) as "ADMIN" | "MEMBER" | "VIEWER") || "VIEWER",
      }))
      : [];

    return res.json({
      success: true,
      data: {
        user: {
          id: String(user._id),
          login: user.login || "",
          name: user.name || "",
          email: user.email || "",
          avatarUrl: user.avatarUrl || "",
          githubId: user.githubId,
          role: user.role,
          plan: user.plan,
        },
        defaultOrgId,
        orgs,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { message: "Failed to fetch user" },
    });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 1️⃣ Check for Owned Orgs with other members
    // We need to find orgs where this user is the CREATOR (owner)
    // and check if those orgs have OTHER members.
    const ownedOrgs = await OrgModel.find({ createdBy: userId });

    for (const org of ownedOrgs) {
      const memberCount = await OrgMemberModel.countDocuments({ orgId: org._id });
      if (memberCount > 1) {
        return res.status(400).json({
          success: false,
          error: {
            message: `Cannot delete account. You are the owner of ${org.name} which has other members. Please transfer ownership or remove members first.`
          }
        });
      }
    }

    // 2️⃣ Soft Delete User
    user.deletedAt = new Date();
    // Optional: Scramble PII if desired, but for soft delete usually we just mark flag.
    // user.email = `deleted_${user._id}@deleted.com`; 
    // user.githubAccessToken = ""; 
    await user.save();

    // 3️⃣ Cleanup
    // - Remove from all orgs as member
    // - If they were the only member of an owned org, that org is effectively abandoned/archived.
    //   We can choose to soft-delete the orgs too, or just leave them.
    //   Let's remove their membership entries to keep OrgMember clean.
    await OrgMemberModel.deleteMany({ userId });

    // - Clear cookies
    res.clearCookie("DevLens_token", { path: "/" });
    res.clearCookie("token", { path: "/" });

    return res.json({
      success: true,
      message: "Account deleted successfully"
    });

  } catch (error) {
    logger.error({ error: error }, "DELETE ACCOUNT ERROR:");
    return res.status(500).json({
      success: false,
      error: { message: "Failed to delete account" }
    });
  }
};

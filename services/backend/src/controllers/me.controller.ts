import { Request, Response } from "express";
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
      res.clearCookie("teampulse_token", { path: "/" });
      res.clearCookie("token", { path: "/" });

      return res.status(404).json({
        success: false,
        error: { message: "User not found" },
      });
    }

    const defaultOrgId =
      user.defaultOrgId ? String(user.defaultOrgId) : null;

    const orgs = Array.isArray(user.orgIds)
      ? user.orgIds.map((o: any) => {
        // Find user's role in this org
        const member = Array.isArray(o.members)
          ? o.members.find(
            (m: any) => String(m.userId) === String(user._id)
          )
          : null;

        return {
          id: String(o._id),
          name: o.name,
          role: member?.role || "VIEWER", // Fallback
        };
      })
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
    res.clearCookie("teampulse_token", { path: "/" });
    res.clearCookie("token", { path: "/" });

    return res.json({
      success: true,
      message: "Account deleted successfully"
    });

  } catch (error) {
    console.error("DELETE ACCOUNT ERROR:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to delete account" }
    });
  }
};

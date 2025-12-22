import { Request, Response } from "express";
import { UserModel } from "../models/user.model";

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

    const user = await UserModel.findById(userId).populate("orgIds").lean();

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

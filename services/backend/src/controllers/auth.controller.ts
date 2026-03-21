import { Request, Response } from "express";
import { Types } from "mongoose";
import {
  exchangeCodeForToken,
  getGithubUser,
  getGithubEmail,
} from "../services/github.service";
import { UserModel } from "../models/user.model";
import { OrgModel } from "../models/org.model";
import { createToken } from "../services/jwt.service";
import logger from "../utils/logger";
import { RepoModel } from "../models/repo.model";
import { CommitModel } from "../models/commit.model";
import { OrgMemberModel } from "../models/orgMember.model";
import { PRModel } from "../models/pr.model";
import { AlertModel } from "../models/alert.model";
import { encrypt } from "../services/encryption.service";

/**
 * Redirect user to GitHub OAuth page
 */
export const githubLogin = async (req: Request, res: Response) => {
  const clientId = process.env.GITHUB_CLIENT_ID;

  const frontend = (
    process.env.FRONTEND_URL || "https://devvlens.vercel.app"
  ).replace(/\/$/, "");

  const redirectUri = `${frontend}/auth/github/callback`;

  const redirect =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=user:email,admin:repo_hook`;

  return res.redirect(redirect);
};

/**
 * GitHub OAuth callback:
 * - exchange code for access token
 * - fetch GitHub profile + primary email
 * - upsert user by githubId (no duplicates)
 * - ensure a valid default org exists and is stored as ObjectId
 * - issue httpOnly cookie(s) with JWT
 */
export const githubCallback = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    if (!code) {
      logger.warn({ query: req.query }, "Missing OAuth code in callback");
      return res
        .status(400)
        .json({ success: false, error: { message: "Missing OAuth code" } });
    }

    const accessToken = await exchangeCodeForToken(code);
    const ghUser = await getGithubUser(accessToken);
    const email = await getGithubEmail(accessToken);

    // Find user by githubId (unique canonical identity)
    // If multiple records somehow exist, pick the first and consolidate later with a migration script.
    let user = await UserModel.findOne({ githubId: ghUser.id });

    if (!user) {
      user = await UserModel.create({
        githubId: ghUser.id,
        login: ghUser.login,
        name: ghUser.name ?? ghUser.login,
        avatarUrl: ghUser.avatar_url,
        email,
        role: "dev",
        githubAccessToken: encrypt(accessToken),
        orgIds: [],
        plan: "pro",
        subscriptionStatus: "active",
        subscriptionExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    } else {
      // Update latest profile + token
      user.githubAccessToken = encrypt(accessToken);
      user.login = ghUser.login ?? user.login;
      user.name = ghUser.name ?? user.name;
      user.avatarUrl = ghUser.avatar_url ?? user.avatarUrl;
      user.email = email ?? user.email;
      // Reactivate if soft deleted
      if (user.deletedAt) {
        user.deletedAt = null;
      }
      // Normalize orgIds array to ObjectIds on-the-fly if needed
      if (!Array.isArray(user.orgIds)) user.orgIds = [];
      await user.save();
    }

    // Create application JWT (payload minimal: user id as string)
    const token = createToken({ id: String(user._id) });

    // Clear any stale/old cookies first to avoid conflicts (best-effort)
    try {
      res.clearCookie("DevLens_token", { path: "/" });
      res.clearCookie("token", { path: "/" });
    } catch {
      /* ignore */
    }

    // Set httpOnly cookie; secure in production, choose sameSite based on deployment
    const isProd = String(process.env.NODE_ENV).toLowerCase() === "production";
    const sameSite = isProd ? "none" : "lax";

    // Primary cookie
    res.cookie("DevLens_token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: sameSite as any,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // Fallback/compat cookie name for older clients expecting 'token'
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: sameSite as any,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // Redirect to frontend without leaking token in URL
    if (!process.env.FRONTEND_URL) {
      logger.warn("FRONTEND_URL is not set; responding with JSON");
      return res.json({ success: true });
    }
    const frontend = process.env.FRONTEND_URL.replace(/\/$/, "");
    return res.redirect(`${frontend}/auth/callback`);
  } catch (err) {
    logger.error({ err }, "GitHub OAuth callback failed");
    const message = (err as any)?.message || "OAuth callback failed";
    return res.status(500).json({ success: false, error: { message } });
  }
};

/**
 * Standard logout: clear cookies without deleting account
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const isProd = String(process.env.NODE_ENV).toLowerCase() === "production";
    const sameSite = isProd ? "none" : "lax";

    res.clearCookie("DevLens_token", {
      path: "/",
      secure: isProd,
      sameSite: sameSite as any,
    });
    res.clearCookie("token", {
      path: "/",
      secure: isProd,
      sameSite: sameSite as any,
    });

    return res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, error: { message: "Logout failed" } });
  }
};

/**
 * Delete user and cleanup all related data...
 */
/**
 * Delete user (Soft Delete)
 */
export const logoutAndDelete = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, error: { message: "Unauthorized" } });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: { message: "User not found" } });
    }

    // Safety check: Prevent deleting account if they own an org with other members
    const ownedOrgs = await OrgModel.find({ createdBy: userId });
    for (const org of ownedOrgs) {
      const memberCount = await OrgMemberModel.countDocuments({ orgId: org._id });
      if (memberCount > 1) {
        return res.status(400).json({
          success: false,
          error: {
            message: `Cannot delete account. Owner of ${org.name} with other members. Transfer ownership first.`
          }
        });
      }
    }

    // Soft delete user
    user.deletedAt = new Date();
    await user.save();

    // Cleanup: Remove from orgs and clear session
    await OrgMemberModel.deleteMany({ userId });

    const isProd = String(process.env.NODE_ENV).toLowerCase() === "production";
    const sameSite = isProd ? "none" : "lax";

    res.clearCookie("DevLens_token", { path: "/" });
    res.clearCookie("token", { path: "/" });

    return res.json({ success: true, message: "Account deleted (soft)" });
  } catch (error) {
    logger.error({ error }, "Delete account failed");
    return res.status(500).json({ success: false, error: { message: "Delete failed" } });
  }
};

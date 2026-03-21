import { Request, Response, NextFunction } from "express";
import { UserModel } from "../models/user.model";
import { RepoModel } from "../models/repo.model";
import { checkUserSubscription } from "../services/subscription.service";

export const enforceRepoLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const orgId = req.params.orgId;

    if (!userId) {
       return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
       return res.status(404).json({ success: false, error: "User not found" });
    }

    // Check actual subscription status via service
    const isPro = await checkUserSubscription(user);

    if (!isPro) {
      // Free plan: maximum of 1 repository in this organization
      const repoCount = await RepoModel.countDocuments({ orgId });
      if (repoCount >= 1) {
        return res.status(403).json({ 
          success: false, 
          error: "Free plan limit reached. You can only add 1 repository per organization. Please upgrade to Pro." 
        });
      }
    }

    next();
  } catch (error) {
    return res.status(500).json({ success: false, error: "Error checking limits" });
  }
};

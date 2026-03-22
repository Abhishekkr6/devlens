import { IUser, UserModel } from "../models/user.model";
import logger from "../utils/logger";

/**
 * Checks if a user's subscription is active.
 * If expired, downgrades the user to "free" plan.
 * Returns true if the user is "pro" and active, false otherwise.
 */
export const checkUserSubscription = async (user: IUser | null): Promise<boolean> => {
  if (!user) return false;

  if (user.plan === "free") {
    return false;
  }

  const now = new Date();
  const expiry = user.subscriptionExpiry;

  if (user.plan === "pro") {
    if (expiry && now > expiry) {
      try {
        await UserModel.findByIdAndUpdate(user._id || user.id, {
          plan: "free",
          subscriptionStatus: "expired",
        });
        logger.info({ userId: user._id || user.id }, "User subscription expired and downgraded to free plan.");
        return false;
      } catch (err) {
        logger.error({ err, userId: user._id || user.id }, "Failed to update expired user subscription");
        return false;
      }
    }
    
    // Pro and active (lifetime if expiry is null)
    return true;
  }

  return false;
};

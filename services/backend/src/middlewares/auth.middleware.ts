import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/jwt.service";
import { JwtPayload } from "jsonwebtoken";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const header = req.headers.authorization;

    // 🔥 Accept token from any valid source
    let token: string | undefined =
      header?.startsWith("Bearer ") ? header.split(" ")[1] : undefined;

    // 🔥 Check both cookie names
    if (!token) token = (req as any).cookies?.DevLens_token;
    if (!token) token = (req as any).cookies?.token;

    // Token missing → unauthorized
    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: { message: "No token provided" } });
    }

    const decoded = verifyToken(token);

    // If token decode returns string → invalid
    if (!decoded || typeof decoded === "string") {
      return res
        .status(401)
        .json({ success: false, error: { message: "Invalid or expired token" } });
    }

    const payload = decoded as JwtPayload & {
      id?: string;
      _id?: string;
      sub?: string;
      userId?: string;
    };

    // 🔥 Map correct userId from ANY of these (max compatibility)
    (req as any).userId =
      payload.id || payload._id || payload.userId || payload.sub;

    if (!(req as any).userId) {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid token payload" },
      });
    }

    // Optional: Attach full payload
    (req as any).user = payload;

    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, error: { message: "Invalid or expired token" } });
  }
};

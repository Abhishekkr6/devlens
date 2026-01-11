import { Request, Response } from "express";
import mongoose from "mongoose";

export const healthCheck = async (req: Request, res: Response) => {
  try {
    const dbOk = mongoose.connection.readyState === 1;

    return res.status(dbOk ? 200 : 500).json({
      success: dbOk,
      data: {
        db: dbOk ? "up" : "down",
        status: dbOk ? "healthy" : "unhealthy",
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: { db: "unknown", status: "error" },
    });
  }
};

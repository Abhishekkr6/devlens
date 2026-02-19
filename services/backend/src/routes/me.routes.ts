import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { getMe, deleteAccount } from "../controllers/me.controller";

const router = Router();

router.get("/me", authMiddleware, getMe);
router.delete("/me", authMiddleware, deleteAccount);

export default router;

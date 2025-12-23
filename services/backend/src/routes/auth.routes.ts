import { Router } from "express";
import { githubLogin, githubCallback, logout, logoutAndDelete } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/github/login", githubLogin);
router.get("/github/callback", githubCallback);
router.post("/logout", authMiddleware, logout);
router.delete("/logout", authMiddleware, logoutAndDelete);

export default router;

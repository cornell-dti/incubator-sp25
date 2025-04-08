import { Router } from "express";
import { authController } from "./auth.controller";
import { authMiddleware } from "../middleware/authenticate";

const router = Router();

// Public routes
router.post("/verify-token", authController.verifyToken);

// Protected routes - require valid token
router.get("/me", authMiddleware, authController.getCurrentUser);

export default router;

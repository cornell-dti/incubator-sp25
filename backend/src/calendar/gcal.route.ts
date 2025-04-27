import { authMiddleware } from "../middleware/authenticate";
import { gCalController } from "./gcal.controller";
import { Router } from "express";

const router = Router();

// Public routes
router.post("/add-exam", authMiddleware, gCalController.createExamEvent);
router.post(
  "/add-deliverable",
  authMiddleware,
  gCalController.createFinalDeliverableTask
);
router.post("/add-task", authMiddleware, gCalController.createTask);

export default router;

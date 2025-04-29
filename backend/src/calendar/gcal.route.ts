import { authMiddleware } from "../middleware/authenticate";
import { gCalController } from "./gcal.controller";
import { Router } from "express";

const router = Router();

// Public routes
router.get("/link", authMiddleware, gCalController.getCalendarLink);
router.post(
  "/course/:courseId",
  authMiddleware,
  gCalController.addCourseToCalendar
);
router.post(
  "/courses/all",
  authMiddleware,
  gCalController.addAllCoursesToCalendar
);
router.delete("/", authMiddleware, gCalController.clearCalendarEvents);

export default router;

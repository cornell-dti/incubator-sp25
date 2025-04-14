import { Router } from "express";
import { examController } from "./exam.controller";
import { authMiddleware } from "../middleware/authenticate";

const router = Router();

router.get("/", examController.getAllExams);
router.post("/", authMiddleware, examController.createExam);
router.put("/:id", authMiddleware, examController.updateExam);
router.delete("/:id", authMiddleware, examController.deleteExam);
router.get("/course/:courseId", examController.getExamsByCourseId);

export default router;

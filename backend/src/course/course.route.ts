import { Router } from "express";
import { courseController } from "./course.controller";

const router = Router();

router.get("/", courseController.getAllCourses);
router.get("/:code", courseController.getCourseByCode);
router.post("/", courseController.createCourse);
router.put("/:id", courseController.updateCourse);
router.delete("/:id", courseController.deleteCourse);

export default router;

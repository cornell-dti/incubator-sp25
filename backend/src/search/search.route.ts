import { Router } from "express";
import { searchController } from "./search.controller";

const router = Router();

router.get("/:query", searchController.getCourseSearch);
router.get(
  "/instructor/:courseCode/:query",
  searchController.getInstructorSearch
);

export default router;

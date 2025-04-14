import { Router } from "express";
import { searchController } from "./search.controller";

const router = Router();

router.get("/:query", searchController.getCourseSearch);

export default router;

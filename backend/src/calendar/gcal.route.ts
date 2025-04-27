import { google } from "googleapis";
import { gCalController } from "./gcal.controller";
import { Router } from "express";

const router = Router();

// Public routes
router.post("/add-exam", gCalController.createExamEvent);

export default router;

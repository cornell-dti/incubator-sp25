import { Router } from "express";
import { eventController } from "./event.controller";
import authMiddleware from "../middleware/authenticate";

const router = Router();

router.get("/", eventController.getAllEvents);
router.post("/", authMiddleware, eventController.createEvent);
router.put("/:id", authMiddleware, eventController.updateEvent);
router.delete("/:id", authMiddleware, eventController.deleteEvent);

export default router;

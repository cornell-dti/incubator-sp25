import { Router } from "express";
import { eventController } from "./event.controller";

const router = Router();

router.get("/", eventController.getAllEvents);
router.post("/", eventController.createEvent);
router.put("/:id", eventController.updateEvent);
router.delete("/:id", eventController.deleteEvent);

export default router;

import { Router } from "express";
import { finalDeliverableController } from "./finalDeliverable.controller";
import { authMiddleware } from "../middleware/authenticate";

const router = Router();

router.get("/", finalDeliverableController.getAllDeliverables);
router.post("/", authMiddleware, finalDeliverableController.createDeliverable);
router.put(
  "/:id",
  authMiddleware,
  finalDeliverableController.updateDeliverable
);
router.delete(
  "/:id",
  authMiddleware,
  finalDeliverableController.deleteDeliverable
);

export default router;

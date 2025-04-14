import { Router } from "express";
import { userController } from "./user.controller";
import { authMiddleware } from "../middleware/authenticate";

const router = Router();

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.post(
  "/add-course/:courseCode",
  authMiddleware,
  userController.addCourse
);

export default router;

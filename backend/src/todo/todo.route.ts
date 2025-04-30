import { Router } from "express";
import { todoController } from "./todo.controller";
import { authMiddleware } from "../middleware/authenticate";

const router = Router();

router.get("/", todoController.getAllTodos);
router.post("/", authMiddleware, todoController.createTodo);
router.put("/:id", authMiddleware, todoController.updateTodo);
router.delete("/:id", authMiddleware, todoController.deleteTodo);
router.get("/user", authMiddleware, todoController.getTodoByUserId);
router.delete(
  "/course/:id",
  authMiddleware,
  todoController.deleteTodoByUserIdCourse
);

export default router;

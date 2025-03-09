import { db } from "../config/firebase";
import { Todo } from "./todo.type";
import { TodoRequestHandlers } from "../requestTypes";

export const todoController: TodoRequestHandlers = {
  getAllTodos: async (req, res) => {
    try {
      const snapshot = await db.collection("todos").get();
      const todos: Todo[] = [];

      snapshot.forEach((doc) => {
        todos.push({
          id: doc.id,
          ...(doc.data() as Todo),
        });
      });

      res.status(200).json(todos);
    } catch (error) {
      console.error("Error getting todos:", error);
      res.status(500).json({ error: "Failed to retrieve todos" });
    }
  },
  createTodo: async (req, res) => {
    try {
      const todoData: Todo = req.body;

      if (
        !todoData.title ||
        !todoData.date ||
        !todoData.eventType ||
        !todoData.priority ||
        !todoData.userId ||
        !todoData.courseId
      ) {
        return res.status(400).json({
          error: "Missing required fields. All todo properties are required.",
        });
      }

      const docRef = await db.collection("todos").add(todoData);

      res.status(201).json({
        id: docRef.id,
        ...todoData,
      });
    } catch (error) {
      console.error("Error creating todo:", error);
      res.status(500).json({ error: "Failed to create todo" });
    }
  },
  updateTodo: async (req, res) => {
    try {
      const todoId = req.params.id;
      const todoData = req.body;

      const todoRef = db.collection("todos").doc(todoId);
      const todoDoc = await todoRef.get();

      if (!todoDoc.exists) {
        return res.status(404).json({ error: "Todo not found" });
      }

      await todoRef.update(todoData);

      res.status(200).json({
        id: todoId,
        ...todoData,
      });
    } catch (error) {
      console.error("Error updating todo:", error);
      res.status(500).json({ error: "Failed to update todo" });
    }
  },
  deleteTodo: async (req, res) => {
    try {
      const todoId = req.params.id;

      const docRef = db.collection("todos").doc(todoId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ message: "Todo not found" });
      }

      await docRef.delete();

      return res.status(200).json({ message: "Todo deleted successfully" });
    } catch (error) {
      console.error("Error deleting todo:", error);
      return res.status(500).json({ message: "Failed to delete todo", error });
    }
  },
};

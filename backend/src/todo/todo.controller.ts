import { todo } from "node:test";
import { db } from "../config/firebase";
import { Todo } from "../types";
import { TodoRequestHandlers } from "../types/requests";

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
        !todoData.courseCode ||
        !todoData.priority
      ) {
        return res.status(400).json({
          error: "Missing required fields. All todo properties are required.",
        });
      }

      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      todoData.userId = userId;

      // clean the courseCode
      const cleanedCourseCode = todoData.courseCode
        .replace(/([a-zA-Z])(\d)/g, "$1 $2")
        .toUpperCase();
      todoData.courseCode = cleanedCourseCode;

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

      const docData = todoDoc.data();

      if (!docData) {
        return res.status(404).json({ message: "Todo not found" });
      }

      if (docData.userId !== req.user?.uid) {
        return res.status(403).json({ message: "Unauthorized" });
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

      const todoRef = db.collection("todos").doc(todoId);
      const todoDoc = await todoRef.get();

      const docData = todoDoc.data();

      if (!docData) {
        return res.status(404).json({ message: "Todo not found" });
      }

      if (docData.userId !== req.user?.uid) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      await todoRef.delete();

      return res.status(200).json({ message: "Todo deleted successfully" });
    } catch (error) {
      console.error("Error deleting todo:", error);
      return res.status(500).json({ message: "Failed to delete todo", error });
    }
  },
  getTodoByUserId: async (req, res) => {
    try {
      const userId = req.user?.uid;

      const snapshot = await db
        .collection("todos")
        .where("userId", "==", userId)
        .get();

      const todos: Todo[] = [];

      snapshot.forEach((doc) => {
        todos.push({
          id: doc.id,
          ...(doc.data() as Todo),
        });
      });

      res.status(200).json(todos);
    } catch (error) {
      console.error("Error getting todos by user ID:", error);
      res.status(500).json({ error: "Failed to retrieve todos" });
    }
  },
};

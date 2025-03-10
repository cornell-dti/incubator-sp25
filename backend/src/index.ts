import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import userRoutes from "./user/user.route";
import syllabusRoutes from "./syllabus/syllabus.route";
import eventRoutes from "./event/event.route";
import todoRoutes from "./todo/todo.route";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server with Firebase Firestore");
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/syllabi", syllabusRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/todos", todoRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

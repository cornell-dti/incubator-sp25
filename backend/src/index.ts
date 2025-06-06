import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import userRoutes from "./user/user.route";
import syllabusRoutes from "./syllabus/syllabus.route";
import courseRoutes from "./course/course.route";
import authRoutes from "./auth/auth.route";
import searchRoutes from "./search/search.route";
import todoRoutes from "./todo/todo.route";
import examRoutes from "./exam/exam.route";
import deliverableRoutes from "./finalDeliverable/finalDeliverable.route";
import calendarRoutes from "./calendar/gcal.route";
import cors from "cors";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:8080",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server with Firebase Firestore");
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/syllabi", syllabusRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/deliverables", deliverableRoutes);
app.use("/api/calendar", calendarRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

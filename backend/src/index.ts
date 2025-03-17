import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import userRoutes from "./user/user.route";
import syllabusRoutes from "./syllabus/syllabus.route";
import courseRoutes from "./course/course.route";

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
app.use("/api/courses", courseRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

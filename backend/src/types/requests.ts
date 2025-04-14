import { Request, Response, NextFunction } from "express";
import { User, Course, Syllabus, Exam, Todo, FinalDeliverable } from "./models";
import { AuthRequest } from "../middleware/authenticate";

export interface RequestHandler<P = {}, B = {}, Q = {}> {
  (
    req: AuthRequest & Request<P, any, B, Q>,
    res: Response,
    next?: NextFunction
  ): Promise<any> | any;
}

export interface UserRequestHandlers {
  getAllUsers: RequestHandler;
  getUserById: RequestHandler<{ id: string }>;
  createUser: RequestHandler<{}, User>;
  updateUser: RequestHandler<{ id: string }, Partial<User>>;
  deleteUser: RequestHandler<{ id: string }>;
  addCourse: RequestHandler<{ courseId: string }>;
}

export interface CourseRequestHandlers {
  getAllCourses: RequestHandler;
  getCourseByCode: RequestHandler<{ code: string }>;
  createCourse: RequestHandler<{}, Course>;
  updateCourse: RequestHandler<{ id: string }, Partial<Course>>;
  deleteCourse: RequestHandler<{ id: string }>;
}

export interface SyllabusRequestHandlers {
  uploadSyllabus: RequestHandler<{}, Syllabus>;
  getSyllabusById: RequestHandler<{ id: string }>;
  updateSyllabusById: RequestHandler<{ id: string }, Partial<Syllabus>>;
  deleteSyllabusById: RequestHandler<{ id: string }>;
  getParsedText: RequestHandler;
}

export interface ExamRequestHandlers {
  getAllExams: RequestHandler;
  createExam: RequestHandler<{}, Exam>;
  updateExam: RequestHandler<{ id: string }, Partial<Exam>>;
  deleteExam: RequestHandler<{ id: string }>;
  getExamsByCourseId: RequestHandler<{ courseId: string }>;
}

export interface FinalDeliverableRequestHandlers {
  getAllDeliverables: RequestHandler;
  createDeliverable: RequestHandler<{}, FinalDeliverable>;
  updateDeliverable: RequestHandler<{ id: string }, Partial<FinalDeliverable>>;
  deleteDeliverable: RequestHandler<{ id: string }>;
}

export interface TodoRequestHandlers {
  getAllTodos: RequestHandler;
  createTodo: RequestHandler<{}, Todo>;
  updateTodo: RequestHandler<{ id: string }, Partial<Todo>>;
  deleteTodo: RequestHandler<{ id: string }>;
  getTodoByUserId: RequestHandler;
}

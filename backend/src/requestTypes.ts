import { Request, Response, NextFunction } from "express";
import { User } from "./user/user.type";
import { Course } from "./course/course.type";

export interface RequestHandler<P = {}, B = {}, Q = {}> {
  (req: Request<P, any, B, Q>, res: Response, next?: NextFunction):
    | Promise<any>
    | any;
}

export interface UserRequestHandlers {
  getAllUsers: RequestHandler;
  getUserById: RequestHandler<{ id: string }>;
  createUser: RequestHandler<{}, User>;
  updateUser: RequestHandler<{ id: string }, Partial<User>>;
  deleteUser: RequestHandler<{ id: string }>;
}

export interface SyllabusRequestHandlers {
  uploadSyllabus: RequestHandler<{}, Course>;
  getSyllabiByUserId: RequestHandler<{ id: string }>;
  updateSyllabusById: RequestHandler<{ id: string }>;
  deleteSyllabusById: RequestHandler<{ id: string }>;
}
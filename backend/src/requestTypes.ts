import { Request, Response, NextFunction } from "express";
import { User } from "./user/user.type";
import { Course } from "./course/course.type";
import { Syllabus } from "./syllabus/syllabus.type";
import { Event } from "./event/event.type";
import { Todo } from "./todo/todo.type";

export interface RequestHandler<P = {}, B = {}, Q = {}> {
  (
    req: Request<P, any, B, Q>,
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
}

export interface CourseRequestHandlers {
  getAllCourses: RequestHandler;
  getCourseById: RequestHandler<{ id: string }>;
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

export interface EventRequestHandlers {
  getAllEvents: RequestHandler;
  createEvent: RequestHandler<{}, Event>;
  updateEvent: RequestHandler<{ id: string }, Partial<Event>>;
  deleteEvent: RequestHandler<{ id: string }>;
}

export interface TodoRequestHandlers {
  getAllTodos: RequestHandler;
  createTodo: RequestHandler<{}, Todo>;
  updateTodo: RequestHandler<{ id: string }, Partial<Todo>>;
  deleteTodo: RequestHandler<{ id: string }>;
}

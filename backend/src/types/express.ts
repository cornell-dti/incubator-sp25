import { Request, Response, NextFunction } from "express";
import { User } from "../models/user";

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

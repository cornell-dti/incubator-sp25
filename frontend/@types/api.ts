import { User, Course } from "./models";

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

export interface TokenVerificationRequest {
  idToken: string;
}

export interface TokenVerificationResponse extends ApiResponse<User> {
  id: string;
  isNewUser: boolean;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  courses?: string[];
}

export interface UpdateUserRequest {
  name?: string;
  courses?: string[];
}

export type GetUserResponse = ApiResponse<User>;
export type CreateUserResponse = ApiResponse<User>;
export type UpdateUserResponse = ApiResponse<User>;

export type GetCourseResponse = ApiResponse<Course>;
export type GetCoursesResponse = ApiResponse<Course[]>;

import { Timestamp } from "firebase-admin/firestore";
import { Course } from "../course/course.type";

export interface User {
  id?: string;
  email: string;
  name: string;
  courses: Course[];

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

import { Timestamp } from "firebase-admin/firestore";

export interface User {
  id?: string;
  email: string;
  name: string;
  courses: Course[];

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Course {
  id?: string;
  courseCode: string;
  courseName: string;
  instructors: string[];
  syllabi: Syllabus[];
}

export interface Event {
  id?: string;
  courseId: string;
  // userId: string;
  title: string;
  startTime: Timestamp;
  endTime: Timestamp;
  eventType: string;
  // weight: number;
}

export interface Syllabus {
  id?: string;
  courseId: string;
  semester: string;
  instructor: string;
  syllabusUploadPath: string;
  events: string[];
  todos: string[];
  // gradingPolicy: Map<string, number>;
}

export interface Todo {
  id?: string;
  userId: string;
  courseId: string;
  title: string;
  date: Timestamp;
  eventType: string;
  priority: string;
}

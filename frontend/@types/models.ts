import { FirestoreTimestamp } from "./firebase";

export interface User {
  id?: string;
  email: string;
  name: string;
  courses: Course[];

  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
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
  startTime: FirestoreTimestamp;
  endTime: FirestoreTimestamp;
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
  date: FirestoreTimestamp;
  eventType: string;
  priority: string;
}

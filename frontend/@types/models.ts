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
  semester: string;
  sections: {
    sectionId: string;
    instructor: string;
  }[];
  // syllabi: Syllabus[];
}

export interface Exam {
  id?: string;
  courseId: string;
  sectionId: string;
  title: string;
  startTime: FirestoreTimestamp;
  endTime: FirestoreTimestamp;
  examType: string;
}

export interface FinalDeliverable {
  id?: string;
  courseId: string;
  sectionId: string;
  title: string;
  dueDate: FirestoreTimestamp;
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
  courseCode: string;
  title: string;
  date: FirestoreTimestamp;
  eventType: string;
  priority: string;
}

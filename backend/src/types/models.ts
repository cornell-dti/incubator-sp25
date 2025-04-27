import { Timestamp } from "firebase-admin/firestore";

export interface User {
  id?: string;
  email: string;
  name: string;
  courses: Course[];
  calendarLink: string;
  taskListId: string;

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Subject {
  id?: string;
  subjectCode: string;
  subjectName: string;
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
  startTime: Timestamp;
  endTime: Timestamp;
  examType: string;
}

export interface FinalDeliverable {
  id?: string;
  courseId: string;
  sectionId: string;
  title: string;
  dueDate: Timestamp;
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
  date: Timestamp;
  eventType: string;
  priority: number;
}

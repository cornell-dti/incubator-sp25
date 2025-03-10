import { Timestamp } from "firebase-admin/firestore";

export interface Syllabus {
  id?: string;
  courseId: string;
  semester: string;
  // instructor: string;
  syllabusUploadPath: string;
  // events: Event[];
  // todos: Todo[];
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

export interface Event {
  id?: string;
  courseId: string;
  userId: string;
  title: string;
  startTime: Timestamp;
  endTime: Timestamp;
  eventType: string;
  weight: number;
}

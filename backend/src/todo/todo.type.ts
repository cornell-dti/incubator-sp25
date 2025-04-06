import { Timestamp } from "firebase-admin/firestore";

export interface Todo {
  id?: string;
  courseId: string;
  title: string;
  date: Timestamp;
  eventType: string;
  priority: string;
}

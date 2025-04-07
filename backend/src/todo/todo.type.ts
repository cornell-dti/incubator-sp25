import { Timestamp } from "firebase-admin/firestore";

export interface Todo {
  id?: string;
  syllabusId: string;
  title: string;
  date: Timestamp;
  eventType: string;
  priority: string;
}

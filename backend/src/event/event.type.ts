import { Timestamp } from "firebase-admin/firestore";

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

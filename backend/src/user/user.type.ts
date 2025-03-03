import { Timestamp } from "firebase-admin/firestore";

export interface User {
  id?: string;
  email: string;
  name: string;

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

import { Timestamp } from "firebase-admin/firestore";

export function convertTimestamps(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;

  // If it's a Firestore Timestamp, convert to ISO string
  if (obj instanceof Timestamp) {
    return obj.toDate().toISOString();
  }

  // If it's an array, map over it
  if (Array.isArray(obj)) {
    return obj.map((item) => convertTimestamps(item));
  }

  // Otherwise, handle nested objects
  const newObj: any = {};
  for (const key of Object.keys(obj)) {
    newObj[key] = convertTimestamps(obj[key]);
  }
  return newObj;
}

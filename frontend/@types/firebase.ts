export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

export const timestampToDate = (
  timestamp?: FirestoreTimestamp
): Date | undefined => {
  if (!timestamp) return undefined;
  return new Date(timestamp.seconds * 1000);
};

export const formatTimestamp = (
  timestamp?: FirestoreTimestamp,
  format: string = "short"
): string => {
  if (!timestamp) return "N/A";
  const date = timestampToDate(timestamp);
  if (!date) return "Invalid Date";

  if (format === "short") {
    return date.toLocaleDateString();
  } else if (format === "long") {
    return date.toLocaleString();
  }
  return date.toISOString();
};

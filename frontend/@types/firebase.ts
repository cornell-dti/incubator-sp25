export interface FirestoreTimestamp {
  seconds?: number;
  nanoseconds?: number;
  _seconds?: number;
  _nanoseconds?: number;
}

export const timestampToDate = (
  timestamp?: FirestoreTimestamp
): Date | undefined => {
  if (!timestamp) return undefined;

  const seconds = timestamp.seconds || timestamp._seconds;

  if (typeof seconds === "number") {
    return new Date(seconds * 1000);
  }

  return undefined;
};

export const formatTimestamp = (
  timestamp?: FirestoreTimestamp,
  format: string = "short"
): string => {
  if (!timestamp) return "N/A";

  const date = timestampToDate(timestamp);
  if (!date) return "N/A";

  try {
    if (format === "short") {
      return date.toLocaleDateString();
    } else if (format === "long") {
      return date.toLocaleString();
    }
    return date.toISOString();
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return "N/A";
  }
};

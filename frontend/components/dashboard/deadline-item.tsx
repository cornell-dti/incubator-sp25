import { FileText, Clock } from "lucide-react";
import { Course } from "@/@types/models";
import { Deadline } from "@/hooks/use-dashboard-data";
import { formatTimestamp } from "@/@types/firebase";

interface DeadlineItemProps {
  deadline: Deadline;
  courses: Course[];
  showActions?: boolean;
}

export function DeadlineItem({
  deadline,
  courses,
  showActions = false,
}: DeadlineItemProps) {
  // Find the course for this deadline
  const course = courses.find(
    (c) => c.id === deadline.courseId || c.courseCode === deadline.courseCode
  );
  const courseCode = course ? course.courseCode : "Unknown";
  // Clean up the title by removing potential duplicate course code
  let cleanTitle = deadline.title;

  // Remove the course code if it appears at the beginning of the title (with or without colon)
  if (cleanTitle.startsWith(courseCode)) {
    // Remove the course code and any following colon or space
    cleanTitle = cleanTitle.substring(courseCode.length).trim();
    // Remove leading colon or space if present
    if (cleanTitle.startsWith(":") || cleanTitle.startsWith(" ")) {
      cleanTitle = cleanTitle.substring(1).trim();
    }
  }

  return (
    <div className="flex items-center">
      <div className="flex items-center gap-4">
        <div
          className={`rounded-full p-2 ${
            deadline.eventType === "Exam" ? "bg-rose-100" : "bg-blue-100"
          }`}
        >
          {deadline.eventType === "Exam" ? (
            <FileText
              className={`h-4 w-4 ${
                deadline.eventType === "Exam"
                  ? "text-rose-500"
                  : "text-blue-500"
              }`}
            />
          ) : (
            <Clock
              className={`h-4 w-4 ${
                deadline.eventType === "Exam"
                  ? "text-rose-500"
                  : "text-blue-500"
              }`}
            />
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">
            {courseCode}
            {cleanTitle ? `: ${cleanTitle}` : ""}
          </p>
          <p className="text-sm text-muted-foreground">
            Due on {formatTimestamp(deadline.date, "short")}
          </p>
        </div>
      </div>
      <div className="ml-auto font-medium">{deadline.eventType}</div>
    </div>
  );
}

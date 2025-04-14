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
            {courseCode}: {deadline.title}
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

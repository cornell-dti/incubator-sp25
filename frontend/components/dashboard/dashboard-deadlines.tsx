import { Calendar, MoreHorizontal } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Course } from "@/@types/models";
import { Deadline, LoadingState } from "@/hooks/use-dashboard-data";
import { formatTimestamp } from "@/@types/firebase";
import { FileText, Clock } from "lucide-react";

interface DashboardDeadlinesProps {
  courses: Course[];
  deadlines: Deadline[];
  loading: LoadingState;
}

export function DashboardDeadlines({
  courses,
  deadlines,
  loading,
}: DashboardDeadlinesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Deadlines</CardTitle>
        <CardDescription>View and manage all your deadlines</CardDescription>
      </CardHeader>
      <CardContent>
        {loading.todos || loading.exams ? (
          <div>Loading deadlines...</div>
        ) : deadlines.length > 0 ? (
          <div className="space-y-4">
            {deadlines.map((deadline) => {
              const course = courses.find(
                (c) =>
                  c.id === deadline.courseId ||
                  c.courseCode === deadline.courseCode
              );
              const courseCode = course ? course.courseCode : "Unknown";

              return (
                <div
                  key={deadline.id}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`rounded-full p-2 ${
                        deadline.eventType === "Exam"
                          ? "bg-rose-100"
                          : "bg-blue-100"
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
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Calendar className="mr-2 h-4 w-4" />
                      Add to Calendar
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Mark as Complete</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div>No deadlines found.</div>
        )}
      </CardContent>
    </Card>
  );
}

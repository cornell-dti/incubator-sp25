import { useState, useMemo } from "react";
import { Calendar, MoreHorizontal, Filter } from "lucide-react";
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Course } from "@/@types/models";
import { Deadline, LoadingState } from "@/hooks/use-dashboard-data";
import { formatTimestamp, timestampToDate } from "@/@types/firebase";
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
  // State for filters
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(true);

  const sortedDeadlines = useMemo(() => {
    return [...deadlines].sort((a, b) => {
      const dateA = timestampToDate(a.date);
      const dateB = timestampToDate(b.date);
      return dateA && dateB ? dateA.getTime() - dateB.getTime() : 0;
    });
  }, [deadlines]);

  const filteredDeadlines = useMemo(() => {
    return sortedDeadlines.filter((deadline) => {
      if (showUpcomingOnly) {
        const dueDate = timestampToDate(deadline.date);
        const today = new Date();
        if (!dueDate || dueDate < today) {
          return false;
        }
      }

      if (selectedCourse) {
        const course = courses.find(
          (c) => c.id === deadline.courseId || c.courseCode === deadline.courseCode
        );
        if (!course || (course.courseCode !== selectedCourse && course.id !== selectedCourse)) {
          return false;
        }
      }

      if (selectedType) {
        if (selectedType === "Exam" && deadline.eventType !== "Exam") {
          return false;
        } else if (selectedType === "Other" && deadline.eventType === "Exam") {
          return false;
        }
      }

      return true;
    });
  }, [sortedDeadlines, selectedCourse, selectedType, showUpcomingOnly, courses]);

  const clearFilters = () => {
    setSelectedCourse(null);
    setSelectedType(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>All Deadlines</CardTitle>
            <CardDescription>View and manage all your deadlines</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {/* Show upcoming toggle */}
            <div className="flex items-center space-x-2 mr-4">
              <Switch
                id="upcoming-toggle"
                checked={showUpcomingOnly}
                onCheckedChange={setShowUpcomingOnly}
              />
              <Label htmlFor="upcoming-toggle">Show upcoming only</Label>
            </div>

            {/* Active filters display */}
            {(selectedCourse || selectedType) && (
              <div className="flex gap-2 items-center">
                {selectedCourse && (
                  <Badge 
                    variant="outline" 
                    className="flex items-center gap-1"
                  >
                    Course: {selectedCourse}
                    <span className="cursor-pointer" onClick={() => setSelectedCourse(null)}>×</span>
                  </Badge>
                )}
                {selectedType && (
                  <Badge 
                    variant="outline" 
                    className="flex items-center gap-1"
                  >
                    Type: {selectedType}
                    <span className="cursor-pointer" onClick={() => setSelectedType(null)}>×</span>
                  </Badge>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="h-7 px-2"
                >
                  Clear
                </Button>
              </div>
            )}

            {/* Course filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter by Course
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedCourse(null)}>
                  All Courses
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {courses.map((course) => (
                  <DropdownMenuItem
                    key={course.id}
                    onClick={() => setSelectedCourse(course.courseCode)}
                  >
                    {course.courseCode}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Type filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter by Type
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedType(null)}>
                  All Types
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedType("Exam")}>
                  Exam
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedType("Other")}>
                  Other
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading.todos || loading.exams ? (
          <div>Loading deadlines...</div>
        ) : filteredDeadlines.length > 0 ? (
          <div className="space-y-4">
            {filteredDeadlines.map((deadline) => {
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
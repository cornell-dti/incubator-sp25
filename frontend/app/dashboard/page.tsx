"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  FileText,
  MoreHorizontal,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { SyllabusUploader } from "@/components/syllabus-uploader";
import { AuthGuard } from "@/components/AuthGuard";
import { createApiService } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Course, Exam, Todo } from "@/@types/models";
import {
  timestampToDate,
  formatTimestamp,
  FirestoreTimestamp,
} from "@/@types/firebase";
import { useToast } from "@/components/ui/use-toast";

interface Deadline {
  id?: string;
  courseId?: string;
  courseCode?: string;
  title: string;
  date: FirestoreTimestamp;
  eventType: string;
  isExam?: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const apiService = createApiService();

  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<{
    courseCode: string;
    courseName: string;
    instructor: string;
  }>({ courseCode: "", courseName: "", instructor: "" });

  const [courses, setCourses] = useState<Course[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState({
    courses: true,
    exams: true,
    todos: true,
  });

  const handleEditClick = (course: Course) => {
    setEditingCourseId(course.id || null);
    setEditedValues({
      courseCode: course.courseCode,
      courseName: course.courseName,
      instructor:
        course.sections && course.sections.length > 0
          ? course.sections[0].instructor
          : "",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedValues({
      ...editedValues,
      [field]: value,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setEditingCourseId(null);
    }
  };

  const handleSaveEdit = () => {
    setEditingCourseId(null);
  };

  const navigateToCourseDeadlines = (courseId: string) => {
    router.push(`/courses/${courseId}/deadlines`);
  };

  useEffect(() => {
    if (!auth.user) return;

    const fetchData = async () => {
      try {
        setLoading((prev) => ({ ...prev, courses: true }));

        const userData = await apiService.getCurrentUser();

        if (userData.courses && userData.courses.length > 0) {
          setCourses(userData.courses);

          // Get exams for each course
          setLoading((prev) => ({ ...prev, exams: true }));
          const allExams: Exam[] = [];

          for (const course of userData.courses) {
            try {
              if (course.id) {
                const courseExams = await apiService.getExamsByCourseId(
                  course.id
                );
                allExams.push(...courseExams);
              }
            } catch (error) {
              console.error(
                `Error fetching exams for course ${course.courseCode}:`,
                error
              );
            }
          }

          setExams(allExams);
          setLoading((prev) => ({ ...prev, exams: false }));
        } else {
          setCourses([]);
          setExams([]);
          setLoading((prev) => ({ ...prev, exams: false }));
        }

        // Get todos for the user
        setLoading((prev) => ({ ...prev, todos: true }));
        try {
          const todoData = await apiService.getTodosByUser();
          setTodos(todoData);
        } catch (todoError) {
          console.error("Error fetching todos:", todoError);
        } finally {
          setLoading((prev) => ({ ...prev, todos: false }));
        }

        setLoading((prev) => ({ ...prev, courses: false }));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error loading data",
          description: "Failed to load your dashboard data. Please try again.",
          variant: "destructive",
        });
        setLoading({ courses: false, exams: false, todos: false });
      }
    };

    fetchData();
  }, [auth.user, toast]);

  useEffect(() => {
    // Only create deadlines when both exams and todos are loaded
    if (!loading.exams && !loading.todos) {
      const examDeadlines: Deadline[] = exams.map((exam) => ({
        id: exam.id,
        courseId: exam.courseId,
        title: exam.title,
        date: exam.startTime,
        eventType: "Exam",
        isExam: true,
      }));

      const todoDeadlines: Deadline[] = todos.map((todo) => ({
        id: todo.id,
        courseCode: todo.courseCode,
        title: todo.title,
        date: todo.date,
        eventType: todo.eventType,
        isExam: false,
      }));

      setDeadlines([...examDeadlines, ...todoDeadlines]);
    }
  }, [exams, todos, loading.exams, loading.todos]);

  const upcomingDeadlines = deadlines.filter((deadline) => {
    const dueDate = timestampToDate(deadline.date);
    const today = new Date();
    return dueDate ? dueDate >= today : false;
  });

  const examsThisMonth = deadlines.filter((deadline) => {
    const dueDate = timestampToDate(deadline.date);
    const today = new Date();
    return (
      dueDate &&
      deadline.eventType === "Exam" &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear()
    );
  });

  const completedTasks = 0;

  return (
    <AuthGuard>
      <DashboardShell>
        <DashboardHeader
          heading="Dashboard"
          text="Manage your courses and upcoming deadlines."
        >
          <div className="flex gap-2">
            <Button className="bg-rose-500 hover:bg-rose-600">
              <Upload className="mr-2 h-4 w-4" />
              Upload Syllabus
            </Button>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Connect Calendar
            </Button>
          </div>
        </DashboardHeader>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Courses
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading.courses ? "..." : courses.length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Upcoming Deadlines
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading.todos ? "..." : upcomingDeadlines.length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Exams This Month
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading.todos ? "..." : examsThisMonth.length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed Tasks
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading.todos ? "..." : completedTasks}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Upcoming Deadlines</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading.todos ? (
                    <div>Loading deadlines...</div>
                  ) : upcomingDeadlines.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingDeadlines.map((deadline) => {
                        // Find the course for this deadline
                        const course = courses.find(
                          (c) =>
                            c.id === deadline.courseId ||
                            c.courseCode === deadline.courseCode
                        );
                        const courseCode = course
                          ? course.courseCode
                          : "Unknown";

                        return (
                          <div key={deadline.id} className="flex items-center">
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
                                  Due on{" "}
                                  {formatTimestamp(deadline.date, "short")}
                                </p>
                              </div>
                            </div>
                            <div className="ml-auto font-medium">
                              {deadline.eventType}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div>No upcoming deadlines found.</div>
                  )}
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Quick Upload</CardTitle>
                  <CardDescription>
                    Upload a new syllabus to extract deadlines
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SyllabusUploader />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="deadlines" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Deadlines</CardTitle>
                <CardDescription>
                  View and manage all your deadlines
                </CardDescription>
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
                                <DropdownMenuItem>
                                  Mark as Complete
                                </DropdownMenuItem>
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
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Courses</h2>
            </div>
            {loading.courses ? (
              <div>Loading courses...</div>
            ) : courses.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <Card
                    key={course.id}
                    className="group relative overflow-hidden"
                  >
                    <div className="p-6 space-y-4">
                      <div>
                        <div className="bg-rose-100 text-rose-600 px-3 py-1 rounded-md text-sm font-medium inline-block mb-3">
                          {course.courseCode}
                        </div>
                        <div
                          className="group/edit relative rounded-md hover:bg-muted/50 transition-colors"
                          onClick={() => {
                            if (editingCourseId !== course.id) {
                              handleEditClick(course);
                            }
                          }}
                        >
                          {editingCourseId === course.id ? (
                            <Input
                              value={editedValues.courseName}
                              onChange={(e) =>
                                handleInputChange("courseName", e.target.value)
                              }
                              onKeyDown={handleKeyDown}
                              onBlur={handleSaveEdit}
                              className="text-xl font-semibold border-none bg-transparent focus-visible:ring-1 p-0 w-full"
                              placeholder="Course Name"
                              autoFocus
                            />
                          ) : (
                            <h3 className="text-xl font-semibold cursor-text hover:bg-muted/30 p-1 rounded -ml-1">
                              {course.courseName}
                            </h3>
                          )}
                        </div>
                      </div>

                      <div className="flex items-baseline">
                        <span className="font-medium mr-2">Instructor:</span>
                        <span className="text-muted-foreground">
                          {course.sections && course.sections.length > 0
                            ? course.sections[0].instructor
                            : "Not specified"}
                        </span>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigateToCourseDeadlines(course.id || "")
                          }
                        >
                          View Deadlines
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div>
                No courses found. Add a course or upload a syllabus to get
                started.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DashboardShell>
    </AuthGuard>
  );
}

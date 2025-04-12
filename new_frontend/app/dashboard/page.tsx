"use client";

import { useState } from "react";
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

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [editedValues, setEditedValues] = useState<{
    code: string;
    name: string;
    instructor: string;
  }>({ code: "", name: "", instructor: "" });

  // Sample data - in a real app this would come from a database
  const upcomingDeadlines = [
    {
      id: 1,
      course: "CS 4700",
      title: "Project 1",
      dueDate: "2023-09-15",
      type: "Assignment",
    },
    {
      id: 2,
      course: "MATH 2940",
      title: "Midterm Exam",
      dueDate: "2023-09-20",
      type: "Exam",
    },
    {
      id: 3,
      course: "ENGL 1100",
      title: "Essay Draft",
      dueDate: "2023-09-22",
      type: "Assignment",
    },
  ];

  const [courses, setCourses] = useState([
    {
      id: 1,
      code: "CS 4700",
      name: "Foundations of Artificial Intelligence",
      instructor: "Dr. Smith",
    },
    {
      id: 2,
      code: "MATH 2940",
      name: "Linear Algebra",
      instructor: "Dr. Johnson",
    },
    {
      id: 3,
      code: "ENGL 1100",
      name: "Writing in the Disciplines",
      instructor: "Dr. Williams",
    },
  ]);

  const handleEditClick = (course) => {
    setEditingCourseId(course.id);
    setEditedValues({
      code: course.code,
      name: course.name,
      instructor: course.instructor,
    });
  };

  const handleSaveEdit = () => {
    if (editingCourseId) {
      setCourses(
        courses.map((course) =>
          course.id === editingCourseId
            ? { ...course, ...editedValues }
            : course
        )
      );
      setEditingCourseId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingCourseId(null);
  };

  const handleInputChange = (field, value) => {
    setEditedValues({
      ...editedValues,
      [field]: value,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const navigateToCourseDeadlines = (courseId) => {
    router.push(`/course-deadlines/${courseId}`);
  };

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
                  <div className="text-2xl font-bold">{courses.length}</div>
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
                    {upcomingDeadlines.length}
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
                  <div className="text-2xl font-bold">1</div>
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
                  <div className="text-2xl font-bold">0</div>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Upcoming Deadlines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingDeadlines.map((deadline) => (
                      <div key={deadline.id} className="flex items-center">
                        <div className="flex items-center gap-4">
                          <div
                            className={`rounded-full p-2 ${
                              deadline.type === "Exam"
                                ? "bg-rose-100"
                                : "bg-blue-100"
                            }`}
                          >
                            {deadline.type === "Exam" ? (
                              <FileText
                                className={`h-4 w-4 ${
                                  deadline.type === "Exam"
                                    ? "text-rose-500"
                                    : "text-blue-500"
                                }`}
                              />
                            ) : (
                              <Clock
                                className={`h-4 w-4 ${
                                  deadline.type === "Exam"
                                    ? "text-rose-500"
                                    : "text-blue-500"
                                }`}
                              />
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {deadline.course}: {deadline.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Due on {deadline.dueDate}
                            </p>
                          </div>
                        </div>
                        <div className="ml-auto font-medium">
                          {deadline.type}
                        </div>
                      </div>
                    ))}
                  </div>
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
                  View and manage all your upcoming deadlines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingDeadlines.map((deadline) => (
                    <div
                      key={deadline.id}
                      className="flex items-center justify-between border-b pb-4"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`rounded-full p-2 ${
                            deadline.type === "Exam"
                              ? "bg-rose-100"
                              : "bg-blue-100"
                          }`}
                        >
                          {deadline.type === "Exam" ? (
                            <FileText
                              className={`h-4 w-4 ${
                                deadline.type === "Exam"
                                  ? "text-rose-500"
                                  : "text-blue-500"
                              }`}
                            />
                          ) : (
                            <Clock
                              className={`h-4 w-4 ${
                                deadline.type === "Exam"
                                  ? "text-rose-500"
                                  : "text-blue-500"
                              }`}
                            />
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {deadline.course}: {deadline.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Due on {deadline.dueDate}
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="courses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Courses</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Card
                  key={course.id}
                  className="group relative overflow-hidden"
                >
                  <div className="p-6 space-y-4">
                    <div>
                      <div className="bg-rose-100 text-rose-600 px-3 py-1 rounded-md text-sm font-medium inline-block mb-3">
                        {course.code}
                      </div>
                      <div
                        className="group/edit relative rounded-md hover:bg-muted/50 transition-colors"
                        onClick={() => {
                          if (editingCourseId !== course.id) {
                            setEditingCourseId(course.id);
                            setEditedValues({
                              ...course, // Include all course data to prevent losing information
                              name: course.name,
                            });
                          }
                        }}
                      >
                        {editingCourseId === course.id ? (
                          <Input
                            value={editedValues.name}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            onKeyDown={handleKeyDown}
                            onBlur={handleSaveEdit}
                            className="text-xl font-semibold border-none bg-transparent focus-visible:ring-1 p-0 w-full"
                            placeholder="Course Name"
                            autoFocus
                          />
                        ) : (
                          <h3 className="text-xl font-semibold cursor-text hover:bg-muted/30 p-1 rounded -ml-1">
                            {course.name}
                          </h3>
                        )}
                      </div>
                    </div>

                    <div className="flex items-baseline">
                      <span className="font-medium mr-2">Instructor:</span>
                      <span className="text-muted-foreground">
                        {course.instructor}
                      </span>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateToCourseDeadlines(course.id)}
                      >
                        View Deadlines
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DashboardShell>
    </AuthGuard>
  );
}

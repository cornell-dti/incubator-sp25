"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import { Course } from "@/@types";

import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { AuthGuard } from "@/components/AuthGuard";
import { createApiService } from "@/lib/api";
import { Todo } from "@/@types";
import { Timestamp } from "firebase/firestore";
import { ErrorNotification } from "@/components/error-notification";

interface Section {
  sectionId: string;
  instructor: string;
}

interface TodoSimplified {
  id?: number;
  title: string;
  date: string;
  eventType: string;
  priority: number;
}

interface ExtractedData {
  courseCode: string;
  courseName: string;
  instructor: string;
  todos: TodoSimplified[];
}

interface Syllabus {
  id: number;
  parsedContent: string;
  extractedData: ExtractedData;
}

export default function SyllabusReviewPage() {
  const apiService = createApiService();
  const router = useRouter();
  const params = useParams();
  const syllabusId = Number.parseInt(params.id as string);

  const [syllabus, setSyllabus] = useState<Partial<Syllabus>>({});
  const [courseData, setCourseData] = useState({
    courseCode: "",
    courseName: "",
    instructor: "",
  });
  const [deadlines, setDeadlines] = useState<TodoSimplified[]>([]);
  const [editingDeadlineId, setEditingDeadlineId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [totalSyllabi, setTotalSyllabi] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [instructorQuery, setInstructorQuery] = useState("");
  const [instructorResults, setInstructorResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Add notification state for displaying errors, warnings, info messages, etc.
  const [notification, setNotification] = useState<{
    type: 'error' | 'warning' | 'info' | 'success';
    message: string;
  } | null>(null);

  // Add this state for the instructor dropdown
  const [instructorOpen, setInstructorOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<string[]>([]);
  const deadlinesContainerRef = useRef<HTMLDivElement>(null);

  // Fixed useEffect with dependency array to prevent infinite re-renders
  useEffect(() => {
    const localSyllabi = localStorage.getItem("parsedSyllabi");
    console.log(localSyllabi);
    if (localSyllabi !== null) {
      try {
        const parsedSyllabi = JSON.parse(localSyllabi);
        setSyllabi(parsedSyllabi);
        setTotalSyllabi(parsedSyllabi.length);
      } catch (err) {
        console.error("Error parsing syllabi from localStorage:", err);
        setError("Failed to load saved syllabi");
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const searchCourses = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await axios.get(
          `http://localhost:3000/api/search/${searchQuery}`
        );
        console.log(response.data);
        const courses = response.data.courses || [];
        setSearchResults(courses);
      } catch (error) {
        console.error("Error searching courses:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce the search to avoid making too many requests
    const timeoutId = setTimeout(() => {
      searchCourses();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const searchInstructors = async () => {
      if (instructorQuery.length < 2) {
        setInstructorResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await axios.get(
          `http://localhost:3000/api/search/instructor/${courseData.courseCode}/${instructorQuery}`
        );
        console.log(response.data);
        const instructors = response.data.instructors || [];
        setInstructorResults(instructors);
      } catch (error) {
        console.error("Error searching instructors:", error);
        setInstructorResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce the search to avoid making too many requests
    const timeoutId = setTimeout(() => {
      searchInstructors();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [instructorQuery, courseData.courseCode]);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("http://localhost:3000/api/courses");
        const mappedCourses = response.data;
        setCourses(mappedCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("Failed to fetch courses");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchInstructors = async () => {
      if (!courseData.courseCode) return;
      
      setIsLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:3000/api/courses/${courseData.courseCode}`
        );
        const instructorList = response.data.sections.map((section: Section) => {
          return section.instructor;
        });
        setInstructors(instructorList);
      } catch (error) {
        console.error("Error fetching instructors:", error);
        setError("Failed to fetch instructors");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInstructors();
  }, [courseData.courseCode]);

  useEffect(() => {
    // In a real app, this would be an API call
    const currentSyllabus = syllabi.find((s) => s.id === syllabusId);
    if (currentSyllabus) {
      setSyllabus(currentSyllabus);
      
      // Add null/undefined checks
      if (currentSyllabus.extractedData) {
        setCourseData({
          courseCode: currentSyllabus.extractedData.courseCode || "",
          courseName: currentSyllabus.extractedData.courseName || "",
          instructor: currentSyllabus.extractedData.instructor || "",
        });
        
        const todosWithIds = (currentSyllabus.extractedData.todos || []).map((todo, index) => ({
          ...todo,
          id: todo.id || index + 1
        }));
        
        setDeadlines(todosWithIds);
      }
    }
  }, [syllabusId, syllabi]);

  const handleCourseSelect = (selectedCourse: Course) => {
    setCourseData({
      ...courseData,
      courseCode: selectedCourse.courseCode,
      courseName: selectedCourse.courseName,
    });
    setOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleInputChange = (field: string, value: string) => {
    setCourseData({
      ...courseData,
      [field]: value,
    });
  };

  // Updated to work with the correct field names
  const handleDeadlineChange = (id: string | number, field: string, value: string) => {
    setDeadlines(
      deadlines.map((deadline) => {
        if (deadline.id === id) {
          if (field === "dueDate") {
            return {
              ...deadline,
              date: new Date(value).toISOString()
            };
          }
          
          return { ...deadline, [field]: value };
        }
        return deadline;
      })
    );
  };

  // Function to scroll to the bottom of the deadlines container
  const scrollToBottom = () => {
    if (deadlinesContainerRef.current) {
      const container = deadlinesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  };

   // Function to add a new deadline and scroll to it
   const handleAddDeadline = () => {
    const newId =
      deadlines.length > 0
        ? Math.max(...deadlines.map((d) => d.id || 0)) + 1
        : 1;
    setDeadlines([
      ...deadlines,
      {
        id: newId,
        title: "New Deadline",
        date: new Date().toISOString(),
        eventType: "assignment",
        priority: 3
      },
    ]);
    
    // Scroll to the bottom after the state updates and component re-renders
    setTimeout(scrollToBottom, 100);
  };

  const handleNext = async () => {
    try {
      setIsLoading(true);
      setNotification(null);
      
      for (const deadline of deadlines) {
        const todoData: Todo = {
          userId: "",
          courseCode: courseData.courseCode,
          title: deadline.title,
          date: Timestamp.fromDate(new Date(deadline.date)),
          eventType: deadline.eventType,
          priority: deadline.priority,
        };
        
        if (!todoData.title || !todoData.date || !todoData.eventType || !todoData.courseCode) {
          console.warn('Skipping incomplete todo:', todoData);
          continue;
        }
        
        await apiService.addTodo(todoData);
      }
      
      setDeadlines([]);
      
      const result = await apiService.addCourse(courseData.courseCode);
      
      if (result && result.error) {
        if (result.status === 400 && result.message === "Course already added") {
          setNotification({
            type: 'error',
            message: 'This course has already been added to your account.'
          });
        } else {
          setNotification({
            type: 'error',
            message: result.message || 'Failed to add course'
          });
          setIsLoading(false);
          return;
        }
      } else {
        setNotification({
          type: 'success',
          message: 'Course added successfully!'
        });
      }
      
      // Proceed to next page after a short delay (regardless of whether the course was added or was already there)
      setTimeout(() => {
        if (syllabusId < totalSyllabi) {
          router.push(`/onboarding/review/${syllabusId + 1}`);
        } else {
          router.push("/dashboard");
        }
      }, 1500);
    } catch (error) {
      console.error("Error saving deadlines:", error);
      setNotification({
        type: 'error',
        message: "Failed to save deadlines. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (syllabusId > 1) {
      router.push(`/onboarding/review/${syllabusId - 1}`);
    }
  };

  // Map eventType to UI-friendly type
  const getEventTypeDisplayName = (eventType: string): string => {
    const typeMap: Record<string, string> = {
      "readings": "Reading",
      "memos": "Memo",
      "assignments": "Assignment",
      "exams": "Exam",
      "projects": "Project",
      "presentations": "Presentation"
    };
    
    return typeMap[eventType] || eventType.charAt(0).toUpperCase() + eventType.slice(1);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => setError(null)}>Retry</Button>
      </div>
    );
  }

  if (!syllabus || !syllabus.id) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        No syllabus found with ID: {syllabusId}
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-rose-500" />
              <span className="font-bold">SyllabusSync</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Syllabus {syllabusId} of {totalSyllabi}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 py-6">
          <div className="container px-4 md:px-6">
            {notification && (
              <div className="mb-4">
                <ErrorNotification
                  type={notification.type}
                  message={notification.message}
                  onDismiss={() => setNotification(null)}
                />
              </div>
            )}

            <div className="mb-6">
              <h1 className="text-2xl font-bold">
                Review Syllabus: {syllabus.extractedData?.courseCode || "Unknown Course"}
              </h1>
              <p className="text-muted-foreground">
                Review and edit the extracted information from your syllabus
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Syllabus Preview */}
              <Card className="lg:col-span-1">
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Syllabus Preview</h2>
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="h-[70vh] overflow-y-auto border rounded-md p-4 bg-muted/30 font-mono text-sm whitespace-pre-wrap">
                    {syllabus.parsedContent || "No content available"}
                  </div>
                </CardContent>
              </Card>

              {/* Course Information */}
              <Card className="lg:col-span-1">
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold mb-4">
                    Course Information
                  </h2>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="courseCode">Course Code</Label>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between"
                          >
                            {courseData.courseCode || "Select course code..."}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search Cornell courses..."
                              value={searchQuery}
                              onValueChange={setSearchQuery}
                            />
                            <CommandList>
                              {isSearching ? (
                                <CommandItem disabled>Searching...</CommandItem>
                              ) : searchQuery.length < 2 ? (
                                <CommandItem disabled>
                                  Type at least 2 characters to search
                                </CommandItem>
                              ) : searchResults.length === 0 ? (
                                <CommandEmpty>No courses found</CommandEmpty>
                              ) : (
                                <CommandGroup className="max-h-60 overflow-y-auto">
                                  {searchResults.map((course) => (
                                    <CommandItem
                                      key={course.id}
                                      value={course.courseCode}
                                      onSelect={() =>
                                        handleCourseSelect(course)
                                      }
                                    >
                                      <Check
                                        className={`mr-2 h-4 w-4 ${
                                          courseData.courseCode ===
                                          course.courseCode
                                            ? "opacity-100"
                                            : "opacity-0"
                                        }`}
                                      />
                                      {course.courseCode} - {course.courseName}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              )}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="courseName">Course Name</Label>
                      <Input
                        id="courseName"
                        value={courseData.courseName}
                        onChange={(e) =>
                          handleInputChange("courseName", e.target.value)
                        }
                        placeholder="Course name"
                      />
                    </div>

                    {/* Replace the instructor input field with this dropdown implementation */}
                    <div className="space-y-2">
                      <Label htmlFor="instructor">Instructor</Label>
                      <Popover
                        open={instructorOpen}
                        onOpenChange={setInstructorOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={instructorOpen}
                            className="w-full justify-between"
                          >
                            {courseData.instructor || "Select instructor..."}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search instructors..."
                              value={instructorQuery}
                              onValueChange={setInstructorQuery}
                            />
                            <CommandList>
                              {instructors.length === 0 ? (
                                <CommandEmpty>No instructors found.</CommandEmpty>
                              ) : (
                                <CommandGroup className="max-h-60 overflow-y-auto">
                                  {instructors.map((instructor) => (
                                    <CommandItem
                                      key={instructor}
                                      value={instructor}
                                      onSelect={() => {
                                        handleInputChange(
                                          "instructor",
                                          instructor
                                        );
                                        setInstructorOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={`mr-2 h-4 w-4 ${
                                          courseData.instructor === instructor
                                            ? "opacity-100"
                                            : "opacity-0"
                                        }`}
                                      />
                                      {instructor}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              )}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Deadlines */}
              <Card className="lg:col-span-1">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Deadlines</h2>
                    <Button
                      size="sm"
                      onClick={() => handleAddDeadline()}
                      className="bg-rose-500 hover:bg-rose-600"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Deadline
                    </Button>
                  </div>

                  <div ref={deadlinesContainerRef} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {deadlines.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        No deadlines found in this syllabus
                      </p>
                    ) : (
                      deadlines.map((deadline) => (
                        <div
                          key={deadline.id}
                          className="border rounded-md p-3 space-y-2 relative"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-100"
                            onClick={() =>
                              setDeadlines(
                                deadlines.filter((d) => d.id !== deadline.id)
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete deadline</span>
                          </Button>

                          <div className="space-y-2">
                            <Label htmlFor={`deadline-title-${deadline.id}`}>
                              Title
                            </Label>
                            <Input
                              id={`deadline-title-${deadline.id}`}
                              value={deadline.title}
                              onChange={(e) =>
                                handleDeadlineChange(
                                  deadline.id || 0,
                                  "title",
                                  e.target.value
                                )
                              }
                              placeholder="Deadline title"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`deadline-type-${deadline.id}`}>
                              Type
                            </Label>
                            <Select
                              value={deadline.eventType}
                              onValueChange={(value) =>
                                handleDeadlineChange(deadline.id || 0, "eventType", value)
                              }
                            >
                              <SelectTrigger
                                id={`deadline-type-${deadline.id}`}
                              >
                                <SelectValue placeholder="Select type">
                                  {getEventTypeDisplayName(deadline.eventType)}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="readings">Reading</SelectItem>
                                <SelectItem value="assignments">Assignment</SelectItem>
                                <SelectItem value="exams">Exam</SelectItem>
                                <SelectItem value="projects">Project</SelectItem>
                                <SelectItem value="presentations">Presentation</SelectItem>
                                <SelectItem value="memos">Memo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`deadline-date-${deadline.id}`}>
                              Due Date
                            </Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left font-normal"
                                  id={`deadline-date-${deadline.id}`}
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {deadline.date ? (
                                    format(new Date(deadline.date), "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                  mode="single"
                                  selected={deadline.date ? new Date(deadline.date) : undefined}
                                  onSelect={(date) =>
                                    handleDeadlineChange(
                                      deadline.id || 0,
                                      "dueDate", // This is mapped to 'date' in handleDeadlineChange
                                      date ? date.toISOString().split("T")[0] : ""
                                    )
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`deadline-priority-${deadline.id}`}>
                              Priority
                            </Label>
                            <Select
                              value={deadline.priority.toString()}
                              onValueChange={(value) =>
                                handleDeadlineChange(deadline.id || 0, "priority", value)
                              }
                            >
                              <SelectTrigger
                                id={`deadline-priority-${deadline.id}`}
                              >
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">High</SelectItem>
                                <SelectItem value="2">Medium</SelectItem>
                                <SelectItem value="3">Low</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={syllabusId <= 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <Button
                onClick={handleNext}
                className="bg-rose-500 hover:bg-rose-600"
              >
                {syllabusId < totalSyllabi ? (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Finish
                    <Check className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
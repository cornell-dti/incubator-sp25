"use client";

import { useState, useEffect } from "react";
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

interface Section {
  sectionId: string;
  instructor: string;
}

const sampleSyllabi = [
  {
    id: 1,
    fileName: "CS4700_Syllabus.pdf",
    content: `
      CS 4700: Foundations of Artificial Intelligence
      
      Instructor: Dr. Smith
      Email: smith@cornell.edu
      Office Hours: Monday 2-4pm, Gates Hall 345
      
      Course Description:
      This course introduces the fundamental concepts and techniques in artificial intelligence, including search, knowledge representation, reasoning, planning, and machine learning.
      
      Grading:
      - Homework: 40%
      - Midterm: 20%
      - Final Project: 30%
      - Participation: 10%
      
      Important Dates:
      - Homework 1: September 15
      - Midterm Exam: October 5
      - Project Proposal: October 20
      - Final Project Due: December 15
    `,
    extractedData: {
      courseCode: "CS 4700",
      courseName: "Foundations of Artificial Intelligence",
      instructor: "Dr. Smith",
      deadlines: [
        {
          id: 1,
          title: "Homework 1",
          dueDate: "2023-09-15",
          type: "Assignment",
        },
        { id: 2, title: "Midterm Exam", dueDate: "2023-10-05", type: "Exam" },
        {
          id: 3,
          title: "Project Proposal",
          dueDate: "2023-10-20",
          type: "Assignment",
        },
        {
          id: 4,
          title: "Final Project",
          dueDate: "2023-12-15",
          type: "Project",
        },
      ],
    },
  },
];

export default function SyllabusReviewPage() {
  const router = useRouter();
  const params = useParams();
  const syllabusId = Number.parseInt(params.id as string);

  const [syllabus, setSyllabus] = useState(null);
  const [courseData, setCourseData] = useState({
    courseCode: "",
    courseName: "",
    instructor: "",
  });
  const [deadlines, setDeadlines] = useState([]);
  const [editingDeadlineId, setEditingDeadlineId] = useState(null);
  const [open, setOpen] = useState(false);
  const [totalSyllabi, setTotalSyllabi] = useState(sampleSyllabi.length);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Add this state for the instructor dropdown
  const [instructorOpen, setInstructorOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<string[]>([]);

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
    const fetchCourses = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/courses");
        const mappedCourses = response.data;
        setCourses(mappedCourses);
        setInstructorOpen(true);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchInstructors = async () => {
      if (!courseData.courseCode) return;
      try {
        const course = await axios.get(
          `http://localhost:3000/api/courses/${courseData.courseCode}`
        );
        const instructorList = course.data.sections.map((section: Section) => {
          return section.instructor;
        });
        setInstructors(instructorList);
      } catch (error) {
        console.error("Error fetching instructors:", error);
      }
    };
    fetchInstructors();
  }, [courseData.courseCode]);

  useEffect(() => {
    // In a real app, this would be an API call
    const currentSyllabus = sampleSyllabi.find((s) => s.id === syllabusId);
    if (currentSyllabus) {
      setSyllabus(currentSyllabus);
      setCourseData({
        courseCode: currentSyllabus.extractedData.courseCode,
        courseName: currentSyllabus.extractedData.courseName,
        instructor: currentSyllabus.extractedData.instructor,
      });
      setDeadlines(currentSyllabus.extractedData.deadlines);
    }
  }, [syllabusId]);

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

  const handleInputChange = (field, value) => {
    setCourseData({
      ...courseData,
      [field]: value,
    });
  };

  const handleDeadlineChange = (id, field, value) => {
    setDeadlines(
      deadlines.map((deadline) =>
        deadline.id === id ? { ...deadline, [field]: value } : deadline
      )
    );
  };

  const handleNext = () => {
    // In a real app, you would save the changes
    if (syllabusId < totalSyllabi) {
      router.push(`/onboarding/review/${syllabusId + 1}`);
    } else {
      router.push("/dashboard");
    }
  };

  const handlePrevious = () => {
    if (syllabusId > 1) {
      router.push(`/onboarding/review/${syllabusId - 1}`);
    }
  };

  if (!syllabus) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
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
            <div className="mb-6">
              <h1 className="text-2xl font-bold">
                Review Syllabus: {syllabus.fileName}
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
                    {syllabus.content}
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
                            <CommandInput placeholder="Search instructors..." />
                            <CommandList>
                              <CommandEmpty>No instructor found.</CommandEmpty>
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
                      onClick={() => {
                        const newId =
                          deadlines.length > 0
                            ? Math.max(...deadlines.map((d) => d.id)) + 1
                            : 1;
                        setDeadlines([
                          ...deadlines,
                          {
                            id: newId,
                            title: "New Deadline",
                            dueDate: new Date().toISOString().split("T")[0],
                            type: "Assignment",
                          },
                        ]);
                      }}
                      className="bg-rose-500 hover:bg-rose-600"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Deadline
                    </Button>
                  </div>

                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
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
                                  deadline.id,
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
                              value={deadline.type}
                              onValueChange={(value) =>
                                handleDeadlineChange(deadline.id, "type", value)
                              }
                            >
                              <SelectTrigger
                                id={`deadline-type-${deadline.id}`}
                              >
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Assignment">
                                  Assignment
                                </SelectItem>
                                <SelectItem value="Exam">Exam</SelectItem>
                                <SelectItem value="Quiz">Quiz</SelectItem>
                                <SelectItem value="Project">Project</SelectItem>
                                <SelectItem value="Paper">Paper</SelectItem>
                                <SelectItem value="Presentation">
                                  Presentation
                                </SelectItem>
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
                                  {deadline.dueDate ? (
                                    format(new Date(deadline.dueDate), "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                  mode="single"
                                  selected={new Date(deadline.dueDate)}
                                  onSelect={(date) =>
                                    handleDeadlineChange(
                                      deadline.id,
                                      "dueDate",
                                      date.toISOString().split("T")[0]
                                    )
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
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

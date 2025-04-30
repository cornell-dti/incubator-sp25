import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { Course, Todo } from "@/@types";
import { createApiService } from "@/lib/api";
import { Timestamp } from "firebase/firestore";

// Interface definitions
export interface Section {
  sectionId: string;
  instructor: string;
}

export interface TodoSimplified {
  id?: number;
  title: string;
  date: string;
  eventType: string;
  priority: number;
}

export interface ExtractedData {
  courseCode: string;
  courseName: string;
  instructor: string;
  todos: TodoSimplified[];
}

export interface Syllabus {
  id: number;
  parsedContent: string;
  extractedData: ExtractedData;
}

export interface CourseData {
  courseCode: string;
  courseName: string;
  instructor: string;
}

export interface LoadingState {
  syllabi: boolean;
  courses: boolean;
  instructors: boolean;
  saving: boolean;
}

export function useReviewData(syllabusId: number) {
  const apiService = createApiService();
  const { toast } = useToast();

  // State for syllabus data
  const [syllabus, setSyllabus] = useState<Partial<Syllabus>>({});
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [totalSyllabi, setTotalSyllabi] = useState(0);

  // State for course data
  const [courseData, setCourseData] = useState<CourseData>({
    courseCode: "",
    courseName: "",
    instructor: "",
  });
  const [deadlines, setDeadlines] = useState<TodoSimplified[]>([]);

  // State for search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [instructorQuery, setInstructorQuery] = useState("");
  const [instructorResults, setInstructorResults] = useState<string[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<string[]>([]);
  const [instructorOpen, setInstructorOpen] = useState(false);

  // State for UI
  const [loading, setLoading] = useState<LoadingState>({
    syllabi: true,
    courses: false,
    instructors: false,
    saving: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "error" | "warning" | "info" | "success";
    message: string;
  } | null>(null);

  // Load syllabi from localStorage
  useEffect(() => {
    const loadSyllabi = () => {
      setLoading((prev) => ({ ...prev, syllabi: true }));
      try {
        const localSyllabi = localStorage.getItem("parsedSyllabi");
        if (localSyllabi !== null) {
          const parsedSyllabi = JSON.parse(localSyllabi);
          setSyllabi(parsedSyllabi);
          setTotalSyllabi(parsedSyllabi.length);
        }
      } catch (err) {
        console.error("Error parsing syllabi from localStorage:", err);
        setError("Failed to load saved syllabi");
      } finally {
        setLoading((prev) => ({ ...prev, syllabi: false }));
      }
    };

    loadSyllabi();
  }, []);

  // Load current syllabus data based on syllabusId
  useEffect(() => {
    const loadCurrentSyllabus = () => {
      const currentSyllabus = syllabi.find((s) => s.id === syllabusId);
      if (currentSyllabus) {
        setSyllabus(currentSyllabus);

        if (currentSyllabus.extractedData) {
          setCourseData({
            courseCode: currentSyllabus.extractedData.courseCode || "",
            courseName: currentSyllabus.extractedData.courseName || "",
            instructor: currentSyllabus.extractedData.instructor || "",
          });

          const todosWithIds = (currentSyllabus.extractedData.todos || []).map(
            (todo, index) => ({
              ...todo,
              id: todo.id || index + 1,
            })
          );

          setDeadlines(todosWithIds);
        }
      }
    };

    if (syllabi.length > 0) {
      loadCurrentSyllabus();
    }
  }, [syllabusId, syllabi]);

  useEffect(() => {
    if (courseData.courseCode && courseData.courseCode.includes("/")) {
      // Only clean if it contains a separator like '/'
      const cleanedCode = extractFirstCourseCode(courseData.courseCode);
      if (cleanedCode !== courseData.courseCode) {
        setCourseData((prev) => ({
          ...prev,
          courseCode: cleanedCode,
        }));
      }
    }
  }, [courseData.courseCode]);

  // Fetch all courses
  const fetchCourses = async () => {
    setLoading((prev) => ({ ...prev, courses: true }));
    try {
      const response = await axios.get("http://localhost:3000/api/courses");
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setError("Failed to fetch courses");
    } finally {
      setLoading((prev) => ({ ...prev, courses: false }));
    }
  };

  const extractFirstCourseCode = (courseCode: string): string => {
    return courseCode.split(/\s*\/\s*|\s*,\s*|\s*;\s*/)[0].trim();
  };

  // Fetch instructors for a course
  const fetchInstructors = async () => {
    if (!courseData.courseCode) return;

    setLoading((prev) => ({ ...prev, instructors: true }));
    try {
      const response = await axios.get(
        `http://localhost:3000/api/courses/${extractFirstCourseCode(courseData.courseCode)}`
      );
      const instructorList = response.data.sections.map((section: Section) => {
        return section.instructor;
      });
      setInstructors(instructorList);
    } catch (error) {
      console.error("Error fetching instructors:", error);
      setError("Failed to fetch instructors");
    } finally {
      setLoading((prev) => ({ ...prev, instructors: false }));
    }
  };

  // Search for courses
  const searchCourses = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading((prev) => ({ ...prev, courses: true }));
    try {
      const response = await axios.get(
        `http://localhost:3000/api/search/${query}`
      );
      setSearchResults(response.data.courses || []);
    } catch (error) {
      console.error("Error searching courses:", error);
      setSearchResults([]);
    } finally {
      setLoading((prev) => ({ ...prev, courses: false }));
    }
  };

  // Search for instructors
  const searchInstructors = async (query: string) => {
    if (query.length < 2 || !courseData.courseCode) {
      setInstructorResults([]);
      return;
    }

    setLoading((prev) => ({ ...prev, instructors: true }));
    try {
      const response = await axios.get(
        `http://localhost:3000/api/search/instructor/${extractFirstCourseCode(courseData.courseCode)}/${query}`
      );
      setInstructorResults(response.data.instructors || []);
    } catch (error) {
      console.error("Error searching instructors:", error);
      setInstructorResults([]);
    } finally {
      setLoading((prev) => ({ ...prev, instructors: false }));
    }
  };

  // Save course and todos
  const saveCourseAndDeadlines = async () => {
    try {
      setLoading((prev) => ({ ...prev, saving: true }));
      setNotification(null);

      const courseResult = await apiService.addCourse(
        extractFirstCourseCode(courseData.courseCode)
      );

      if (courseResult && courseResult.error) {
        if (
          courseResult.status === 400 &&
          courseResult.message === "Course already added"
        ) {
          setNotification({
            type: "warning",
            message: "This course has already been added to your account.",
          });
          return false;
        } else {
          setNotification({
            type: "error",
            message: courseResult.message || "Failed to add course",
          });
          return false;
        }
      } else {
        // Course added successfully
        setNotification({
          type: "success",
          message: "Course added successfully!",
        });
      }

      // Now add the todos since the course was added (or was already added)
      for (const deadline of deadlines) {
        const todoData: Todo = {
          userId: "",
          courseCode: extractFirstCourseCode(courseData.courseCode),
          title: deadline.title,
          date: Timestamp.fromDate(new Date(deadline.date)),
          eventType: deadline.eventType,
          priority: deadline.priority,
        };

        if (
          !todoData.title ||
          !todoData.date ||
          !todoData.eventType ||
          !todoData.courseCode
        ) {
          console.warn("Skipping incomplete todo:", todoData);
          continue;
        }

        await apiService.addTodo(todoData);
      }

      return true;
    } catch (error) {
      console.error("Error saving course or deadlines:", error);
      setNotification({
        type: "error",
        message: "Failed to save. Please try again.",
      });
      return false;
    } finally {
      setLoading((prev) => ({ ...prev, saving: false }));
    }
  };

  // Handle input changes
  const handleCourseInputChange = (field: string, value: string) => {
    setCourseData({
      ...courseData,
      [field]: value,
    });
  };

  const handleDeadlineChange = (
    id: string | number,
    field: string,
    value: string
  ) => {
    setDeadlines(
      deadlines.map((deadline) => {
        if (deadline.id === id) {
          if (field === "dueDate") {
            const [year, month, day] = value.split("-").map(Number);
            const localDate = new Date(year, month - 1, day, 23, 59, 0, 0);
            return {
              ...deadline,
              date: localDate.toISOString(),
            };
          }

          return { ...deadline, [field]: value };
        }
        return deadline;
      })
    );
  };

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
        priority: 3,
      },
    ]);

    return newId;
  };

  const handleRemoveDeadline = (id: number) => {
    setDeadlines(deadlines.filter((d) => d.id !== id));
  };

  const handleCourseSelect = (selectedCourse: Course) => {
    setCourseData({
      ...courseData,
      courseCode: selectedCourse.courseCode,
      courseName: selectedCourse.courseName,
    });
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleInstructorSelect = (instructor: string) => {
    setCourseData({
      ...courseData,
      instructor,
    });
    setInstructorOpen(false);
  };

  const skipCurrentSyllabus = () => {
    // Just mark as processed without saving anything
    setNotification({
      type: "info",
      message: "Course skipped",
    });

    return true;
  };

  // Update search query
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCourses(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Update instructor query
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchInstructors(instructorQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [instructorQuery, courseData.courseCode]);

  // Fetch instructors when course code changes
  useEffect(() => {
    if (courseData.courseCode) {
      fetchInstructors();
    }
  }, [courseData.courseCode]);

  // Initial data fetch
  useEffect(() => {
    fetchCourses();
  }, []);

  return {
    // Data
    syllabus,
    syllabi,
    totalSyllabi,
    courseData,
    deadlines,
    courses,
    instructors,
    searchResults,
    instructorResults,
    instructorOpen,

    // UI state
    loading,
    error,
    notification,
    searchQuery,
    instructorQuery,

    // Actions
    setSearchQuery,
    setInstructorQuery,
    handleCourseInputChange,
    handleDeadlineChange,
    handleAddDeadline,
    handleRemoveDeadline,
    handleCourseSelect,
    handleInstructorSelect,
    saveCourseAndDeadlines,
    setNotification,
    setInstructorOpen,
    skipCurrentSyllabus,
  };
}

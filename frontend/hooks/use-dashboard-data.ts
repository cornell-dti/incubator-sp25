import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import { createApiService } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Course, Exam, Todo } from "@/@types/models";
import { timestampToDate, FirestoreTimestamp } from "@/@types/firebase";

export interface Deadline {
  id?: string;
  courseId?: string;
  courseCode?: string;
  title: string;
  date: FirestoreTimestamp;
  eventType: string;
  isExam?: boolean;
}

export interface LoadingState {
  courses: boolean;
  exams: boolean;
  todos: boolean;
}

export function useDashboardData() {
  const { toast } = useToast();
  const auth = useAuth();
  const apiService = createApiService();

  const [courses, setCourses] = useState<Course[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    courses: true,
    exams: true,
    todos: true,
  });

  // Generate deadlines whenever exams or todos change
  const deadlines = useMemo(() => {
    if (loading.exams || loading.todos) return [];

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

    return [...examDeadlines, ...todoDeadlines];
  }, [exams, todos, loading.exams, loading.todos]);

  // Derived data
  const upcomingDeadlines = useMemo(() => {
    return deadlines.filter((deadline) => {
      const dueDate = timestampToDate(deadline.date);
      const today = new Date();
      return dueDate ? dueDate >= today : false;
    });
  }, [deadlines]);

  const examsThisMonth = useMemo(() => {
    return deadlines.filter((deadline) => {
      const dueDate = timestampToDate(deadline.date);
      const today = new Date();
      return (
        dueDate &&
        deadline.eventType === "Exam" &&
        dueDate.getMonth() === today.getMonth() &&
        dueDate.getFullYear() === today.getFullYear()
      );
    });
  }, [deadlines]);

  // Fetch all necessary data
  const fetchData = async () => {
    if (!auth.user) return;

    try {
      setLoading((prev) => ({ ...prev, courses: true }));

      // Fetch user data which includes courses
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

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [auth.user]);

  return {
    courses,
    exams,
    todos,
    deadlines,
    upcomingDeadlines,
    examsThisMonth,
    loading,
    refreshData: fetchData,
  };
}

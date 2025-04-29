import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { User, Course, Todo, Exam, FinalDeliverable } from "@/@types/models";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Creates an API service with methods to interact with the backend
 * This service handles authenticated requests using tokens from AuthContext
 * @returns An object containing methods for various API operations
 */
export const createApiService = () => {
  const { getAuthToken } = useAuth();

  /**
   * Generates headers with authentication token for secure API requests. Use it for protected routes.
   * @returns {Promise<Record<string, string>>} Headers object with Content-Type and Authorization
   * @throws {Error} If no authenticated user is found
   */
  const getAuthHeaders = async () => {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No authenticated user");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const api = axios.create({
    baseURL: API_BASE_URL,
  });

  return {
    getCurrentUser: async (): Promise<User> => {
      try {
        const headers = await getAuthHeaders();
        const response = await api.get("/api/auth/me", { headers });
        return response.data;
      } catch (error) {
        console.error("Error getting current user:", error);
        throw error;
      }
    },

    getCourseByCode: async (courseCode: string): Promise<Course> => {
      try {
        const headers = await getAuthHeaders();
        const response = await api.get(`/api/courses/${courseCode}`, {
          headers,
        });
        return response.data;
      } catch (error) {
        console.error("Error getting course by code:", error);
        throw error;
      }
    },

    getTodosByUser: async (): Promise<Todo[]> => {
      try {
        const headers = await getAuthHeaders();
        const response = await api.get("/api/todos/user", { headers });
        return response.data;
      } catch (error) {
        console.error("Error getting todos by user:", error);
        throw error;
      }
    },

    getExamsByCourseId: async (courseId: string): Promise<Exam[]> => {
      try {
        const headers = await getAuthHeaders();
        const response = await api.get(`/api/exams/course/${courseId}`, {
          headers,
        });
        return response.data;
      } catch (error) {
        console.error("Error getting exams by course code:", error);
        throw error;
      }
    },

    getDeliverableByCourseId: async (
      courseId: string
    ): Promise<FinalDeliverable[]> => {
      try {
        const headers = await getAuthHeaders();
        const response = await api.get(`/api/deliverables/course/${courseId}`, {
          headers,
        });
        return response.data;
      } catch (error) {
        console.error("Error getting final deliverables by course id:", error);
        throw error;
      }
    },

    addCourse: async (courseCode: string) => {
      try {
        const headers = await getAuthHeaders();
        const response = await api.post(
          `/api/users/add-course/${courseCode}`,
          {},
          { headers }
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return {
            error: true,
            message: error.response.data.error || "Failed to add course",
            status: error.response.status,
          };
        }
        console.error("Error adding course:", error);
        return { error: true, message: "Unknown error occurred" };
      }
    },

    addTodo: async (todoData: Todo) => {
      try {
        const headers = await getAuthHeaders();
        const response = await api.post(`/api/todos/`, todoData, { headers });
        return response.data;
      } catch (error) {
        console.error("Error adding todos:", error);
        throw error;
      }
    },

    addCourseToCalendar: async (courseId: string) => {
      try {
        const headers = await getAuthHeaders();
        const response = await api.post(
          `/api/calendar/course/${courseId}`,
          {},
          { headers }
        );
        return response.data;
      } catch (error) {
        console.error("Error adding course to calendar:", error);
        throw error;
      }
    },
  };
};

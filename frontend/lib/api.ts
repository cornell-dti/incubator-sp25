import { useAuth } from "@/context/AuthContext";
import { User, Course, Todo, Exam } from "@/@types/models";

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

  return {
    getCurrentUser: async (): Promise<User> => {
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: "GET",
          headers,
        });

        if (!response.ok) {
          throw new Error(`Error fetching user: ${response.statusText}`);
        }

        const user = await response.json();
        return user;
      } catch (error) {
        console.error("Error getting current user:", error);
        throw error;
      }
    },

    getCourseByCode: async (courseCode: string): Promise<Course> => {
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(
          `${API_BASE_URL}/api/courses/${courseCode}`,
          {
            method: "GET",
            headers,
          }
        );
        if (!response.ok) {
          throw new Error(`Error fetching course: ${response.statusText}`);
        }

        const course: Course = await response.json();
        return course;
      } catch (error) {
        console.error("Error getting course by code:", error);
        throw error;
      }
    },

    getTodosByUser: async (): Promise<Todo[]> => {
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/api/todos/user`, {
          method: "GET",
          headers,
        });

        if (!response.ok) {
          throw new Error(`Error fetching todos: ${response.statusText}`);
        }

        const todos: Todo[] = await response.json();
        return todos;
      } catch (error) {
        console.error("Error getting todos by user:", error);
        throw error;
      }
    },
    getExamsByCourseId: async (courseId: string): Promise<Exam[]> => {
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(
          `${API_BASE_URL}/api/exams/course/${courseId}`,
          {
            method: "GET",
            headers,
          }
        );

        if (!response.ok) {
          throw new Error(`Error fetching exams: ${response.statusText}`);
        }

        const exams: Exam[] = await response.json();
        return exams;
      } catch (error) {
        console.error("Error getting exams by course code:", error);
        throw error;
      }
    },
  };
};

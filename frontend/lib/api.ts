import { auth } from "@/lib/firebase";
import { User, Course } from "@/@types/models";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// For authenticated requests
const getAuthHeaders = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user");
  }

  try {
    const token = await user.getIdToken(true);
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  } catch (error) {
    console.error("Failed to get authentication token:", error);
    throw new Error("Authentication failed. Please sign in again.");
  }
};

export const apiService = {
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

  getCourses: async (): Promise<Course[]> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/courses`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Error fetching courses: ${response.statusText}`);
      }

      const course = await response.json();
      return course;
    } catch (error) {
      console.error("Error getting courses:", error);
      throw error;
    }
  },

  getCourseById: async (courseId: string): Promise<Course> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
        method: "GET",
        headers,
      });
      if (!response.ok) {
        throw new Error(`Error fetching course: ${response.statusText}`);
      }

      const course: Course = await response.json();
      return course;
    } catch (error) {
      console.error("Error getting course by ID:", error);
      throw error;
    }
  },

  updateUser: async (
    userId: string,
    updatedUserData: Partial<User>
  ): Promise<User> => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(updatedUserData),
      });
      if (!response.ok) {
        throw new Error(`Error updating user: ${response.statusText}`);
      }
      const updatedUser: User = await response.json();
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },
};

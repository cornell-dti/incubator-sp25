"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiService } from "@/lib/api";
import type { User, Course } from "@/@types/models";
import { useAuth } from "@/context/AuthContext";
import { CourseCard } from "./CourseCard";

export function CourseFetcher() {
  const { user } = useAuth();
  const [courseIdInput, setCourseIdInput] = useState("");
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState("");

  const handleFetchCourse = async () => {
    setError("");
    setCourse(null);

    try {
      if (!courseIdInput) {
        throw new Error("Please provide a course ID.");
      }
      const fetchedCourse = await apiService.getCourseById(
        courseIdInput.trim()
      );
      setCourse(fetchedCourse);
    } catch (error: unknown) {
      console.error("Error fetching course:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred.");
      }
    }
  };

  const handleAddCourseToUser = async () => {
    if (!course) {
      setError("No course selected. Please fetch a course first.");
      return;
    }
    if (!user?.id) {
      setError("No logged-in user or user ID not found.");
      return;
    }

    try {
      const existingCourses = user.courses || [];
      const updatedUser: Partial<User> = {
        ...user,
        courses: [...existingCourses, course],
      };

      await apiService.updateUser(user.id, updatedUser);

      // Optionally re-fetch user data or do setUser(updatedUserFromServer) if needed
      alert(`Course "${course.courseCode}" added to your profile!`);
    } catch (error: unknown) {
      console.error("Error adding course to user:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred.");
      }
    }
  };

  return (
    <div className="bg-card p-4 rounded shadow border mb-8">
      <h2 className="text-2xl font-bold mb-4">Fetch a Single Course</h2>

      <div className="flex flex-wrap gap-2">
        <Input
          type="text"
          className="max-w-sm"
          placeholder="Enter a Firestore course ID..."
          value={courseIdInput}
          onChange={(e) => setCourseIdInput(e.target.value)}
        />
        <Button onClick={handleFetchCourse}>Fetch Course</Button>
      </div>

      {/* Display any errors */}
      {error && <p className="text-red-600 mt-2">{error}</p>}

      {/* If a course is fetched, show info & add button */}
      {course && (
        <div className="mt-4 p-4 border rounded">
          <CourseCard course={course} />
          <Button className="mt-2" onClick={handleAddCourseToUser}>
            Add Course to My Profile
          </Button>
        </div>
      )}
    </div>
  );
}

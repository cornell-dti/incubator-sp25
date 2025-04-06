"use client";

import { useAuth } from "@/context/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { apiService } from "@/lib/api";
import { User, Course } from "@/@types/models";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [courseIdInput, setCourseIdInput] = useState("");
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState("");

  // 1) Fetch a single course by ID
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

  // 2) Add that course to the user’s `courses` array
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
      // Merge existing user.courses with the new course
      const existingCourses = user.courses || [];
      const updatedUser: Partial<User> = {
        ...user,
        courses: [...existingCourses, course],
      };

      // Make the PUT request to update the user
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
    <AuthGuard>
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button variant="outline" onClick={logout}>
            Sign out
          </Button>
        </div>

        {/* User Info */}
        {user && (
          <div className="bg-card rounded-lg p-6 shadow border mb-8">
            <p className="text-lg font-medium">{user.name}</p>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        )}

        {/* Course Fetch Section */}
        <div className="bg-card p-4 rounded shadow border mb-8">
          <h2 className="text-2xl font-bold mb-4">Fetch a Single Course</h2>

          {/* Input for Course ID */}
          <input
            type="text"
            className="border p-2 rounded w-full max-w-sm mr-2"
            placeholder="Enter a Firestore course ID..."
            value={courseIdInput}
            onChange={(e) => setCourseIdInput(e.target.value)}
          />
          <Button onClick={handleFetchCourse} className="ml-2">
            Fetch Course
          </Button>

          {/* Display any errors */}
          {error && <p className="text-red-600 mt-2">{error}</p>}

          {/* If a course is fetched, show info & add button */}
          {course && (
            <div className="mt-4 p-4 border rounded">
              <p>Course ID: {course.id}</p>
              <p>Course Code: {course.courseCode}</p>
              <p>Course Name: {course.courseName}</p>
              <p>Instructors: {course.instructors.join(", ")}</p>

              <Button className="mt-2" onClick={handleAddCourseToUser}>
                Add Course to My Profile
              </Button>
            </div>
          )}
        </div>

        {/* Courses Section */}
        {user && user.courses && user.courses.length > 0 ? (
          <div className="bg-card p-4 rounded shadow border">
            <h2 className="text-2xl font-bold mb-4">My Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.courses.map((courseItem: Course, index: number) => (
                <div
                  key={`${courseItem.id}-${index}`}
                  className="bg-muted/10 p-4 rounded shadow"
                >
                  <p className="font-semibold mb-1">
                    {courseItem.courseCode}: {courseItem.courseName}
                  </p>
                  {courseItem.instructors && (
                    <div>
                      <p className="text-sm">Instructors:</p>
                      <ul className="list-disc pl-5 text-sm">
                        {courseItem.instructors.map((inst, i) => (
                          <li key={i}>{inst}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p>You currently have no courses in your profile.</p>
        )}
      </div>
    </AuthGuard>
  );
}

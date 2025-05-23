import { useState } from "react";
import { useRouter } from "next/navigation";
import { Course } from "@/@types/models";
import { CourseCard } from "@/components/dashboard/course-card";

interface DashboardCoursesProps {
  courses: Course[];
  loading: boolean;
  onCourseUpdate: () => void;
  onViewCourseDeadlines: (courseCode: string) => void;
}

export function DashboardCourses({
  courses,
  loading,
  onCourseUpdate,
  onViewCourseDeadlines,
}: DashboardCoursesProps) {
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const router = useRouter();

  const handleEditSave = () => {
    setEditingCourseId(null);
    onCourseUpdate();
  };

  const navigateToCourseDeadlines = (courseId: string) => {
    router.push(`/courses/${courseId}/deadlines`);
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Courses</h2>
      </div>
      {loading ? (
        <div>Loading courses...</div>
      ) : courses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            isEditing={editingCourseId === course.id}
            onEditStart={() => setEditingCourseId(course.id || null)}
            onEditSave={handleEditSave}
            onEditCancel={() => setEditingCourseId(null)}
            onViewDeadlines={(courseCode) => onViewCourseDeadlines(courseCode)}
          />
        ))}
      </div>
      ) : (
        <div>
          No courses found. Add a course or upload a syllabus to get started.
        </div>
      )}
    </>
  );
}

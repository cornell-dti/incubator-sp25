import type { Course } from "@/@types/models";
import { CourseCard } from "./CourseCard";

interface CourseListProps {
  courses: Course[];
}

export function CourseList({ courses }: CourseListProps) {
  return (
    <div className="bg-card p-4 rounded shadow border">
      <h2 className="text-2xl font-bold mb-4">My Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course, index) => (
          <CourseCard key={`${course.id}-${index}`} course={course} />
        ))}
      </div>
    </div>
  );
}

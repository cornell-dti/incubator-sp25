import type { Course } from "@/@types/models";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="bg-muted/10 p-4 rounded shadow">
      <p className="font-semibold mb-1">
        {course.courseCode}: {course.courseName}
      </p>
      {course.instructors && (
        <div>
          <p className="text-sm">Instructors:</p>
          <ul className="list-disc pl-5 text-sm">
            {course.instructors.map((instructor, index) => (
              <li key={index}>{instructor}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

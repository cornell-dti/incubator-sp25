import { useState } from "react";
import { Course } from "@/@types/models";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CourseCardProps {
  course: Course;
  isEditing: boolean;
  onEditStart: () => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onViewDeadlines: () => void;
}

export function CourseCard({
  course,
  isEditing,
  onEditStart,
  onEditSave,
  onEditCancel,
  onViewDeadlines,
}: CourseCardProps) {
  const [editedValues, setEditedValues] = useState({
    courseCode: course.courseCode,
    courseName: course.courseName,
    instructor:
      course.sections && course.sections.length > 0
        ? course.sections[0].instructor
        : "",
  });

  const handleInputChange = (field: string, value: string) => {
    setEditedValues({
      ...editedValues,
      [field]: value,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onEditSave();
    } else if (e.key === "Escape") {
      onEditCancel();
    }
  };

  return (
    <Card className="group relative overflow-hidden">
      <CardContent className="p-6 space-y-4">
        <div>
          <div className="bg-rose-100 text-rose-600 px-3 py-1 rounded-md text-sm font-medium inline-block mb-3">
            {course.courseCode}
          </div>
          <div
            className="group/edit relative rounded-md hover:bg-muted/50 transition-colors"
            onClick={() => {
              if (!isEditing) {
                onEditStart();
              }
            }}
          >
            {isEditing ? (
              <Input
                value={editedValues.courseName}
                onChange={(e) =>
                  handleInputChange("courseName", e.target.value)
                }
                onKeyDown={handleKeyDown}
                onBlur={onEditSave}
                className="text-xl font-semibold border-none bg-transparent focus-visible:ring-1 p-0 w-full"
                placeholder="Course Name"
                autoFocus
              />
            ) : (
              <h3 className="text-xl font-semibold cursor-text hover:bg-muted/30 p-1 rounded -ml-1">
                {course.courseName}
              </h3>
            )}
          </div>
        </div>

        <div className="flex items-baseline">
          <span className="font-medium mr-2">Instructor:</span>
          <span className="text-muted-foreground">
            {course.sections && course.sections.length > 0
              ? course.sections[0].instructor
              : "Not specified"}
          </span>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onViewDeadlines}>
            View Deadlines
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

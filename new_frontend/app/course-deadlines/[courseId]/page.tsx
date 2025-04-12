"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CalendarIcon,
  ChevronLeft,
  Clock,
  Edit2,
  FileText,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";

// Sample data - in a real app this would come from a database
const coursesData = [
  {
    id: 1,
    code: "CS 4700",
    name: "Foundations of Artificial Intelligence",
    instructor: "Dr. Smith",
  },
  {
    id: 2,
    code: "MATH 2940",
    name: "Linear Algebra",
    instructor: "Dr. Johnson",
  },
  {
    id: 3,
    code: "ENGL 1100",
    name: "Writing in the Disciplines",
    instructor: "Dr. Williams",
  },
];

const deadlinesData = [
  {
    id: 1,
    courseId: 1,
    title: "Project 1",
    dueDate: "2023-09-15",
    type: "Assignment",
  },
  { id: 2, courseId: 1, title: "Midterm", dueDate: "2023-10-05", type: "Exam" },
  {
    id: 3,
    courseId: 1,
    title: "Project 2",
    dueDate: "2023-10-20",
    type: "Assignment",
  },
  {
    id: 4,
    courseId: 1,
    title: "Final Exam",
    dueDate: "2023-12-15",
    type: "Exam",
  },
  {
    id: 5,
    courseId: 2,
    title: "Midterm Exam",
    dueDate: "2023-09-20",
    type: "Exam",
  },
  {
    id: 6,
    courseId: 2,
    title: "Problem Set 3",
    dueDate: "2023-10-10",
    type: "Assignment",
  },
  {
    id: 7,
    courseId: 3,
    title: "Essay Draft",
    dueDate: "2023-09-22",
    type: "Assignment",
  },
  {
    id: 8,
    courseId: 3,
    title: "Final Paper",
    dueDate: "2023-11-30",
    type: "Assignment",
  },
];

export default function CourseDeadlinesPage() {
  const params = useParams();
  const courseId = Number.parseInt(params.courseId as string);

  const [course, setCourse] = useState(null);
  const [deadlines, setDeadlines] = useState([]);
  const [editingDeadlineId, setEditingDeadlineId] = useState(null);
  const [editedValues, setEditedValues] = useState({
    title: "",
    dueDate: "",
    type: "",
  });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newDeadline, setNewDeadline] = useState({
    title: "",
    dueDate: new Date().toISOString().split("T")[0],
    type: "Assignment",
  });

  useEffect(() => {
    // In a real app, this would be an API call
    const foundCourse = coursesData.find((c) => c.id === courseId);
    const courseDeadlines = deadlinesData.filter(
      (d) => d.courseId === courseId
    );

    setCourse(foundCourse);
    setDeadlines(courseDeadlines);
  }, [courseId]);

  const handleEditClick = (deadline) => {
    setEditingDeadlineId(deadline.id);
    setEditedValues({
      title: deadline.title,
      dueDate: deadline.dueDate,
      type: deadline.type,
    });
  };

  const handleSaveEdit = () => {
    if (editingDeadlineId) {
      setDeadlines(
        deadlines.map((deadline) =>
          deadline.id === editingDeadlineId
            ? { ...deadline, ...editedValues }
            : deadline
        )
      );
      setEditingDeadlineId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingDeadlineId(null);
  };

  const handleInputChange = (field, value) => {
    setEditedValues({
      ...editedValues,
      [field]: value,
    });
  };

  const handleNewDeadlineChange = (field, value) => {
    setNewDeadline({
      ...newDeadline,
      [field]: value,
    });
  };

  const handleAddDeadline = () => {
    const newId = Math.max(...deadlines.map((d) => d.id), 0) + 1;
    const deadline = {
      id: newId,
      courseId,
      ...newDeadline,
    };

    setDeadlines([...deadlines, deadline]);
    setIsAddingNew(false);
    setNewDeadline({
      title: "",
      dueDate: new Date().toISOString().split("T")[0],
      type: "Assignment",
    });
  };

  const handleDeleteDeadline = (id) => {
    setDeadlines(deadlines.filter((deadline) => deadline.id !== id));
  };

  if (!course) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardShell>
      <DashboardHeader heading={`${course.code} Deadlines`} text={course.name}>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </DashboardHeader>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Course Deadlines</h2>
        <Button
          onClick={() => setIsAddingNew(true)}
          className="bg-rose-500 hover:bg-rose-600"
          disabled={isAddingNew}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Deadline
        </Button>
      </div>

      {isAddingNew && (
        <Card className="mb-6 border-2 border-rose-100">
          <CardHeader>
            <CardTitle>Add New Deadline</CardTitle>
            <CardDescription>
              Create a new deadline for this course
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Assignment or exam name"
                    value={newDeadline.title}
                    onChange={(e) =>
                      handleNewDeadlineChange("title", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={newDeadline.type}
                    onValueChange={(value) =>
                      handleNewDeadlineChange("type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Assignment">Assignment</SelectItem>
                      <SelectItem value="Exam">Exam</SelectItem>
                      <SelectItem value="Quiz">Quiz</SelectItem>
                      <SelectItem value="Paper">Paper</SelectItem>
                      <SelectItem value="Project">Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newDeadline.dueDate ? (
                        format(new Date(newDeadline.dueDate), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(newDeadline.dueDate)}
                      onSelect={(date) =>
                        handleNewDeadlineChange(
                          "dueDate",
                          date.toISOString().split("T")[0]
                        )
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddingNew(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddDeadline}
                  disabled={!newDeadline.title || !newDeadline.dueDate}
                  className="bg-rose-500 hover:bg-rose-600"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Deadline
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {deadlines.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <p className="text-muted-foreground mb-4">
                No deadlines found for this course.
              </p>
              <Button
                onClick={() => setIsAddingNew(true)}
                className="bg-rose-500 hover:bg-rose-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Deadline
              </Button>
            </CardContent>
          </Card>
        ) : (
          deadlines.map((deadline) => (
            <Card key={deadline.id} className="relative">
              {editingDeadlineId === deadline.id ? (
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        value={editedValues.title}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                        placeholder="Assignment or exam name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Type</label>
                      <Select
                        value={editedValues.type}
                        onValueChange={(value) =>
                          handleInputChange("type", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Assignment">Assignment</SelectItem>
                          <SelectItem value="Exam">Exam</SelectItem>
                          <SelectItem value="Quiz">Quiz</SelectItem>
                          <SelectItem value="Paper">Paper</SelectItem>
                          <SelectItem value="Project">Project</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <label className="text-sm font-medium">Due Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editedValues.dueDate ? (
                            format(new Date(editedValues.dueDate), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={new Date(editedValues.dueDate)}
                          onSelect={(date) =>
                            handleInputChange(
                              "dueDate",
                              date.toISOString().split("T")[0]
                            )
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveEdit}
                      className="bg-rose-500 hover:bg-rose-600"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="absolute right-4 top-4 flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(deadline)}
                    >
                      <Edit2 className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteDeadline(deadline.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`rounded-full p-3 ${
                          deadline.type === "Exam"
                            ? "bg-rose-100"
                            : "bg-blue-100"
                        }`}
                      >
                        {deadline.type === "Exam" ? (
                          <FileText
                            className={`h-5 w-5 ${
                              deadline.type === "Exam"
                                ? "text-rose-500"
                                : "text-blue-500"
                            }`}
                          />
                        ) : (
                          <Clock
                            className={`h-5 w-5 ${
                              deadline.type === "Exam"
                                ? "text-rose-500"
                                : "text-blue-500"
                            }`}
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {deadline.title}
                        </h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span className="font-medium mr-2">
                            {deadline.type}
                          </span>
                          <span>
                            Due on {format(new Date(deadline.dueDate), "PPP")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Card>
          ))
        )}
      </div>
    </DashboardShell>
  );
}

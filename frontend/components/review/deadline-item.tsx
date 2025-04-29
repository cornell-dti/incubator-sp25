"use client";

import type React from "react";

import { format } from "date-fns";
import { Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";

interface DeadlineItemProps {
  deadline: {
    id: number | undefined;
    title: string;
    eventType: string;
    date?: string;
    priority: number;
  };
  handleDeadlineChange: (id: number, field: string, value: string) => void;
  handleRemoveDeadline: (id: number) => void;
  loading: {
    saving: boolean;
  };
  getEventTypeDisplayName: (eventType: string) => string;
}

const DeadlineItem: React.FC<DeadlineItemProps> = ({
  deadline,
  handleDeadlineChange,
  handleRemoveDeadline,
  loading,
  getEventTypeDisplayName,
}) => {
  // Get priority color
  const getPriorityColor = (priority: number) => {
    const priorityNum = Number(priority);
    switch (priorityNum) {
      case 1:
        return "bg-red-100 text-red-800 border-red-200";
      case 2:
        return "bg-amber-100 text-amber-800 border-amber-200";
      case 3:
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get priority label
  const getPriorityLabel = (priority: number) => {
    const priorityNum = Number(priority);
    switch (priorityNum) {
      case 1:
        return "High";
      case 2:
        return "Medium";
      case 3:
        return "Low";
      default:
        return "Medium";
    }
  };

  // Get event type color
  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case "readings":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "assignments":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "exams":
        return "bg-red-100 text-red-800 border-red-200";
      case "projects":
        return "bg-green-100 text-green-800 border-green-200";
      case "presentations":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "memos":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="border rounded-lg p-5 space-y-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Badge className={getEventTypeColor(deadline.eventType)}>
              {getEventTypeDisplayName(deadline.eventType)}
            </Badge>
            {deadline.date && (
              <Badge variant="outline" className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {format(new Date(deadline.date), "MMM d, yyyy")}
              </Badge>
            )}
            <Badge className={getPriorityColor(Number(deadline.priority))}>
              {getPriorityLabel(Number(deadline.priority))}
            </Badge>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
          onClick={() => handleRemoveDeadline(Number(deadline.id))}
          disabled={loading.saving}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete deadline</span>
        </Button>
      </div>

      {/* Title Input */}
      <div className="space-y-2">
        <Label
          htmlFor={`deadline-title-${deadline.id}`}
          className="text-sm font-medium"
        >
          Title
        </Label>
        <Input
          id={`deadline-title-${deadline.id}`}
          value={deadline.title}
          onChange={(e) =>
            handleDeadlineChange(deadline.id || 0, "title", e.target.value)
          }
          placeholder="Deadline title"
          disabled={loading.saving}
          className="border-gray-300 focus:border-rose-300 focus:ring focus:ring-rose-200 focus:ring-opacity-50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Type Selection */}
        <div className="space-y-2">
          <Label
            htmlFor={`deadline-type-${deadline.id}`}
            className="text-sm font-medium"
          >
            Type
          </Label>
          <Select
            value={deadline.eventType}
            onValueChange={(value) =>
              handleDeadlineChange(deadline.id || 0, "eventType", value)
            }
            disabled={loading.saving}
          >
            <SelectTrigger
              id={`deadline-type-${deadline.id}`}
              className="border-gray-300"
            >
              <SelectValue placeholder="Select type">
                {getEventTypeDisplayName(deadline.eventType)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="readings">Reading</SelectItem>
              <SelectItem value="assignments">Assignment</SelectItem>
              <SelectItem value="exams">Exam</SelectItem>
              <SelectItem value="projects">Project</SelectItem>
              <SelectItem value="presentations">Presentation</SelectItem>
              <SelectItem value="memos">Memo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Due Date Selection */}
        <div className="space-y-2">
          <Label
            htmlFor={`deadline-date-${deadline.id}`}
            className="text-sm font-medium"
          >
            Due Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal border-gray-300"
                id={`deadline-date-${deadline.id}`}
                disabled={loading.saving}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {deadline.date ? (
                  format(new Date(deadline.date), "MMM d, yyyy")
                ) : (
                  <span className="text-muted-foreground">Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={deadline.date ? new Date(deadline.date) : undefined}
                onSelect={(date) =>
                  handleDeadlineChange(
                    deadline.id || 0,
                    "dueDate", // This is mapped to 'date' in handleDeadlineChange
                    date ? date.toISOString().split("T")[0] : ""
                  )
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Priority Selection */}
        <div className="space-y-2 md:col-span-2">
          <Label
            htmlFor={`deadline-priority-${deadline.id}`}
            className="text-sm font-medium"
          >
            Priority
          </Label>
          <Select
            value={deadline.priority.toString()}
            onValueChange={(value) => {
              handleDeadlineChange(deadline.id || 0, "priority", value);
            }}
            disabled={loading.saving}
          >
            <SelectTrigger
              id={`deadline-priority-${deadline.id}`}
              className="border-gray-300"
            >
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">High</SelectItem>
              <SelectItem value="2">Medium</SelectItem>
              <SelectItem value="3">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default DeadlineItem;

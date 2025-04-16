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
  return (
    <div className="border rounded-md p-3 space-y-2 relative">
      {/* Delete Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-100"
        onClick={() => handleRemoveDeadline(Number(deadline.id))}
        disabled={loading.saving}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete deadline</span>
      </Button>

      {/* Title Input */}
      <div className="space-y-2">
        <Label htmlFor={`deadline-title-${deadline.id}`}>Title</Label>
        <Input
          id={`deadline-title-${deadline.id}`}
          value={deadline.title}
          onChange={(e) =>
            handleDeadlineChange(deadline.id || 0, "title", e.target.value)
          }
          placeholder="Deadline title"
          disabled={loading.saving}
        />
      </div>

      {/* Type Selection */}
      <div className="space-y-2">
        <Label htmlFor={`deadline-type-${deadline.id}`}>Type</Label>
        <Select
          value={deadline.eventType}
          onValueChange={(value) =>
            handleDeadlineChange(deadline.id || 0, "eventType", value)
          }
          disabled={loading.saving}
        >
          <SelectTrigger id={`deadline-type-${deadline.id}`}>
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
        <Label htmlFor={`deadline-date-${deadline.id}`}>Due Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
              id={`deadline-date-${deadline.id}`}
              disabled={loading.saving}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {deadline.date ? (
                format(new Date(deadline.date), "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
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
      <div className="space-y-2">
        <Label htmlFor={`deadline-priority-${deadline.id}`}>Priority</Label>
        <Select
          value={deadline.priority.toString()}
          onValueChange={(value) =>
            handleDeadlineChange(deadline.id || 0, "priority", value)
          }
          disabled={loading.saving}
        >
          <SelectTrigger id={`deadline-priority-${deadline.id}`}>
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
  );
};

export default DeadlineItem;
// components/syllabus-review/Deadlines.tsx
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DeadlineItem from "./deadline-item";
import { RefObject } from "react";

interface Deadline {
  id: number | undefined;
  title: string;
  eventType: string;
  date?: string;
  priority: number;
}

interface DeadlinesProps {
  deadlines: Deadline[];
  handleAddDeadline: () => void;
  handleRemoveDeadline: (id: number) => void;
  handleDeadlineChange: (id: number, field: string, value: string) => void;
  loading: {
    saving: boolean;
  };
  getEventTypeDisplayName: (eventType: string) => string;
  deadlinesContainerRef: RefObject<HTMLDivElement>;
}

const Deadlines: React.FC<DeadlinesProps> = ({
  deadlines,
  handleAddDeadline,
  handleRemoveDeadline,
  handleDeadlineChange,
  loading,
  getEventTypeDisplayName,
  deadlinesContainerRef,
}) => {
  return (
    <Card className="lg:col-span-1">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Deadlines</h2>
          <Button
            size="sm"
            onClick={handleAddDeadline}
            className="bg-rose-500 hover:bg-rose-600"
            disabled={loading.saving}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Deadline
          </Button>
        </div>

        <div
          ref={deadlinesContainerRef}
          className="space-y-4 max-h-[60vh] overflow-y-auto pr-2"
        >
          {deadlines.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No deadlines found in this syllabus
            </p>
          ) : (
            deadlines.map((deadline) => (
              <DeadlineItem
                key={deadline.id}
                deadline={deadline}
                handleDeadlineChange={handleDeadlineChange}
                handleRemoveDeadline={handleRemoveDeadline}
                loading={loading}
                getEventTypeDisplayName={getEventTypeDisplayName}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Deadlines;
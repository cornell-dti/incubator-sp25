"use client";

import type React from "react";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DeadlineItem from "./deadline-item";
import type { RefObject } from "react";

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
    <Card className="lg:col-span-1 h-full flex flex-col">
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Deadlines</h2>
          <Button
            size="default"
            onClick={handleAddDeadline}
            className="bg-rose-500 hover:bg-rose-600 transition-colors"
            disabled={loading.saving}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Deadline
          </Button>
        </div>

        <div
          ref={deadlinesContainerRef}
          className="space-y-4 h-[70vh] overflow-y-auto pr-2"
        >
          {deadlines.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <p className="text-muted-foreground">
                No deadlines found in this syllabus
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddDeadline}
                className="mt-4"
                disabled={loading.saving}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add your first deadline
              </Button>
            </div>
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

import { FileText, Clock } from "lucide-react";
import { SyllabusUploader } from "@/components/syllabus-uploader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Course } from "@/@types/models";
import { LoadingState, Deadline } from "@/hooks/use-dashboard-data";
import { timestampToDate } from "@/@types/firebase";
import { DeadlineItem } from "@/components/dashboard/deadline-item";

interface DashboardOverviewProps {
  courses: Course[];
  deadlines: Deadline[];
  loading: LoadingState;
  onDataChange: () => void;
}

export function DashboardOverview({
  courses,
  deadlines,
  loading,
  onDataChange,
}: DashboardOverviewProps) {
  // Filter upcoming deadlines
  const upcomingDeadlines = deadlines.filter((deadline) => {
    const dueDate = timestampToDate(deadline.date);
    const today = new Date();
    return dueDate ? dueDate >= today : false;
  });

  // Filter exams this month
  const examsThisMonth = deadlines.filter((deadline) => {
    const dueDate = timestampToDate(deadline.date);
    const today = new Date();
    return (
      dueDate &&
      deadline.eventType === "Exam" &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear()
    );
  });

  const completedTasks = 0;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Courses"
          value={loading.courses ? "..." : String(courses.length)}
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Upcoming Deadlines"
          value={loading.todos ? "..." : String(upcomingDeadlines.length)}
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Exams This Month"
          value={loading.todos ? "..." : String(examsThisMonth.length)}
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Completed Tasks"
          value={loading.todos ? "..." : String(completedTasks)}
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            {loading.todos ? (
              <div>Loading deadlines...</div>
            ) : upcomingDeadlines.length > 0 ? (
              <div className="space-y-4">
                {upcomingDeadlines.map((deadline) => (
                  <DeadlineItem
                    key={deadline.id}
                    deadline={deadline}
                    courses={courses}
                  />
                ))}
              </div>
            ) : (
              <div>No upcoming deadlines found.</div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Upload</CardTitle>
            <CardDescription>
              Upload a new syllabus to extract deadlines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SyllabusUploader />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// A reusable stats card component
interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

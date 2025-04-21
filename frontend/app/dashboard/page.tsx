"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { AuthGuard } from "@/components/AuthGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Upload } from "lucide-react";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { DashboardDeadlines } from "@/components/dashboard/dashboard-deadlines";
import { DashboardCourses } from "@/components/dashboard/dashboard-courses";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const { courses, exams, todos, deadlines, loading, refreshData } =
    useDashboardData();

  // Function to handle redirect to onboarding page
  const router = useRouter();
  const navigateToOnboarding = () => {
    router.push("/onboarding");
  };

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab !== "deadlines") {
      setSelectedCourseFilter(null);
    }
  }, [activeTab]);

  const handleViewCourseDeadlines = (courseCode: string) => {
    setSelectedCourseFilter(courseCode);
    setActiveTab("deadlines");
  };

  const handleTabChange = (value: string) => {
    if (value !== "deadlines") {
      setSelectedCourseFilter(null);
    }
    setActiveTab(value);
  };

  return (
    <AuthGuard>
      <DashboardShell>
        <DashboardHeader
          heading="Dashboard"
          text="Manage your courses and upcoming deadlines."
        >
          <div className="flex gap-2">
            <Button
              className="bg-rose-500 hover:bg-rose-600"
              onClick={navigateToOnboarding}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Syllabus
            </Button>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Connect Calendar
            </Button>
          </div>
        </DashboardHeader>

        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <DashboardOverview
              courses={courses}
              deadlines={deadlines}
              loading={loading}
              onDataChange={refreshData}
            />
          </TabsContent>

          <TabsContent value="deadlines" className="space-y-4">
            <DashboardDeadlines
              courses={courses}
              deadlines={deadlines}
              loading={loading}
              initialCourseFilter={selectedCourseFilter}
            />
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <DashboardCourses
              courses={courses}
              loading={loading.courses}
              onCourseUpdate={refreshData}
              onViewCourseDeadlines={handleViewCourseDeadlines}
            />
          </TabsContent>
        </Tabs>
      </DashboardShell>
    </AuthGuard>
  );
}
"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { AuthGuard } from "@/components/AuthGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Upload, LogOut, Loader2, ExternalLink } from "lucide-react";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { DashboardDeadlines } from "@/components/dashboard/dashboard-deadlines";
import { DashboardCourses } from "@/components/dashboard/dashboard-courses";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { createApiService } from "@/lib/api";

export default function DashboardPage() {
  const { courses, exams, todos, deadlines, loading, refreshData } =
    useDashboardData();
  const { logout } = useAuth();
  const { toast } = useToast();
  const apiService = createApiService();
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);
  const [calendarUrl, setCalendarUrl] = useState<string | null>(null);

  // Function to handle redirect to onboarding page
  const router = useRouter();
  const navigateToOnboarding = () => {
    router.push("/onboarding");
  };

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<
    string | null
  >(null);

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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleAddCoursesToCalendar = async () => {
    setIsAddingToCalendar(true);
    try {
      const response = await apiService.addAllCoursesToCalendar();

      if (response.success) {
        toast({
          title: "Success!",
          description:
            response.message || "All courses added to your calendar.",
          variant: "default",
        });

        // Store the calendar URL if available
        if (response.addUrl) {
          setCalendarUrl(response.addUrl);
        }
      } else {
        toast({
          title: "Warning",
          description: response.message || "No courses were added to calendar.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding courses to calendar:", error);
      toast({
        title: "Error",
        description: "Failed to add courses to calendar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCalendar(false);
    }
  };

  const openCalendar = () => {
    if (calendarUrl) {
      window.open(calendarUrl, "_blank");
    }
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
              Upload Syllabi
            </Button>

            {calendarUrl ? (
              <Button variant="outline" onClick={openCalendar}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Calendar
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleAddCoursesToCalendar}
                disabled={isAddingToCalendar || courses.length === 0}
              >
                {isAddingToCalendar ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Add Courses to Calendar
                  </>
                )}
              </Button>
            )}

            <Button variant="ghost" onClick={handleLogout} className="ml-2">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
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

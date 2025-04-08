"use client";

import { useAuth } from "@/context/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { UserInfoCard } from "@/components/dashboard/UserInfoCard";
import { CourseFetcher } from "@/components/dashboard/CourseFetcher";
import { CourseList } from "@/components/dashboard/CourseList";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <AuthGuard>
      <div className="container mx-auto p-8">
        <DashboardHeader />

        {user && <UserInfoCard user={user} />}

        <CourseFetcher />

        {user && user.courses && user.courses.length > 0 ? (
          <CourseList courses={user.courses} />
        ) : (
          <p>You currently have no courses in your profile.</p>
        )}
      </div>
    </AuthGuard>
  );
}

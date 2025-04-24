"use client";

import { useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/AuthGuard";
import { useReviewData } from "@/hooks/use-review-data";
import { ErrorNotification } from "@/components/error-notification";

import Header from "@/components/review/header";
import PageTitle from "@/components/review/page-title";
import SyllabusPreview from "@/components/review/syllabus-preview";
import CourseInformation from "@/components/review/course-info";
import Deadlines from "@/components/review/deadline";
import Navigation from "@/components/review/navigation";

export default function SyllabusReviewPage() {
  const router = useRouter();
  const params = useParams();
  const syllabusId = Number.parseInt(params.id as string);
  const deadlinesContainerRef = useRef<HTMLDivElement>(null);
  
  const {
    syllabus,
    totalSyllabi,
    courseData,
    deadlines,
    searchResults,
    loading,
    error,
    notification,
    searchQuery,
    instructorOpen,
    instructors,
    setSearchQuery,
    handleCourseInputChange,
    handleDeadlineChange,
    handleAddDeadline,
    handleRemoveDeadline,
    handleCourseSelect,
    handleInstructorSelect,
    saveCourseAndDeadlines,
    setNotification,
    setInstructorOpen,
    skipCurrentSyllabus,
  } = useReviewData(syllabusId);

  // Helper function to scroll to the bottom of deadlines container
  const scrollToBottom = () => {
    if (deadlinesContainerRef.current) {
      const container = deadlinesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  };

  // Add deadline and scroll to it
  const handleAddDeadlineAndScroll = () => {
    handleAddDeadline();
    setTimeout(scrollToBottom, 100);
  };

  const handleNext = async () => {
    const success = await saveCourseAndDeadlines();
    
    if (success) {
      setTimeout(() => {
        if (syllabusId < totalSyllabi) {
          router.push(`/review/${syllabusId + 1}`);
        } else {
          router.push("/dashboard");
        }
      }, 1500);
    }
  };

  const handleSkipCourse = async () => {
    if (window.confirm("Are you sure you want to skip this course? It won't be added to your account.")) {
      const success = skipCurrentSyllabus();
      
      if (success) {
        // Navigate to next syllabus or dashboard
        setTimeout(() => {
          if (syllabusId < totalSyllabi) {
            router.push(`/review/${syllabusId + 1}`);
          } else {
            router.push("/dashboard");
          }
        }, 1000);
      }
    }
  };

  const handlePrevious = () => {
    if (syllabusId > 1) {
      router.push(`/review/${syllabusId - 1}`);
    }
  };

  // Map eventType to UI-friendly display names
  const getEventTypeDisplayName = (eventType: string): string => {
    const typeMap: Record<string, string> = {
      "readings": "Reading",
      "memos": "Memo",
      "assignments": "Assignment",
      "exams": "Exam",
      "projects": "Project",
      "presentations": "Presentation"
    };
    
    return typeMap[eventType] || eventType.charAt(0).toUpperCase() + eventType.slice(1);
  };

  // Loading state
  if (loading.syllabi) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => setNotification(null)}>Retry</Button>
      </div>
    );
  }

  if (!syllabus || !syllabus.id) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        No syllabus found with ID: {syllabusId}
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <Header syllabusId={syllabusId} totalSyllabi={totalSyllabi} />

        <main className="flex-1 py-6">
          <div className="container px-4 md:px-6">
            {notification && (
              <div className="mb-4">
                <ErrorNotification
                  type={notification.type}
                  message={notification.message}
                  onDismiss={() => setNotification(null)}
                />
              </div>
            )}

            <PageTitle 
              courseCode={syllabus.extractedData?.courseCode} 
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <SyllabusPreview 
                content={syllabus.parsedContent} 
              />
              
              <CourseInformation
                courseData={courseData}
                searchQuery={searchQuery}
                searchResults={searchResults}
                loading={loading}
                setSearchQuery={setSearchQuery}
                handleCourseInputChange={handleCourseInputChange}
                handleCourseSelect={handleCourseSelect}
                instructorOpen={instructorOpen}
                setInstructorOpen={setInstructorOpen}
                instructors={instructors}
                handleInstructorSelect={handleInstructorSelect}
              />

              <Deadlines
                deadlines={deadlines}
                handleAddDeadline={handleAddDeadlineAndScroll}
                handleRemoveDeadline={handleRemoveDeadline}
                handleDeadlineChange={handleDeadlineChange}
                loading={loading}
                getEventTypeDisplayName={getEventTypeDisplayName}
                deadlinesContainerRef={deadlinesContainerRef}
              />
            </div>

            <Navigation
              syllabusId={syllabusId}
              totalSyllabi={totalSyllabi}
              handlePrevious={handlePrevious}
              handleNext={handleNext}
              handleSkip={handleSkipCourse}
              loading={loading}
            />
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
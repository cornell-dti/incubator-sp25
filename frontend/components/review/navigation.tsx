"use client";

import type React from "react";

import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  syllabusId: number;
  totalSyllabi: number;
  handlePrevious: () => void;
  handleNext: () => void;
  handleSkip: () => void;
  loading: {
    saving: boolean;
  };
}

const Navigation: React.FC<NavigationProps> = ({
  syllabusId,
  totalSyllabi,
  handlePrevious,
  handleNext,
  handleSkip,
  loading,
}) => {
  return (
    <div className="flex items-center justify-between w-full px-4 py-3 bg-gradient-to-b from-white/80 to-white border-t shadow-sm">
      <Button
        variant="outline"
        onClick={handlePrevious}
        disabled={syllabusId <= 1 || loading.saving}
        className="min-w-[100px] transition-all"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Previous
      </Button>

      <div className="flex items-center">
        <span className="text-sm text-muted-foreground mx-4 hidden sm:block">
          {syllabusId} of {totalSyllabi}
        </span>
        <Button
          variant="outline"
          onClick={handleSkip}
          disabled={loading.saving}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
        >
          <X className="mr-2 h-4 w-4" />
          Skip
        </Button>
      </div>

      <Button
        onClick={handleNext}
        className="bg-rose-500 hover:bg-rose-600 min-w-[100px] shadow-sm transition-all"
        disabled={loading.saving}
      >
        {loading.saving ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Saving...
          </span>
        ) : syllabusId < totalSyllabi ? (
          <>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        ) : (
          <>
            Finish
            <Check className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
};

export default Navigation;

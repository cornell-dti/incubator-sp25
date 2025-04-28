"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Upload } from "lucide-react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface SyllabusUploaderProps {
  onUploaded?: () => void;
}

export function SyllabusUploader({ onUploaded }: SyllabusUploaderProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];

      if (validTypes.includes(droppedFile.type)) {
        setFile(droppedFile);
        setError("");
      } else {
        setError("Please upload only PDF, DOCX, or TXT files.");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError("");

    try {
      // Create FormData for the file
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "http://localhost:3000/api/syllabi/parsed",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 80) / (progressEvent.total || 0)
            );
            setProgress(Math.min(percentCompleted, 80));
          },
        }
      );

      setProgress(99);

      // Get the parsed data
      const parsedData = response.data;

      // Create the parsed syllabus object
      const parsedSyllabus = {
        id: 1,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        parsedContent: parsedData.text || "",
        extractedData: parsedData.syllabus || {
          courseCode: parsedData.courseCode || "",
          courseName: parsedData.courseName || "",
          instructor: parsedData.instructor || "",
          deadlines: parsedData.deadlines || [],
        },
      };

      // Create an array with just this syllabus
      const syllabi = [parsedSyllabus];

      // Store parsed syllabi in localStorage for the review page
      localStorage.setItem("parsedSyllabi", JSON.stringify(syllabi));

      // Final progress
      setProgress(100);

      // Set uploaded to true if staying on page, or navigate
      setTimeout(() => {
        setUploading(false);

        if (onUploaded && typeof onUploaded === "function") {
          onUploaded();
        } else {
          setUploaded(true);
          // Or navigate to review page
          router.push("/review/1");
        }
      }, 500);
    } catch (error) {
      console.error("Error processing file:", error);
      setError("Failed to process the syllabus. Please try again.");
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {!uploaded ? (
        <>
          <div className="flex items-center justify-center flex-1 w-full">
            <label
              htmlFor="syllabus-upload"
              className={`flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-lg cursor-pointer ${
                isDragging
                  ? "bg-muted/70 border-primary"
                  : "bg-muted/50 hover:bg-muted/70 border-muted-foreground/20"
              }`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOCX, or TXT (MAX. 10MB)
                </p>
              </div>
              <input
                id="syllabus-upload"
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {file && (
            <div className="space-y-2">
              <p className="text-sm">Selected file: {file.name}</p>
              {uploading ? (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {progress < 80
                      ? `Uploading syllabus... ${progress}%`
                      : progress === 99
                        ? "Processing syllabus... 99%"
                        : `Finalizing... ${progress}%`}
                  </p>
                </div>
              ) : (
                <Button
                  onClick={handleUpload}
                  className="w-full bg-rose-500 hover:bg-rose-600"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload & Parse
                </Button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg bg-green-50 p-4 text-green-800">
            <p className="text-sm font-medium">Syllabus successfully parsed!</p>
            <p className="text-xs">
              Your syllabus has been processed and is ready for review.
            </p>
          </div>
          <Button className="w-full" onClick={() => router.push("/review/1")}>
            <Calendar className="mr-2 h-4 w-4" />
            Review Syllabus
          </Button>
        </div>
      )}
    </div>
  );
}

// Add a default prop for TypeScript
SyllabusUploader.defaultProps = {
  onUploaded: null,
};

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Calendar, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AuthGuard } from "@/components/AuthGuard";

// Define proper types for parsed syllabus data
interface ExtractedData {
  courseCode: string;
  courseName: string;
  instructor: string;
  deadlines: any[];
}

interface ParsedSyllabus {
  id: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  parsedContent: string;
  extractedData: ExtractedData;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Add new files to existing files instead of replacing them
      const newFiles = Array.from(e.target.files);
      // Create a Map with filename as key to avoid duplicates
      const filesMap = new Map<string, File>();

      // Add existing files to map
      files.forEach((file) => {
        filesMap.set(file.name, file);
      });

      // Add new files to map (will overwrite if same filename)
      newFiles.forEach((file) => {
        filesMap.set(file.name, file);
      });

      // Convert map values back to array
      setFiles(Array.from(filesMap.values()));
      setError("");
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];

      // Check if all files are valid
      const invalidFiles = droppedFiles.filter(
        (file) => !validTypes.includes(file.type)
      );

      if (invalidFiles.length > 0) {
        setError("Please upload only PDF, DOCX, or TXT files.");
        return;
      }

      // Add new files to existing files
      const filesMap = new Map<string, File>();

      // Add existing files to map
      files.forEach((file) => {
        filesMap.set(file.name, file);
      });

      // Add new files to map (will overwrite if same filename)
      droppedFiles.forEach((file) => {
        filesMap.set(file.name, file);
      });

      // Convert map values back to array
      setFiles(Array.from(filesMap.values()));
      setError("");
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);
    setError("");

    try {
      const parsedSyllabi: ParsedSyllabus[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileProgress = Math.round((i / files.length) * 100);
        setProgress(fileProgress);

        // Create FormData for specific file
        const formData = new FormData();
        formData.append("file", file);

        // Send file to parsing endpoint
        const response = await axios.post<{
          text?: string;
          syllabus?: ExtractedData;
          courseCode?: string;
          courseName?: string;
          instructor?: string;
          deadlines?: any[];
        }>("http://localhost:3000/api/syllabi/parsed", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 0)
            );
            // Adjust progress to reflect both file index and upload progress
            const adjustedProgress = Math.round(
              (i / files.length) * 100 + percentCompleted / files.length
            );
            setProgress(Math.min(adjustedProgress, 99));
          },
        });

        // Get the parsed data
        const parsedData = response.data;
        parsedSyllabi.push({
          id: i + 1,
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
        });
      }

      // Store parsed syllabi in localStorage for the review page
      localStorage.setItem("parsedSyllabi", JSON.stringify(parsedSyllabi));

      setProgress(100);

      // Navigate to the first syllabus review page
      setTimeout(() => {
        setUploading(false);
        router.push("/review/1");
      }, 500);
    } catch (error) {
      console.error("Error processing files:", error);
      setError("Failed to process syllabi. Please try again.");
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-rose-500" />
              <span className="font-bold">SyllabusSync</span>
            </div>
          </div>
        </header>
        <main className="flex-1 py-12">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl space-y-8">
              <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Welcome to SyllabusSync
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  Let's get started by uploading your syllabi
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Upload Your Syllabi</CardTitle>
                  <CardDescription>
                    Upload all your course syllabi at once. We'll help you
                    organize them in the next step.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="syllabi-upload"
                      className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer ${
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
                        <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PDF, DOCX, or TXT (MAX. 10MB per file)
                        </p>
                      </div>
                      <input
                        id="syllabi-upload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileChange}
                        multiple
                      />
                    </label>
                  </div>

                  {error && (
                    <div className="text-sm text-red-600 text-center">
                      {error}
                    </div>
                  )}

                  {files.length > 0 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">
                          Selected Files ({files.length})
                        </h3>
                        <ul className="space-y-1 max-h-40 overflow-y-auto border rounded-md p-2">
                          {files.map((file, index) => (
                            <li
                              key={index}
                              className="text-sm flex items-center justify-between p-1 hover:bg-muted/30 rounded-sm"
                            >
                              <span className="truncate flex-1">
                                {file.name}
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-muted-foreground">
                                  {(file.size / 1024).toFixed(1)} KB
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFile(file.name)}
                                  className="text-muted-foreground hover:text-red-500 focus:outline-none"
                                  aria-label={`Remove ${file.name}`}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {uploading ? (
                        <div className="space-y-2">
                          <Progress value={progress} className="h-2" />
                          <p className="text-xs text-muted-foreground text-center">
                            {progress < 99
                              ? `Uploading syllabi... ${progress}%`
                              : `Processing syllabi... ${progress}%`}
                          </p>
                        </div>
                      ) : (
                        <Button
                          onClick={handleUpload}
                          className="w-full bg-rose-500 hover:bg-rose-600"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload & Continue
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="text-center text-sm text-muted-foreground">
                <p>
                  You can always add more syllabi later from your dashboard.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

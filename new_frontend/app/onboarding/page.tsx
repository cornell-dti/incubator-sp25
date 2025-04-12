"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Upload } from "lucide-react";

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

export default function OnboardingPage() {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = () => {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          router.push("/onboarding/review/1"); // Navigate to first syllabus review
          return 100;
        }
        return prev + 5;
      });
    }, 200);
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
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70 border-muted-foreground/20"
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
                              className="text-sm flex items-center justify-between"
                            >
                              <span className="truncate">{file.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(1)} KB
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {uploading ? (
                        <div className="space-y-2">
                          <Progress value={progress} className="h-2" />
                          <p className="text-xs text-muted-foreground text-center">
                            Uploading and parsing syllabi... {progress}%
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

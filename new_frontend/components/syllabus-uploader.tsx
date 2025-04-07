"use client"

import type React from "react"

import { useState } from "react"
import { Calendar, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export function SyllabusUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploaded, setUploaded] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (!file) return

    setUploading(true)
    setProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploading(false)
          setUploaded(true)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  return (
    <div className="space-y-4">
      {!uploaded ? (
        <>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="syllabus-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70 border-muted-foreground/20"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">PDF, DOCX, or TXT (MAX. 10MB)</p>
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
          {file && (
            <div className="space-y-2">
              <p className="text-sm">Selected file: {file.name}</p>
              {uploading ? (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">Uploading and parsing syllabus...</p>
                </div>
              ) : (
                <Button onClick={handleUpload} className="w-full bg-rose-500 hover:bg-rose-600">
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
            <p className="text-xs">We found 5 deadlines and 2 exams in your syllabus.</p>
          </div>
          <Button className="w-full">
            <Calendar className="mr-2 h-4 w-4" />
            Add to Calendar
          </Button>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, ArrowRight, Calendar, Check, ChevronDown, FileText, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"

// Sample data - in a real app this would come from an API
const sampleSyllabi = [
  {
    id: 1,
    fileName: "CS4700_Syllabus.pdf",
    content: `
      CS 4700: Foundations of Artificial Intelligence
      
      Instructor: Dr. Smith
      Email: smith@cornell.edu
      Office Hours: Monday 2-4pm, Gates Hall 345
      
      Course Description:
      This course introduces the fundamental concepts and techniques in artificial intelligence, including search, knowledge representation, reasoning, planning, and machine learning.
      
      Grading:
      - Homework: 40%
      - Midterm: 20%
      - Final Project: 30%
      - Participation: 10%
      
      Important Dates:
      - Homework 1: September 15
      - Midterm Exam: October 5
      - Project Proposal: October 20
      - Final Project Due: December 15
    `,
    extractedData: {
      courseCode: "CS 4700",
      courseName: "Foundations of Artificial Intelligence",
      instructor: "Dr. Smith",
      deadlines: [
        { id: 1, title: "Homework 1", dueDate: "2023-09-15", type: "Assignment" },
        { id: 2, title: "Midterm Exam", dueDate: "2023-10-05", type: "Exam" },
        { id: 3, title: "Project Proposal", dueDate: "2023-10-20", type: "Assignment" },
        { id: 4, title: "Final Project", dueDate: "2023-12-15", type: "Project" },
      ],
    },
  },
  {
    id: 2,
    fileName: "MATH2940_Syllabus.pdf",
    content: `
      MATH 2940: Linear Algebra
      
      Instructor: Dr. Johnson
      Email: johnson@cornell.edu
      Office Hours: Wednesday 1-3pm, Malott Hall 222
      
      Course Description:
      Introduction to linear algebra, including vector spaces, linear transformations, eigenvalues, and applications.
      
      Grading:
      - Problem Sets: 30%
      - Midterm 1: 20%
      - Midterm 2: 20%
      - Final Exam: 30%
      
      Important Dates:
      - Problem Set 1: September 10
      - Problem Set 2: September 25
      - Midterm 1: October 10
      - Problem Set 3: October 30
      - Midterm 2: November 15
      - Final Exam: December 20
    `,
    extractedData: {
      courseCode: "MATH 2940",
      courseName: "Linear Algebra",
      instructor: "Dr. Johnson",
      deadlines: [
        { id: 1, title: "Problem Set 1", dueDate: "2023-09-10", type: "Assignment" },
        { id: 2, title: "Problem Set 2", dueDate: "2023-09-25", type: "Assignment" },
        { id: 3, title: "Midterm 1", dueDate: "2023-10-10", type: "Exam" },
        { id: 4, title: "Problem Set 3", dueDate: "2023-10-30", type: "Assignment" },
        { id: 5, title: "Midterm 2", dueDate: "2023-11-15", type: "Exam" },
        { id: 6, title: "Final Exam", dueDate: "2023-12-20", type: "Exam" },
      ],
    },
  },
  {
    id: 3,
    fileName: "ENGL1100_Syllabus.pdf",
    content: `
      ENGL 1100: Writing in the Disciplines
      
      Instructor: Dr. Williams
      Email: williams@cornell.edu
      Office Hours: Thursday 10am-12pm, Goldwin Smith Hall 123
      
      Course Description:
      This course focuses on developing writing skills for academic and professional contexts across various disciplines.
      
      Grading:
      - Essays: 60%
      - Presentations: 20%
      - Participation: 20%
      
      Important Dates:
      - Essay 1 Draft: September 22
      - Essay 1 Final: October 6
      - Presentation 1: October 27
      - Essay 2 Draft: November 10
      - Essay 2 Final: November 30
      - Final Presentation: December 8
    `,
    extractedData: {
      courseCode: "ENGL 1100",
      courseName: "Writing in the Disciplines",
      instructor: "Dr. Williams",
      deadlines: [
        { id: 1, title: "Essay 1 Draft", dueDate: "2023-09-22", type: "Assignment" },
        { id: 2, title: "Essay 1 Final", dueDate: "2023-10-06", type: "Assignment" },
        { id: 3, title: "Presentation 1", dueDate: "2023-10-27", type: "Presentation" },
        { id: 4, title: "Essay 2 Draft", dueDate: "2023-11-10", type: "Assignment" },
        { id: 5, title: "Essay 2 Final", dueDate: "2023-11-30", type: "Assignment" },
        { id: 6, title: "Final Presentation", dueDate: "2023-12-08", type: "Presentation" },
      ],
    },
  },
]

// Sample Cornell course list for autocomplete
const cornellCourses = [
  { code: "CS 4700", name: "Foundations of Artificial Intelligence" },
  { code: "CS 4780", name: "Machine Learning for Intelligent Systems" },
  { code: "CS 3110", name: "Data Structures and Functional Programming" },
  { code: "MATH 2940", name: "Linear Algebra" },
  { code: "MATH 3110", name: "Introduction to Analysis" },
  { code: "ENGL 1100", name: "Writing in the Disciplines" },
  { code: "ENGL 2880", name: "Expository Writing" },
  { code: "PHYS 2213", name: "Physics II: Electromagnetism" },
  { code: "CHEM 2070", name: "General Chemistry I" },
  { code: "ECON 1110", name: "Introductory Microeconomics" },
]

// Add this sample instructor list after the cornellCourses array
const cornellInstructors = [
  { id: 1, name: "Dr. Smith", department: "Computer Science" },
  { id: 2, name: "Dr. Johnson", department: "Mathematics" },
  { id: 3, name: "Dr. Williams", department: "English" },
  { id: 4, name: "Dr. Chen", department: "Computer Science" },
  { id: 5, name: "Dr. Patel", department: "Physics" },
  { id: 6, name: "Dr. Garcia", department: "Chemistry" },
  { id: 7, name: "Dr. Kim", department: "Economics" },
  { id: 8, name: "Dr. Brown", department: "Biology" },
  { id: 9, name: "Dr. Davis", department: "History" },
  { id: 10, name: "Dr. Wilson", department: "Psychology" },
]

export default function SyllabusReviewPage() {
  const router = useRouter()
  const params = useParams()
  const syllabusId = Number.parseInt(params.id as string)

  const [syllabus, setSyllabus] = useState(null)
  const [courseData, setCourseData] = useState({
    courseCode: "",
    courseName: "",
    instructor: "",
  })
  const [deadlines, setDeadlines] = useState([])
  const [editingDeadlineId, setEditingDeadlineId] = useState(null)
  const [open, setOpen] = useState(false)
  const [totalSyllabi, setTotalSyllabi] = useState(sampleSyllabi.length)

  // Add this state for the instructor dropdown
  const [instructorOpen, setInstructorOpen] = useState(false)

  useEffect(() => {
    // In a real app, this would be an API call
    const currentSyllabus = sampleSyllabi.find((s) => s.id === syllabusId)
    if (currentSyllabus) {
      setSyllabus(currentSyllabus)
      setCourseData({
        courseCode: currentSyllabus.extractedData.courseCode,
        courseName: currentSyllabus.extractedData.courseName,
        instructor: currentSyllabus.extractedData.instructor,
      })
      setDeadlines(currentSyllabus.extractedData.deadlines)
    }
  }, [syllabusId])

  const handleCourseSelect = (selectedCourse) => {
    setCourseData({
      ...courseData,
      courseCode: selectedCourse.code,
      courseName: selectedCourse.name,
    })
    setOpen(false)
  }

  const handleInputChange = (field, value) => {
    setCourseData({
      ...courseData,
      [field]: value,
    })
  }

  const handleDeadlineChange = (id, field, value) => {
    setDeadlines(deadlines.map((deadline) => (deadline.id === id ? { ...deadline, [field]: value } : deadline)))
  }

  const handleNext = () => {
    // In a real app, you would save the changes
    if (syllabusId < totalSyllabi) {
      router.push(`/onboarding/review/${syllabusId + 1}`)
    } else {
      router.push("/dashboard")
    }
  }

  const handlePrevious = () => {
    if (syllabusId > 1) {
      router.push(`/onboarding/review/${syllabusId - 1}`)
    }
  }

  if (!syllabus) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-rose-500" />
            <span className="font-bold">SyllabusSync</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Syllabus {syllabusId} of {totalSyllabi}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 py-6">
        <div className="container px-4 md:px-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Review Syllabus: {syllabus.fileName}</h1>
            <p className="text-muted-foreground">Review and edit the extracted information from your syllabus</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Syllabus Preview */}
            <Card className="lg:col-span-1">
              <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Syllabus Preview</h2>
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="h-[70vh] overflow-y-auto border rounded-md p-4 bg-muted/30 font-mono text-sm whitespace-pre-wrap">
                  {syllabus.content}
                </div>
              </CardContent>
            </Card>

            {/* Course Information */}
            <Card className="lg:col-span-1">
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-4">Course Information</h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="courseCode">Course Code</Label>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between"
                        >
                          {courseData.courseCode || "Select course code..."}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search Cornell courses..." />
                          <CommandList>
                            <CommandEmpty>No course found.</CommandEmpty>
                            <CommandGroup className="max-h-60 overflow-y-auto">
                              {cornellCourses.map((course) => (
                                <CommandItem
                                  key={course.code}
                                  value={course.code}
                                  onSelect={() => handleCourseSelect(course)}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      courseData.courseCode === course.code ? "opacity-100" : "opacity-0"
                                    }`}
                                  />
                                  {course.code} - {course.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="courseName">Course Name</Label>
                    <Input
                      id="courseName"
                      value={courseData.courseName}
                      onChange={(e) => handleInputChange("courseName", e.target.value)}
                      placeholder="Course name"
                    />
                  </div>

                  {/* Replace the instructor input field with this dropdown implementation */}
                  <div className="space-y-2">
                    <Label htmlFor="instructor">Instructor</Label>
                    <Popover open={instructorOpen} onOpenChange={setInstructorOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={instructorOpen}
                          className="w-full justify-between"
                        >
                          {courseData.instructor || "Select instructor..."}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search instructors..." />
                          <CommandList>
                            <CommandEmpty>No instructor found.</CommandEmpty>
                            <CommandGroup className="max-h-60 overflow-y-auto">
                              {cornellInstructors.map((instructor) => (
                                <CommandItem
                                  key={instructor.id}
                                  value={instructor.name}
                                  onSelect={() => {
                                    handleInputChange("instructor", instructor.name)
                                    setInstructorOpen(false)
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      courseData.instructor === instructor.name ? "opacity-100" : "opacity-0"
                                    }`}
                                  />
                                  {instructor.name} - {instructor.department}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deadlines */}
            <Card className="lg:col-span-1">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Deadlines</h2>
                  <Button
                    size="sm"
                    onClick={() => {
                      const newId = deadlines.length > 0 ? Math.max(...deadlines.map((d) => d.id)) + 1 : 1
                      setDeadlines([
                        ...deadlines,
                        {
                          id: newId,
                          title: "New Deadline",
                          dueDate: new Date().toISOString().split("T")[0],
                          type: "Assignment",
                        },
                      ])
                    }}
                    className="bg-rose-500 hover:bg-rose-600"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Deadline
                  </Button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {deadlines.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No deadlines found in this syllabus</p>
                  ) : (
                    deadlines.map((deadline) => (
                      <div key={deadline.id} className="border rounded-md p-3 space-y-2 relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-100"
                          onClick={() => setDeadlines(deadlines.filter((d) => d.id !== deadline.id))}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete deadline</span>
                        </Button>

                        <div className="space-y-2">
                          <Label htmlFor={`deadline-title-${deadline.id}`}>Title</Label>
                          <Input
                            id={`deadline-title-${deadline.id}`}
                            value={deadline.title}
                            onChange={(e) => handleDeadlineChange(deadline.id, "title", e.target.value)}
                            placeholder="Deadline title"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`deadline-type-${deadline.id}`}>Type</Label>
                          <Select
                            value={deadline.type}
                            onValueChange={(value) => handleDeadlineChange(deadline.id, "type", value)}
                          >
                            <SelectTrigger id={`deadline-type-${deadline.id}`}>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Assignment">Assignment</SelectItem>
                              <SelectItem value="Exam">Exam</SelectItem>
                              <SelectItem value="Quiz">Quiz</SelectItem>
                              <SelectItem value="Project">Project</SelectItem>
                              <SelectItem value="Paper">Paper</SelectItem>
                              <SelectItem value="Presentation">Presentation</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`deadline-date-${deadline.id}`}>Due Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                                id={`deadline-date-${deadline.id}`}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {deadline.dueDate ? (
                                  format(new Date(deadline.dueDate), "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={new Date(deadline.dueDate)}
                                onSelect={(date) =>
                                  handleDeadlineChange(deadline.id, "dueDate", date.toISOString().split("T")[0])
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={syllabusId <= 1}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <Button onClick={handleNext} className="bg-rose-500 hover:bg-rose-600">
              {syllabusId < totalSyllabi ? (
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
        </div>
      </main>
    </div>
  )
}

import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Course } from "@/@types";

interface CourseData {
  courseCode: string;
  courseName: string;
  instructor: string;
}

interface LoadingState {
  courses: boolean;
  instructors: boolean;
  saving: boolean;
  syllabi: boolean;
}

interface CourseInformationProps {
  courseData: CourseData;
  searchQuery: string;
  searchResults: Course[];
  loading: LoadingState;
  setSearchQuery: (query: string) => void;
  handleCourseInputChange: (field: string, value: string) => void;
  handleCourseSelect: (course: Course) => void;
  instructorOpen: boolean;
  setInstructorOpen: (open: boolean) => void;
  instructors: string[];
  handleInstructorSelect: (instructor: string) => void;
}

const CourseInformation: React.FC<CourseInformationProps> = ({
  courseData,
  searchQuery,
  searchResults,
  loading,
  setSearchQuery,
  handleCourseInputChange,
  handleCourseSelect,
  instructorOpen,
  setInstructorOpen,
  instructors,
  handleInstructorSelect,
}) => {
  return (
    <Card className="lg:col-span-1">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-4">Course Information</h2>

        <div className="space-y-4">
          {/* Course Code Selection */}
          <div className="space-y-2">
            <Label htmlFor="courseCode">Course Code</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={true}
                  className="w-full justify-between"
                >
                  {courseData.courseCode || "Select course code..."}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput
                    placeholder="Search Cornell courses..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    {loading.courses ? (
                      <CommandItem disabled>Searching...</CommandItem>
                    ) : searchQuery.length < 2 ? (
                      <CommandItem disabled>
                        Type at least 2 characters to search
                      </CommandItem>
                    ) : searchResults.length === 0 ? (
                      <CommandEmpty>No courses found</CommandEmpty>
                    ) : (
                      <CommandGroup className="max-h-60 overflow-y-auto">
                        {searchResults.map((course) => (
                          <CommandItem
                            key={course.id}
                            value={course.courseCode}
                            onSelect={() => handleCourseSelect(course)}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                courseData.courseCode === course.courseCode
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            {course.courseCode} - {course.courseName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Course Name Input */}
          <div className="space-y-2">
            <Label htmlFor="courseName">Course Name</Label>
            <Input
              id="courseName"
              value={courseData.courseName}
              onChange={(e) =>
                handleCourseInputChange("courseName", e.target.value)
              }
              placeholder="Course name"
            />
          </div>

          {/* Instructor Selection */}
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
                  <CommandList>
                    {loading.instructors ? (
                      <CommandItem disabled>Loading instructors...</CommandItem>
                    ) : instructors.length === 0 ? (
                      <CommandEmpty>No instructors available</CommandEmpty>
                    ) : (
                      <CommandGroup className="max-h-60 overflow-y-auto">
                        {instructors.map((instructor) => (
                          <CommandItem
                            key={instructor}
                            value={instructor}
                            onSelect={() => handleInstructorSelect(instructor)}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                courseData.instructor === instructor
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            {instructor}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseInformation;
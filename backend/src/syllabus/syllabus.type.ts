export interface Syllabus {
  id?: string;
  courseId: string;
  semester: string;
  // instructor: string;
  syllabusUploadPath: string;
  events: string[];
  // todos: string[];
  // gradingPolicy: Map<string, number>;
}

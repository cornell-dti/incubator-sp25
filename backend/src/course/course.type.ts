import { Syllabus } from "../syllabus/syllabus.type";

export interface Course {
  id?: string;
  courseCode: string;
  courseName: string;
  semesters: string[];
  syllabi: Syllabus[];
}

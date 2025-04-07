import { Syllabus } from "../syllabus/syllabus.type";

export interface Course {
  id?: string;
  courseCode: string;
  courseName: string;
  semester: string;
  sections: {
    sectionId: string;
    instructor: string;
  }[];
  // syllabi: Syllabus[];
}

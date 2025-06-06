import axios from "axios";
import { db } from "../../config/firebase";
import { Course } from "../../types";
import { ApiSubject } from "../subject/subject.service";

// Interface representing a class from the API
export interface ApiClass {
  subject: string;
  catalogNbr: string;
  titleLong: string;
  enrollGroups: {
    classSections: {
      section: string;
      ssrComponent: string;
      meetings: {
        instructors: {
          firstName: string;
          lastName: string;
        }[];
      }[];
    }[];
  }[];
}

/**
 * Service for handling course-related API calls and database operations
 */
export class CourseService {
  private baseUrl: string = "https://classes.cornell.edu/api/2.0";

  /**
   * Fetches all classes for a specific subject and semester
   *
   * @param semester Course roster semester (e.g., FA23)
   * @param subject Subject code
   * @returns Array of classes or null if error
   */
  async fetchClassesForSubject(
    semester: string,
    subject: string
  ): Promise<ApiClass[] | null> {
    try {
      const result = await axios.get(
        `${this.baseUrl}/search/classes.json?roster=${semester}&subject=${subject}`,
        { timeout: 30000 }
      );

      if (result.status !== 200 || result.data.status !== "success") {
        console.log(
          `Error fetching classes for ${semester}-${subject}: ${result.statusText}`
        );
        return null;
      }

      return result.data.data.classes;
    } catch (error) {
      console.error(
        `Error fetching classes for ${semester}-${subject}:`,
        error
      );
      return null;
    }
  }

  /**
   * Extracts instructors from a class object
   *
   * @param cls API class object
   * @returns Array of unique instructor name groups (grouped by enroll group i.e. different sections)
   */
  extractInstructors(
    cls: ApiClass
  ): { sectionId: string; instructor: string }[] {
    const sections: { sectionId: string; instructor: string }[] = [];

    if (!cls.enrollGroups || cls.enrollGroups.length === 0) {
      return [];
    }

    for (const enrollGroup of cls.enrollGroups) {
      let addAll = true;
      for (const section of enrollGroup.classSections || []) {
        if (section.ssrComponent === "LEC") {
          addAll = false;
        }
        if (!addAll && section.ssrComponent !== "LEC") {
          break;
        }
        const sectionId = section.section;
        const sectionInstructors: string[] = [];

        for (const meeting of section.meetings || []) {
          for (const instructor of meeting.instructors || []) {
            const fullName = `${instructor.firstName} ${instructor.lastName}`;
            sectionInstructors.push(fullName);
          }
        }

        // If we found instructors for this section, add it to our sections array
        if (sectionInstructors.length > 0) {
          sections.push({
            sectionId,
            instructor: sectionInstructors.join(", "),
          });
        }
      }
    }

    return sections;
  }

  /**
   * Saves or updates a course in the database
   * Always updates existing courses with new information
   *
   * @param course Course data to save or update
   * @param semester Current semester being processed (for logging only)
   * @returns true if successful, false otherwise
   */
  async saveCourse(course: Course, semester: string): Promise<boolean> {
    try {
      // Check if the course already exists by course code
      const existingCourseDocs = await db
        .collection("courses")
        .where("courseCode", "==", course.courseCode)
        .limit(1)
        .get();

      if (!existingCourseDocs.empty) {
        // Update the existing course with new information
        const docRef = existingCourseDocs.docs[0].ref;

        // Update the document with new information
        await docRef.update({
          courseName: course.courseName,
          sections: course.sections,
          // syllabi: course.syllabi,
        });

        console.log(
          `    Updated course: ${course.courseCode} - ${course.courseName} for semester ${semester} with instructors: ${course.sections.join(" | ")}`
        );
        return true;
      }

      // Create a new course if it doesn't exist
      await db.collection("courses").add(course);

      console.log(
        `    Added new course: ${course.courseCode} - ${course.courseName} for semester ${semester} with instructors: ${course.sections.join(" | ")}`
      );
      return true;
    } catch (error) {
      console.error(
        `    Error saving/updating course ${course.courseCode}:`,
        error
      );
      return false;
    }
  }

  /**
   * Processes all classes for a subject and saves them to the database
   *
   * @param subject Subject information
   * @param semester Semester code
   * @returns Number of successfully processed courses
   */
  async processSubjectClasses(
    subject: ApiSubject,
    semester: string
  ): Promise<number> {
    console.log(
      `--- Processing subject: ${subject.value} - ${subject.descrformal} ---`
    );

    const classes = await this.fetchClassesForSubject(semester, subject.value);
    if (!classes) {
      console.log(
        `Skipping subject ${subject.value} - No classes found or error occurred`
      );
      return 0;
    }

    console.log(`--- Found ${classes.length} classes for ${subject.value} ---`);

    let successCount = 0;

    for (const cls of classes) {
      try {
        const courseCode = `${cls.subject.toUpperCase()} ${cls.catalogNbr}`;

        // Extract instructors from the class
        const sections = this.extractInstructors(cls);

        // Create a new course object
        const course: Course = {
          courseCode,
          courseName: cls.titleLong,
          semester,
          sections,
          // syllabi: [], // This will be overwritten with existing syllabi if the course exists
        };

        // Save or update the course
        const success = await this.saveCourse(course, semester);

        if (success) {
          successCount++;
        }
      } catch (error) {
        console.error(
          `Error processing class ${cls.subject} ${cls.catalogNbr}:`,
          error
        );
      }
    }

    return successCount;
  }
}

export const courseService = new CourseService();

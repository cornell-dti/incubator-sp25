import axios from "axios";
import { db } from "../../config/firebase";
import { Course } from "../../course/course.type";
import { ApiSubject } from "../subject/subject.service";

// Interface representing a class from the API
export interface ApiClass {
  subject: string;
  catalogNbr: string;
  titleLong: string;
  enrollGroups: any[];
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
   * Saves a course to the database if it doesn't already exist for the given semester
   *
   * @param course Course data to save
   * @returns true if successful, false otherwise
   */
  async saveCourse(course: Course): Promise<boolean> {
    try {
      const existingCourses = await db
        .collection("courses")
        .where("courseCode", "==", course.courseCode)
        .where("semesters", "array-contains", course.semesters[0])
        .get();

      if (!existingCourses.empty) {
        console.log(
          `    Course ${course.courseCode} already exists for semesters ${course.semesters.join(", ")}`
        );
        return true;
      }

      await db.collection("courses").add(course);
      console.log(
        `    Added new course: ${course.courseCode} - ${course.courseName} for semesters ${course.semesters.join(", ")}`
      );
      return true;
    } catch (error) {
      console.error(`    Error saving course ${course.courseCode}:`, error);
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
        const existingCourse = await db
          .collection("courses")
          .where("courseCode", "==", courseCode)
          .limit(1)
          .get();

        let success;
        if (existingCourse.empty) {
          const newCourse: Course = {
            courseCode,
            courseName: cls.titleLong,
            semesters: [semester],
            syllabi: [],
          };

          success = await this.saveCourse(newCourse);
        } else {
          const docRef = existingCourse.docs[0].ref;
          const currentSemesters =
            existingCourse.docs[0].data().semesters || [];

          if (!currentSemesters.includes(semester)) {
            await docRef.update({
              semesters: [semester, ...currentSemesters],
            });
            success = true;
          } else {
            success = true;
          }
        }

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

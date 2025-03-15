import { subjectService } from "../subject/subject.service";
import { courseService } from "./course.service";

/**
 * Imports all courses for a specific semester
 *
 * @param semester Course roster semester (e.g., FA23)
 * @returns true if operation was successful, false otherwise
 */
export const importCourses = async (semester: string): Promise<boolean> => {
  try {
    console.log(`***** Starting course import for ${semester}... *****`);

    const subjects = await subjectService.fetchSubjects(semester);
    if (!subjects) {
      console.error(`Failed to fetch subjects for ${semester}`);
      return false;
    }

    console.log(
      `***** Found ${subjects.length} subjects for ${semester} *****`
    );

    let totalSuccess = 0;
    let errorCount = 0;

    for (const subject of subjects) {
      try {
        const successCount = await courseService.processSubjectClasses(
          subject,
          semester
        );
        totalSuccess += successCount;
      } catch (error) {
        console.error(`Error processing subject ${subject.value}:`, error);
        errorCount++;
      }
    }

    console.log(`Import complete for ${semester}`);
    console.log(`Total courses processed successfully: ${totalSuccess}`);
    console.log(`Total subject errors: ${errorCount}`);

    return errorCount === 0;
  } catch (error) {
    console.error(`Error importing courses for ${semester}:`, error);
    return false;
  }
};

/**
 * Imports courses for multiple semesters
 *
 * @param semesters Array of semesters to import
 * @returns true if all imports were successful, false otherwise
 */
export const importCoursesForSemesters = async (
  semesters: string[]
): Promise<boolean> => {
  let allSuccessful = true;

  for (const semester of semesters) {
    console.log(`***** Processing semester: ${semester} *****`);
    const success = await importCourses(semester);

    if (!success) {
      console.error(`Failed to import courses for ${semester}`);
      allSuccessful = false;
    }
  }

  return allSuccessful;
};

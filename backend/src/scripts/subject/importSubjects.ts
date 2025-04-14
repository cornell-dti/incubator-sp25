import { subjectService } from "./subject.service";

/**
 * Import subjects and store into the subjects collection database
 * @param semester current semester
 * @returns true if operation was successful, false otherwise
 */
export const importSubjects = async (semester: string): Promise<Boolean> => {
  try {
    const result = await subjectService.saveSubjects(semester);
    if (!result) {
      console.log(`Error in importing subjects for ${semester}`);
      return false;
    }
    console.log(`Successfully imported subjects for ${semester}`);
    return true;
  } catch (error) {
    console.error(`Unable to import subjects for ${semester}`);
    return false;
  }
};

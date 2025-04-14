import axios from "axios";
import { db } from "../../config/firebase";
import { Subject } from "../../types";

// Interface representing a subject from the API
export interface ApiSubject {
  value: string;
  descrformal: string;
}

/**
 * Service for handling subject-related API calls
 */
export class SubjectService {
  private baseUrl: string = "https://classes.cornell.edu/api/2.0";

  /**
   * Fetches all available subjects for a given semester
   *
   * @param semester Course roster semester (e.g., FA23)
   * @returns Array of subjects or null if error
   */
  async fetchSubjects(semester: string): Promise<ApiSubject[] | null> {
    try {
      console.log(`***** Fetching subjects for ${semester}... *****`);

      const result = await axios.get(
        `${this.baseUrl}/config/subjects.json?roster=${semester}`,
        { timeout: 30000 }
      );

      if (result.status !== 200 || result.data.status !== "success") {
        console.log(
          `Error fetching subjects for ${semester}: ${result.statusText}`
        );
        return null;
      }

      return result.data.data.subjects;
    } catch (error) {
      console.error(`Error fetching subjects for ${semester}:`, error);
      return null;
    }
  }

  async saveSubjects(semester: string): Promise<Boolean> {
    try {
      const subjects = await this.fetchSubjects(semester);
      if (!subjects || subjects === null) {
        console.log(`Unable to find subjects for ${semester}`);
        return false;
      }
      for (const subject of subjects) {
        const subRef = await db
          .collection("subjects")
          .where("subjectCode", "==", subject.value)
          .limit(1)
          .get();

        if (subRef.empty) {
          const newSubject: Subject = {
            subjectCode: subject.value,
            subjectName: subject.descrformal,
          };
          await db.collection("subjects").add(newSubject);
        }
      }
      console.log(`Completed saving subjects for ${semester}`);
      return true;
    } catch (error) {
      console.error(`Error saving subjects for ${semester}:`, error);
      return false;
    }
  }
}

export const subjectService = new SubjectService();

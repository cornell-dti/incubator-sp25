import axios from "axios";

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
}

export const subjectService = new SubjectService();

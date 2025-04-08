import axios from "axios";
import * as cheerio from "cheerio";

export interface ScrapeExam {
  courseCode: string;
  date: string;
  sectionId: string;
}

export interface ScrapeFinal {
  courseCode: string;
  date: string;
  time: string;
  type: string;
  sectionId: string;
}

export class SyllabusService {
  async prelimScraping(): Promise<ScrapeExam[]> {
    try {
      const response = await axios.get(
        "https://registrar.cornell.edu/exams/spring-prelim-schedule"
      );
      const selector = cheerio.load(response.data);
      const examData: ScrapeExam[] = [];
      const preContent = selector("pre").text();

      if (!preContent) {
        console.log("No <pre> content found on the page");
        return [];
      }

      const lines = preContent.split("\n").filter((line) => line.trim());
      const examLines = lines.slice(2);

      for (const line of examLines) {
        if (!line.trim()) continue;

        // First, let's extract the course code (at the beginning of the line)
        const courseCodeMatch = line.match(/^([A-Z]+)\s+(\d{4})\s+(\d{3})?/);
        if (!courseCodeMatch) continue;

        let courseCode = `${courseCodeMatch[1]} ${courseCodeMatch[2]}`;

        const section = courseCodeMatch[3] || "";

        // Now extract the date part (after day of week)
        const dateMatch = line.match(
          /(?:Mon|Tue|Wed|Thu|Fri),\s+((?:Jan|Feb|Mar|Apr|May)\s+\d{1,2})/
        );
        if (!dateMatch) continue;

        const date = dateMatch[1].trim();

        examData.push({
          courseCode,
          date,
          sectionId: section,
        });
      }
      console.log(`Found ${examData.length} exam entries`);
      return examData;
    } catch (error) {
      console.error("Error scraping data:", error);
      return [];
    }
  }

  async finalScraping(): Promise<ScrapeFinal[]> {
    try {
      const response = await axios.get(
        "https://registrar.cornell.edu/exams/spring-final-exam-schedule"
      );
      const selector = cheerio.load(response.data);
      const examData: ScrapeFinal[] = [];
      const preContent = selector("pre").text();

      if (!preContent) {
        console.log("No <pre> content found on the page");
        return [];
      }

      const lines = preContent.split("\n").filter((line) => line.trim());

      // Skip header line if it exists
      const dataLines =
        lines[0].includes("Exam") && lines[0].includes("Date")
          ? lines.slice(1)
          : lines;

      for (const line of dataLines) {
        if (!line.trim()) continue;

        // Extract course code (department and number)
        const courseMatch = line.match(/^([A-Z]+)\s+(\d{4})\s+(\d{3})?/);
        if (!courseMatch) continue;

        const dept = courseMatch[1];
        const courseNum = courseMatch[2];
        const courseCode = `${dept} ${courseNum}`;

        const section = courseMatch[3];

        // Extract date and time using regex patterns
        const dateMatch = line.match(/\s+(\d{1,2}\/\d{1,2}\/\d{4})\s+/);
        const timeMatch = line.match(/\s+(\d{1,2}:\d{2}\s*[AP]M)\s+/);
        const typeMatch = line.match(/\s+\d{1,2}:\d{2}\s*[AP]M\s+(.+)$/);

        // differentiate between deliverables and in-person exams
        let finalType;
        if (typeMatch && typeMatch[1].includes("Final")) {
          finalType = "Deadline";
        } else {
          finalType = "Exam";
        }

        if (dateMatch && timeMatch) {
          examData.push({
            courseCode,
            date: dateMatch[1],
            time: timeMatch[1],
            type: finalType,
            sectionId: section,
          });
        }
      }

      console.log(`Found ${examData.length} exam entries`);
      return examData;
    } catch (error) {
      console.error("Error scraping data:", error);
      return [];
    }
  }
}

export const syllabusService = new SyllabusService();

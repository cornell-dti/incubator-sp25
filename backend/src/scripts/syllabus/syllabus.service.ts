import axios from "axios";
import * as cheerio from "cheerio";

export interface ScrapeExam {
  courseCode: string;
  date: string;
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
        const courseCodeMatch = line.match(/^([A-Z]+\s\d{4}(?:\s+\d{3})?)/);
        if (!courseCodeMatch) continue;

        let courseCode = courseCodeMatch[1].trim();
        courseCode = courseCode.replace(/\s+\d{3}$/, "");

        // Now extract the date part (after day of week)
        const dateMatch = line.match(
          /(?:Mon|Tue|Wed|Thu|Fri),\s+((?:Jan|Feb|Mar|Apr|May)\s+\d{1,2})/
        );
        if (!dateMatch) continue;

        const date = dateMatch[1].trim();

        examData.push({
          courseCode,
          date,
        });
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

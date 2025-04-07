import axios from "axios";
import * as cheerio from "cheerio";
import { db } from "../../config/firebase";
import { Course } from "../../course/course.type";

export interface ScrapeExam {
  courseCode: string;
  date: string;
  instructors: string[];
}

export interface ScrapeFinal {
  courseCode: string;
  date: string;
  time: string;
  type: string;
  instructors: string[];
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

        let courseCode = courseCodeMatch[1].trim();

        const section = courseCodeMatch[3] || "";
        const instructors = await this.findInstructors(courseCode, section);

        // Now extract the date part (after day of week)
        const dateMatch = line.match(
          /(?:Mon|Tue|Wed|Thu|Fri),\s+((?:Jan|Feb|Mar|Apr|May)\s+\d{1,2})/
        );
        if (!dateMatch) continue;

        const date = dateMatch[1].trim();

        examData.push({
          courseCode,
          date,
          instructors,
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
        const courseMatch = line.match(/^\s*([A-Z]{2,5})\s+(\d{4})\s+\d{3}/);
        if (!courseMatch) continue;

        const dept = courseMatch[1];
        const courseNum = courseMatch[2];
        const courseCode = `${dept} ${courseNum}`;

        const section = courseMatch[3];
        const instructors = await this.findInstructors(courseCode, section);

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
            instructors,
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

  async findInstructors(
    courseCode: string,
    section: string
  ): Promise<string[]> {
    try {
      const courseSnapshot = await db
        .collection("courses")
        .where("courseCode", "==", courseCode)
        .limit(1)
        .get();

      if (courseSnapshot.empty) {
        return [];
      }

      const courseData = courseSnapshot.docs[0].data() as Course;

      if (section !== "") {
        // Find the section in the course data
        const sectionData = courseData.sections?.find(
          (s) => s.sectionId === section
        );

        if (sectionData) {
          return [sectionData.instructor];
        }
      } else {
        return courseData.sections.map((section) => section.instructor);
      }
      return [];
    } catch (error) {
      console.error("Error finding instructor:", error);
      return [];
    }
  }
}

export const syllabusService = new SyllabusService();

import axios from "axios";
import pdf from "pdf-parse";
import fs from "fs";
import path from "path";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

/**
 * Uses pdf-parse API to extract all text from the syllabus
 * @param filePath path of syllabus
 * @returns parsed text if successful, throws error otherwise
 */
export const pdfToText = async (filePath: string): Promise<string> => {
  try {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    console.log("Looking for file at:", absolutePath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File does not exist at: ${absolutePath}`);
    }

    const dataBuffer = fs.readFileSync(absolutePath);
    const data = await pdf(dataBuffer);

    return data.text;
  } catch (error) {
    console.error(`Error in parsing PDF: ${error}`);
    throw error;
  }
};

/**
 * Uses a select LLM API to take in a syllabus parser prompt and generate a json-like object with specified details
 * @param syllabusText parsed text retrieved from pdfToText() function
 * @param courseCode like `CS 2110`
 * @param instructor for the course (if multiple instructors, they should be separated by commas)
 * @returns json-like object containing todo items and grading policy
 */
export const parseSyllabus = async (
  syllabusText: string,
  courseCode: string,
  instructor: string,
  termDates: string
) => {
  try {
    const messages: Message[] = [
      {
        role: "system",
        content:
          "You are a syllabus parser. As input, you will be given a pdf document \
          of a course syllabus. Your task will be to parse this syllabus and return \
          key information from the syllabus in the following JSON format:\n \
          \
          {\
          todos[]: [\
            {\
              title: Complete Shakespeare Romeo & Juliet Ch 1\
              date: 2025-01-01T00:00:00Z\
              eventType: assignment\
              priority: 3\
            },\
            {\
              title: Study Ch 1\
              date: 2025-01-31T00:00:00Z\
              eventType: exams\
              priority: 1\
            },\
            {\
              title: Complete final project\
              date: 2025-05-01T00:00:00Z\
              eventType: projects\
              priority: 2\
            }\
          ]\
          gradingPolicy: {exams: 60, assignments: 15, projects: 20, participation: 5}\
          }\n\
          \
          To identify what in a syllabus counts as a to-do, look at due dates for \
          readings, assignments, projects, etc. For example, if a reading is to be \
          completed for a certain week, make them due before each class. The class \
          meeting times should usually be on the syllabus as well. The eventType of a \
          todo is based on which category it falls under within the categories in gradingPolicy. \
          Please determine the priority of each task based on the weight given to the \
          specific category (i.e. projects would be higher priority than assignments, \
          so project would have priority 1 and assignments would have priority 2).",
      },
      {
        role: "system",
        content: `To help with knowing which dates correspond to which weeks, here's \
            the academic term dates for this semester: ${termDates}`,
      },
      {
        role: "user",
        content: `Please parse the attached syllabus for the class: ${courseCode} with \
            instructor(s) ${instructor}. Also check to see if this information is \
            consistent with the syllabus I have uploaded. If I have uploaded a syllabus \
            that is inconsistent with the course and/or the instructor, please let me know \
            by saying, "You have provided the wrong syllabus for ${courseCode} with \
            instructor(s) ${instructor}.`,
      },
      {
        role: "user",
        content: syllabusText,
      },
    ];

    const response = await axios.post(
      "http://localhost:11434/api/chat", // may consider using google gemini or another model, current output not super complete
      {
        model: "deepseek-v3",
        messages: messages,
        stream: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error parsing syllabus:", error);
    throw error;
  }
};

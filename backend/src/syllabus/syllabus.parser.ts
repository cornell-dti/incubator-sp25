import pdf from "pdf-parse";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

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
  // courseCode: string,
  // instructor: string,
  termDates: string
) => {
  try {
    const openai = new OpenAI({
      baseURL: "https://api.deepseek.com",
      apiKey: process.env.DEEPSEEK_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a syllabus parser. As input, you will be given a parsed-text \
      version of a pdf document of a course syllabus. Your task will be to parse \
      this syllabus and return key information from the syllabus in the following \
      JSON format:\n \
      \
      {\
      courseCode: CS 2110,\
      courseName: Object-Oriented Programming and Data Structures,\
      instructor: Matthew Eichorn, Curran Muhlberger,\
      todos[]: [\
        {\
          title: Complete Shakespeare Romeo & Juliet Ch 1,\
          date: 2025-01-01T00:00:00Z,\
          eventType: Assignment,\
          priority: 3,\
        },\
        {\
          title: In-class prelim exam 1,\
          date: 2025-01-31T00:00:00Z,\
          eventType: Exam,\
          priority: 1,\
        },\
        {\
          title: Complete final project,\
          date: 2025-05-01T00:00:00Z,\
          eventType: Project,\
          priority: 2,\
        }\
      ],\
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
      so project would have priority 1 and assignments would have priority 2).\n\
      \
      Remember, for exams, you only need to extract the in-class exams. \
      If the exam is not clearly mentioned to be in-class, then you view it as not in-class, \
      and you simply ignore it. Also, ignore all Final exams.\n\
      \
      For courseCode, if there's crosslisted codes, just give me one. For example, \
      STSCI/BTRY/ILRST 3080/5080 would just be STSCI 3080.",
        },
        {
          role: "system",
          content: `To help with knowing which dates correspond to which weeks, here's \
              the academic term dates for this semester: ${termDates}`,
        },
        {
          role: "user",
          content: `Please parse the attached syllabus.`,
        },
        {
          role: "user",
          content: syllabusText,
        },
      ],
      model: "deepseek-chat",
    });

    const result = completion.choices[0].message.content;
    if (result !== null) {
      return convertStringToJson(result);
    }
    return "";
  } catch (error) {
    console.error("Error parsing syllabus:", error);
    throw error;
  }

  /**
   * Converts a string containing JSON with markdown code blocks to a typed object
   * @param jsonString - The string containing JSON with markdown code blocks
   * @returns The parsed JSON object with proper typing or null if parsing fails
   */
  function convertStringToJson<T>(jsonString: string): T | null {
    try {
      const jsonContent = jsonString.replace(/^```json\s*\n|\n```\s*$/g, "");

      const parsedJson: T = JSON.parse(jsonContent);
      return parsedJson;
    } catch (error) {
      console.error("Error processing JSON string:", error);
      return null;
    }
  }
};

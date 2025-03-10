import axios from "axios";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

export const parseSyllabus = async (filePath: string) => {
  try {
    if (!filePath) {
      throw new Error("File path is required");
    }

    const storage = getStorage();
    const fileRef = ref(storage, filePath);
    const downloadURL = await getDownloadURL(fileRef);

    const fileResponse = await axios.get(downloadURL, {
      responseType: "arraybuffer",
    });

    const fileBuffer = fileResponse.data;
    const base64File = Buffer.from(fileBuffer).toString("base64");

    const fileExtension = filePath.split(".").pop()?.toLowerCase();
    let mimeType = "application/octet-stream";

    if (fileExtension === "pdf") {
      mimeType = "application/pdf";
    } else if (["doc", "docx"].includes(fileExtension || "")) {
      mimeType =
        fileExtension === "doc"
          ? "application/msword"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }

    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "You are a syllabus parser. As input, you will be given a pdf document \
            of a course syllabus. Your task will be to parse this syllabus and return \
            key information from the syllabus in the following JSON format:\n \
            \
            {\
            courseCode: CS 2110\n\
            courseName: Object-Oriented Programming and Data Structures\n\
            semester: SP25\n\
            instructors: [Curran Muhlberger, Matthew Eichorn]\n\
            events[]: {\
                title: Prelim 1\
                startTime: 0001-01-01T00:00:00Z\
                endTime: 0001-01-01T00:00:00Z\
                eventType: exam\
                weight: 30%\
              }\
            todos[]: {\
                title: Study Ch 1\
                date: 0001-01-01T00:00:00Z\
                eventType: exam\
                priority: 1\
              }\
            gradingPolicy: {exams: 60, assignments: 15, projects: 20, participation: 5}\
            }\n\
            \
            To differentiate between events and tasks, treat events as exams or \
            presentations, while todos are more like daily tasks.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Please parse this syllabus:" },
              {
                type: "file_attachment",
                file_data: {
                  content: base64File,
                  mime_type: mimeType,
                  file_name: filePath.split("/").pop(),
                },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error parsing syllabus:", error);
    throw error;
  }
};

import axios from "axios";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

export const parseSyllabus = async (
  filePath: string,
  courseCode: string,
  instructor: string
) => {
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
              todos[]: {\
                  title: Study Ch 1\
                  date: 0001-01-01T00:00:00Z\
                  eventType: exam\
                  priority: 1\
                }\
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
            role: "user",
            content: [
              {
                type: "text",
                text: `Please parse this syllabus for the class: ${courseCode} with \
                instructor(s) ${instructor}. Also check to see if this information is \
                consistent with the syllabus I have uploaded. If I have uploaded a syllabus \
                that is inconsistent with the course and/or the instructor, please let me know \
                by saying, "You have provided the wrong syllabus for ${courseCode} with \
                instructor(s) ${instructor}.`,
              },
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

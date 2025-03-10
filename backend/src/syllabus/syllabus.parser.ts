import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: "<DeepSeek API Key>",
});

async function main() {
  const completion = await openai.chat.completions.create({
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
    ],
    model: "deepseek-chat",
  });

  console.log(completion.choices[0].message.content);
}

main();

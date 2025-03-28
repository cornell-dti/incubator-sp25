import { syllabusService } from "./syllabus.service";
import { db } from "../../config/firebase";
import { Syllabus } from "../../syllabus/syllabus.type";
import { Event } from "../../event/event.type";
import { Timestamp } from "firebase-admin/firestore";

export const importPrelims = async (semester: string): Promise<boolean> => {
  try {
    const exams = await syllabusService.prelimScraping();
    if (exams.length == 0) {
      console.log("No exam data found to store");
      return false;
    }

    const currYear = new Date().getFullYear();

    for (const exam of exams) {
      const courseSnapshot = await db
        .collection("courses")
        .where("courseCode", "==", exam.courseCode)
        .limit(1)
        .get();

      if (courseSnapshot.empty) {
        console.log(`No course found with code: ${exam.courseCode}`);
        continue;
      }

      const courseId = courseSnapshot.docs[0].id;

      const [month, day] = exam.date.split(" ");
      const monthMap: { [key: string]: number } = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
      };
      const timeZone = "America/New_York";
      const examDate = new Date(currYear, monthMap[month], parseInt(day));
      const dateString = examDate.toLocaleString("en-US", { timeZone });
      const tzExamDate = new Date(dateString);

      const startTime = new Date(tzExamDate);
      startTime.setHours(19, 30, 0);

      const endTime = new Date(tzExamDate);
      endTime.setHours(21, 0, 0);

      const startTimestamp = Timestamp.fromDate(startTime);
      const endTimestamp = Timestamp.fromDate(endTime);

      const newEvent: Event = {
        courseId,
        title: `${exam.courseCode} Prelim`,
        startTime: startTimestamp,
        endTime: endTimestamp,
        eventType: "exam",
      };

      const event = await db.collection("events").add(newEvent);
      const eventId = event.id;

      const syllabusSnapshot = await db
        .collection("syllabi")
        .where("courseId", "==", courseId)
        .where("semester", "==", semester)
        .limit(1)
        .get();

      let syllabusId: string;
      if (syllabusSnapshot.empty) {
        const newSyllabusRef: Syllabus = {
          courseId,
          semester: semester,
          instructor: "",
          syllabusUploadPath: "",
          events: [eventId],
          todos: [],
        };
        const syllabus = await db.collection("syllabi").add(newSyllabusRef);
        syllabusId = syllabus.id;
      } else {
        const syllabusRef = syllabusSnapshot.docs[0].ref;
        syllabusId = syllabusSnapshot.docs[0].id;
        const currentEvents = syllabusSnapshot.docs[0].data().events || [];
        await syllabusRef.update({
          events: [...currentEvents, eventId],
        });
      }

      const courseRef = courseSnapshot.docs[0].ref;
      const currentSyllabi: string[] = [];
      if (!currentSyllabi.includes(syllabusId)) {
        await courseRef.update({
          syllabi: [syllabusId, ...currentSyllabi],
        });
      }

      console.log(
        `Successfully stored ${exam.courseCode} prelim at ${exam.date}`
      );
    }
    console.log(`Successfully stored ${exams.length} prelim dates`);
    return true;
  } catch (error) {
    console.log(`Error in storing prelim dates in database: ${error}`);
    return false;
  }
};

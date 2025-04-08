import { syllabusService } from "./syllabus.service";
import { db } from "../../config/firebase";
import { Exam, FinalDeliverable } from "../../types";
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
        .where("semester", "==", semester)
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

      const newExam: Exam = {
        courseId,
        sectionId: exam.sectionId,
        title: `${exam.courseCode} Prelim`,
        startTime: startTimestamp,
        endTime: endTimestamp,
        examType: "prelim",
      };

      await db.collection("exams").add(newExam);

      console.log(
        `Successfully stored ${exam.courseCode} ${exam.sectionId} prelim at ${exam.date}`
      );
    }
    console.log(`Successfully stored ${exams.length} prelim dates`);
    return true;
  } catch (error) {
    console.log(`Error in storing prelim dates in database: ${error}`);
    return false;
  }
};

export const importFinals = async (semester: string): Promise<Boolean> => {
  try {
    const exams = await syllabusService.finalScraping();
    if (exams.length == 0) {
      console.log("No exam data found to store");
      return false;
    }

    for (const exam of exams) {
      const courseSnapshot = await db
        .collection("courses")
        .where("courseCode", "==", exam.courseCode)
        .where("semester", "==", semester)
        .limit(1)
        .get();

      if (courseSnapshot.empty) {
        console.log(`No course found with code: ${exam.courseCode}`);
        continue;
      }

      const courseId = courseSnapshot.docs[0].id;

      const [month, day, year] = exam.date.split("/");
      const timeZone = "America/New_York";
      const examDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      );
      const dateString = examDate.toLocaleString("en-US", { timeZone });
      const tzExamDate = new Date(dateString);
      let timeSplit = exam.time.split(":");

      if (exam.type === "Exam") {
        const startTime = new Date(tzExamDate);
        if (exam.time.includes("PM")) {
          timeSplit[0] = (parseInt(timeSplit[0]) + 12).toString();
        }
        startTime.setHours(parseInt(timeSplit[0]), 0, 0);

        const endTime = new Date(tzExamDate);
        endTime.setHours(parseInt(timeSplit[0]) + 2, 30, 0);

        const startTimestamp = Timestamp.fromDate(startTime);
        const endTimestamp = Timestamp.fromDate(endTime);

        const newExam: Exam = {
          courseId,
          sectionId: exam.sectionId,
          title: `${exam.courseCode} Final`,
          startTime: startTimestamp,
          endTime: endTimestamp,
          examType: "final",
        };

        await db.collection("exams").add(newExam);

        console.log(
          `Successfully stored ${exam.courseCode} ${exam.sectionId} final exam at ${exam.date} ${exam.time}`
        );
      } else {
        const deadline = new Date(tzExamDate);
        deadline.setHours(
          parseInt(timeSplit[0]),
          parseInt(timeSplit[1].substring(0, 2)),
          0
        );
        const date = Timestamp.fromDate(deadline);

        const newDeliverable: FinalDeliverable = {
          courseId,
          sectionId: exam.sectionId,
          title: `${exam.courseCode} Final Deliverable`,
          dueDate: date,
        };

        await db.collection("finalDeliverables").add(newDeliverable);

        console.log(
          `Successfully stored ${exam.courseCode} ${exam.sectionId} final deliverable on ${exam.date}, due at ${exam.time}`
        );
      }
    }
    console.log(`Successfully stored ${exams.length} final exam dates`);
    return true;
  } catch (error) {
    console.log(`Error in storing final exam dates in database: ${error}`);
    return false;
  }
};

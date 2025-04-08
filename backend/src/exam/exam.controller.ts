import { db } from "../config/firebase";
import { Exam } from "../types";
import { ExamRequestHandlers } from "../types/requests";

export const examController: ExamRequestHandlers = {
  getAllExams: async (req, res) => {
    try {
      const snapshot = await db.collection("exams").get();
      const exams: Exam[] = [];

      snapshot.forEach((doc) => {
        exams.push({
          id: doc.id,
          ...(doc.data() as Exam),
        });
      });

      res.status(200).json(exams);
    } catch (error) {
      console.error("Error getting exams:", error);
      res.status(500).json({ error: "Failed to retrieve exams" });
    }
  },
  createExam: async (req, res) => {
    try {
      const examData: Exam = req.body;

      if (
        !examData.courseId ||
        !examData.title ||
        !examData.startTime ||
        !examData.endTime ||
        !examData.examType
      ) {
        return res.status(400).json({
          error: "Missing required fields. All exam properties are required.",
        });
      }

      const docRef = await db.collection("exams").add(examData);

      res.status(201).json({
        id: docRef.id,
        ...examData,
      });
    } catch (error) {
      console.error("Error creating exam:", error);
      res.status(500).json({ error: "Failed to create exam" });
    }
  },

  updateExam: async (req, res) => {
    try {
      const examId = req.params.id;
      const examData = req.body;

      const examRef = db.collection("exams").doc(examId);
      const examDoc = await examRef.get();

      const docData = examDoc.data();

      if (!docData) {
        return res.status(404).json({ error: "Exam not found" });
      }

      if (docData.userId !== res.locals.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      await examRef.update(examData);

      const updatedDoc = await examRef.get();

      res.status(200).json({
        id: examId,
        ...updatedDoc.data(),
      });
    } catch (error) {
      console.error("Error updating exam:", error);
      res.status(500).json({ error: "Failed to update exam" });
    }
  },

  deleteExam: async (req, res) => {
    try {
      const examId = req.params.id;

      const examRef = db.collection("exams").doc(examId);
      const examDoc = await examRef.get();

      const docData = examDoc.data();

      if (!docData) {
        return res.status(404).json({ error: "Exam not found" });
      }

      if (docData.userId !== res.locals.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      await examRef.delete();

      res.status(200).json({ message: "Exam deleted successfully" });
    } catch (error) {
      console.error("Error deleting exam:", error);
      res.status(500).json({ error: "Failed to delete exam" });
    }
  },
};

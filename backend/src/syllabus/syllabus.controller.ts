import { Request, Response } from "express";
import { db, storage } from "../config/firebase";
import admin from "../config/firebase";
import { Syllabus } from "./syllabus.type";
import { SyllabusRequestHandlers } from "../requestTypes";
import { parseSyllabus, pdfToText } from "./syllabus.parser";

export const syllabusController: SyllabusRequestHandlers = {
  uploadSyllabus: async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const courseCode = req.params.courseCode;
      const fullCourseName = req.params.courseName;
      const instructor = req.params.instructor;
      const semester = req.params.semester;

      if (!courseCode || !fullCourseName || !semester || !instructor) {
        return res.status(400).json({
          message:
            "Missing required fields: courseCode, fullCourseName, instructor, and semester are required",
        });
      }

      // create new file name for each syllabus upload for now
      const fileName = `${courseCode}-${semester}-${instructor}`;
      const bucket = storage.bucket();
      const file = bucket.file(`syllabi/${fileName}`);

      const stream = file.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
        resumable: false,
      });

      const streamError = await new Promise<Error | null>((resolve) => {
        stream.on("error", (err) => {
          resolve(err);
        });

        stream.on("finish", () => {
          resolve(null);
        });

        if (!req.file?.buffer) {
          res.status(400).json({ message: "No file uploaded" });
          return;
        }

        stream.end(req.file.buffer);
      });

      if (streamError) {
        throw streamError;
      }

      await file.makePublic();

      const fileUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

      const coursesQuery = await db
        .collection("courses")
        .where("courseCode", "==", courseCode)
        .limit(1)
        .get();

      let courseId;

      if (coursesQuery.empty) {
        const newCourseRef = await db.collection("courses").add({
          courseCode,
          courseName: fullCourseName,
          syllabi: [],
        });
        courseId = newCourseRef.id;
      } else {
        courseId = coursesQuery.docs[0].id;
      }

      const syllabusData: Syllabus = {
        courseId,
        semester,
        syllabusUploadPath: fileUrl,
        events: [],
      };

      const docRef = await db.collection("syllabi").add(syllabusData);
      await db
        .collection("courses")
        .doc(courseId)
        .update({
          syllabi: admin.firestore.FieldValue.arrayUnion({
            syllabusData,
          }),
        });

      return res.status(201).json({
        id: docRef.id,
        ...syllabusData,
      });
    } catch (error) {
      console.error("Error uploading syllabus:", error);
      return res
        .status(500)
        .json({ message: "Failed to upload syllabus", error });
    }
  },

  getSyllabusById: async (req: Request, res: Response) => {
    try {
      const syllabusId = req.params.id;
      const syllabusDoc = await db.collection("syllabi").doc(syllabusId).get();

      if (!syllabusDoc.exists) {
        res.status(404).json({ error: "Syllabus not found" });
        return;
      }

      res.status(200).json({
        id: syllabusDoc.id,
        ...syllabusDoc.data(),
      });
    } catch (error) {
      console.error("Error fetching syllabus:", error);
      res.status(500).json({ message: "Failed to fetch syllabus", error });
    }
  },

  deleteSyllabusById: async (req: Request, res: Response) => {
    try {
      const syllabusId = req.params.id;

      const docRef = db.collection("syllabi").doc(syllabusId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ message: "Syllabus not found" });
      }

      const syllabusData = doc.data() as Syllabus;

      if (syllabusData.syllabusUploadPath) {
        try {
          const fileUrl = new URL(syllabusData.syllabusUploadPath);
          const filePath = fileUrl.pathname.split("/").slice(2).join("/");

          await storage.bucket().file(filePath).delete();
        } catch (error) {
          console.error("Error deleting file from storage:", error);
        }
      }

      await docRef.delete();

      return res.status(200).json({ message: "Syllabus deleted successfully" });
    } catch (error) {
      console.error("Error deleting syllabus:", error);
      return res
        .status(500)
        .json({ message: "Failed to delete syllabus", error });
    }
  },

  updateSyllabusById: async (req: Request, res: Response) => {
    try {
      const syllabusId = req.params.id;
      const { courseCode, semester } = req.body;

      const docRef = db.collection("syllabi").doc(syllabusId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ message: "Syllabus not found" });
      }

      const syllabusData = doc.data() as Syllabus;

      const updateData: Partial<Syllabus> = {};
      if (courseCode) {
        const courseQuery = await db
          .collection("courses")
          .where("courseCode", "==", courseCode)
          .limit(1)
          .get();

        updateData.courseId = courseQuery.docs[0].id;
      }
      if (semester) updateData.semester = semester;

      if (Object.keys(updateData).length === 0) {
        return res
          .status(400)
          .json({ message: "No fields to update provided" });
      }

      await docRef.update(updateData);

      return res.status(200).json({
        id: syllabusId,
        ...syllabusData,
        ...updateData,
      });
    } catch (error) {
      console.error("Error updating syllabus:", error);
      return res
        .status(500)
        .json({ message: "Failed to update syllabus", error });
    }
  },

  /**
   * Parsing syllabus text and inputting into LLM for testing
   * @param req
   * @param res
   * @returns
   */
  getParsedText: async (req: Request, res: Response) => {
    try {
      const text = await pdfToText("src/syllabus/syllabus.pdf");
      const courseCode = req.params.courseCode;
      const instructor = req.params.instructor;
      const output = await parseSyllabus(text, courseCode, instructor);
      return res.status(200).json({
        syllabus: output,
      });
    } catch (error) {
      console.log("error");
      return res
        .status(500)
        .json({ message: "Failed to parse syllabus", error });
    }
  },
};

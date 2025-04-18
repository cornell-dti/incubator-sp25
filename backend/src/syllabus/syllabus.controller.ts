import { Request, Response } from "express";
import { db, storage } from "../config/firebase";
import { Syllabus, Course } from "../types";
import { SyllabusRequestHandlers } from "../types/requests";
import { parseSyllabus, pdfToText } from "./syllabus.parser";
import fs from "fs";
import path from "path";
import multer from "multer";

export const syllabusController: SyllabusRequestHandlers = {
  /**
   * Handles syllabus uploads into firebase storage and runs the parsing script to
   * identify all events and todo items associated with a syllabus
   * @param req request from the API call
   * @param res response back to the original API call
   * @returns the current syllabus data stored in the database
   */
  uploadSyllabus: async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const courseCode = req.params.courseCode;
      const fullCourseName = req.params.courseName;
      const instructor = req.params.instructor;
      const section = req.params.section;
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
        const newCourse: Course = {
          courseCode,
          courseName: fullCourseName,
          semester,
          sections: [{ sectionId: section, instructor }],
          // syllabi: [],
        };
        const newCourseRef = await db.collection("courses").add(newCourse);
        courseId = newCourseRef.id;
      } else {
        courseId = coursesQuery.docs[0].id;
      }

      const syllabusQuery = await db
        .collection("syllabi")
        .where("courseId", "==", courseId)
        .where("semester", "==", semester)
        .limit(1)
        .get();

      let syllabusId;
      let syllabusData: Syllabus;
      if (syllabusQuery.empty) {
        syllabusData = {
          courseId,
          semester,
          instructor,
          syllabusUploadPath: fileUrl,
          events: [],
          todos: [],
        };

        const docRef = await db.collection("syllabi").add(syllabusData);
        syllabusId = docRef.id;

        await db
          .collection("courses")
          .doc(courseId)
          .update({
            syllabi: [syllabusId],
          });
      } else {
        syllabusId = syllabusQuery.docs[0].id;
        await db
          .collection("syllabi")
          .doc(syllabusId)
          .update({ syllabusUploadPath: fileUrl });

        syllabusData = syllabusQuery.docs[0].data() as Syllabus;
      }

      // after testing is finished, add in parser code here to seamlessly update all events and todos into database

      return res.status(201).json({
        id: syllabusId,
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
      const courseCode = req.params.courseCode;
      const semester = req.params.semester;

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
   * @returns parsed text in JSON format, error message otherwise
   */
  getParsedText: async (req: Request, res: Response) => {
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        const uploadDir = path.join(process.cwd(), "uploads");

        // Create the directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
      },
      filename: function (req, file, cb) {
        // Create a unique filename
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
          null,
          file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
        );
      },
    });

    // Initialize multer upload
    const upload = multer({ storage: storage });

    upload.single("file")(req, res, async function (err) {
      if (err) {
        return res.status(400).json({
          message: "File upload error",
          error: err.message,
        });
      }
      try {
        // req.file is populated by multer after successful upload
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }

        const filePath = req.file.path;
        const text = await pdfToText(filePath);

        const termDates =
          "January 21 (Tuesday) – Instruction Begins\n\
           February 15 (Saturday) – February Break Begins\n\
           February 19 (Wednesday) – Instruction Resumes\n\
           March 29 (Saturday) – Spring Break Begins\n\
           April 7 (Monday) – Instruction Resumes\n\
           May 6 (Tuesday) – Last Day of Instruction\n\
           May 7 (Wednesday) – Study Days Begin\n\
           May 9 (Friday) – Study Days End\n\
           May 10 (Saturday) – Scheduled Exams Begin\n\
           May 17 (Saturday) – Scheduled Exams End\n\
           May 23–25 (Friday–Sunday) – University Commencement Weekend";
        const output = await parseSyllabus(text, termDates);

        fs.unlinkSync(filePath);

        return res.status(200).json({
          text: text,
          syllabus: output,
        });
      } catch (error) {
        console.log("error");
        return res
          .status(500)
          .json({ message: "Failed to parse syllabus", error });
      }
    });
  },
};

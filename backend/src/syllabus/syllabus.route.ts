import { Router } from "express";
import multer from "multer";
import { syllabusController } from "./syllabus.controller";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.mimetype === "text/plain"
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only PDF, Word documents, and text files are allowed."
        )
      );
    }
  },
});

router.post(
  "/upload",
  upload.single("syllabus"),
  syllabusController.uploadSyllabus
);
router.get("/:id", syllabusController.getSyllabiByUserId);
router.delete("/:id", syllabusController.deleteSyllabusById);
router.put("/:id", syllabusController.updateSyllabusById);

export default router;

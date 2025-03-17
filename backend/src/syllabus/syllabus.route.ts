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
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF files are allowed."));
    }
  },
});

router.post(
  "/upload",
  upload.single("syllabus"),
  syllabusController.uploadSyllabus
);
router.get("/:id", syllabusController.getSyllabusById);
router.delete("/:id", syllabusController.deleteSyllabusById);
router.put("/:id", syllabusController.updateSyllabusById);

export default router;

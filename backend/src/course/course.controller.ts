import { db } from "../config/firebase";
import { Course } from "../types";
import { CourseRequestHandlers } from "../types/requests";

export const courseController: CourseRequestHandlers = {
  getAllCourses: async (req, res) => {
    try {
      const coursesDb = await db.collection("courses").get();
      const courses: Course[] = [];

      coursesDb.forEach((doc) => {
        courses.push({
          id: doc.id,
          ...(doc.data() as Course),
        });
      });

      res.status(200).json(courses);
    } catch (error) {
      console.error("Error getting courses:", error);
      res.status(500).json({ error: "Failed to retrieve courses" });
    }
  },
  getCourseByCode: async (req, res) => {
    try {
      const courseCode = req.params.code;
      const courseRef = db
        .collection("courses")
        .where("courseCode", "==", courseCode);
      const courseSnapshot = await courseRef.get();
      const courseDoc = courseSnapshot.docs[0];

      if (!courseDoc) {
        return res.status(404).json({ error: "Course not found" });
      }

      res.status(200).json({
        id: courseDoc.id,
        ...courseDoc.data(),
      });
    } catch (error) {
      console.error("Error getting course:", error);
      res.status(500).json({ error: "Failed to retrieve course" });
    }
  },
  createCourse: async (req, res) => {
    try {
      const courseData: Course = req.body;

      if (!courseData.courseCode || !courseData.courseName) {
        return res
          .status(400)
          .json({ error: "Course code and course name are required" });
      }

      const courseEmptySyllabi = {
        ...courseData,
        syllabi: [],
      };

      const docRef = await db.collection("courses").add(courseEmptySyllabi);

      res.status(201).json({
        id: docRef.id,
        ...courseEmptySyllabi,
      });
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ error: "Failed to create course" });
    }
  },
  updateCourse: async (req, res) => {
    try {
      const courseId = req.params.id;
      const courseData = req.body;

      const courseRef = db.collection("courses").doc(courseId);
      const courseDoc = await courseRef.get();

      if (!courseDoc.exists) {
        return res.status(404).json({ error: "Course not found" });
      }

      await courseRef.update(courseData);

      const updatedDoc = await courseRef.get();

      res.status(200).json({
        courseId,
        ...updatedDoc.data(),
      });
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(500).json({ error: "Failed to update course" });
    }
  },
  deleteCourse: async (req, res) => {
    try {
      const courseId = req.params.id;

      const courseRef = db.collection("courses").doc(courseId);
      const courseDoc = await courseRef.get();

      if (!courseDoc.exists) {
        return res.status(404).json({ error: "Course not found" });
      }

      await courseRef.delete();

      res.status(200).json({ message: "Course deleted successfully" });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ error: "Failed to delete course" });
    }
  },
};

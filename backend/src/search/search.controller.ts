import { db } from "../config/firebase";
import { SearchRequestHandlers } from "../types/requests";

export const searchController: SearchRequestHandlers = {
  getCourseSearch: async (req, res) => {
    try {
      const query = req.params.query.toUpperCase();
      console.log(query);
      if (query && query.length >= 2) {
        let courses = [];

        // course code search
        const courseCodeQuery = query.split(" ");
        const subjectsRef = await db
          .collection("subjects")
          .where("subjectCode", "==", courseCodeQuery[0])
          .limit(1)
          .get();

        if (!subjectsRef.empty) {
          const subject = subjectsRef.docs[0].data().subjectCode;
          const subjectCourseList = await db
            .collection("courses")
            .where("courseCode", ">=", subject)
            .where("courseCode", "<=", subject + "\uf8ff")
            .limit(5)
            .get();

          courses = subjectCourseList.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          if (courses.length > 0) {
            return res.status(200).json({ courses });
          }
        }

        // number search
        const isNumber = /^\d+$/.test(query);
        if (isNumber) {
          const courseNumberList = await db.collection("courses").get();
          courses = courseNumberList.docs
            .filter((doc) => {
              const courseCode = doc.data().courseCode;
              const lastFourChars = courseCode.slice(-4);
              return lastFourChars.includes(query);
            })
            .slice(0, 5)
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

          if (courses.length > 0) {
            return res.status(200).json({ courses });
          }
        }

        // name search
        const courseName = await db
          .collection("courses")
          .where("courseName", ">=", query)
          .where("courseName", "<=", query + "\uf8ff")
          .limit(5)
          .get();

        courses = courseName.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        return res.status(200).json({ courses });
      }

      return res
        .status(400)
        .json({ error: "Query must be at least 2 characters" });
    } catch (error) {
      console.log("Unable to retrieve courses:", error);
      return res
        .status(500)
        .json({ error: "Unable to complete course search" });
    }
  },
  getInstructorSearch: async (req, res) => {
    try {
      const query = req.params.query;
      const courseRef = await db.collection("courses").get();

      let allInstructors: string[] = [];
      courseRef.forEach((doc) => {
        const courseData = doc.data();
        if (courseData.sections && Array.isArray(courseData.sections)) {
          courseData.sections.forEach((section) => {
            if (section.instructor) {
              allInstructors.push(section.instructor);
            }
          });
        }
      });

      const filteredInstructors = allInstructors.filter((item) =>
        item.toLowerCase().includes(query.toLowerCase())
      );

      const uniqueInstructors = Array.from(
        new Map(filteredInstructors.map((item) => [item, item])).values()
      );

      return res.status(200).json({ instructors: uniqueInstructors });
    } catch (error) {
      console.log("Unable to retrieve instructors:", error);
      return res
        .status(500)
        .json({ error: "Unable to complete instructor search" });
    }
  },
};

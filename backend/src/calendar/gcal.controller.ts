import { db, auth } from "../config/firebase";
import {
  CalendarRequestHandlers,
  Exam,
  FinalDeliverable,
  Todo,
  User,
} from "../types";
import { google } from "googleapis";

const gCalClient = () => {
  const auth = new google.auth.JWT({
    email: process.env.FIREBASE_CLIENT_EMAIL,
    key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  return {
    calendar: google.calendar({ version: "v3", auth: auth }),
    taskList: google.tasks({ version: "v1", auth: auth }),
  };
};

const { calendar, taskList } = gCalClient();

export const gCalController: CalendarRequestHandlers = {
  createExamEvent: async (req, res) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userDoc = await db.collection("users").doc(userId).get();
      const user = userDoc.data() as User;
      let calLink = user.calendarLink;
      if (!calLink) {
        calLink = await createCalendar(userId, user);
      }

      const { examId } = req.body;
      const examDoc = await db.collection("exams").doc(examId).get();
      if (!examDoc.exists) {
        return res.status(404).json({ error: "Exam does not exist" });
      }
      const exam = examDoc.data() as Exam;

      const event = {
        summary: exam.title,
        start: {
          dateTime: exam.startTime.toDate().toISOString(),
          timeZone: "America/New_York",
        },
        end: {
          dateTime: exam.endTime.toDate().toISOString(),
          timeZone: "America/New_York",
        },
        colorId: "11",
      };

      const response = await calendar.events.insert({
        calendarId: calLink,
        requestBody: event,
      });

      if (!response.data.id) {
        throw new Error("Event creation failed: No ID returned");
      }

      return res.status(200).json({
        success: true,
        id: response.data.id,
      });
    } catch (error) {
      console.error(`Error creating exam event in calendar: ${error}`);
      return res
        .status(500)
        .json({ error: "Failed to retrieve create exam event" });
    }
  },
  createFinalDeliverableTask: async (req, res) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userDoc = await db.collection("users").doc(userId).get();
      const user = userDoc.data() as User;
      let taskListId = user.taskListId;
      if (!taskListId) {
        taskListId = await createTaskList(userId, user);
      }

      const { deliverableId } = req.body;
      const deliverableDoc = await db
        .collection("finalDeliverables")
        .doc(deliverableId)
        .get();
      if (!deliverableDoc.exists) {
        return res
          .status(404)
          .json({ error: "Final Deliverable does not exist" });
      }
      const deliverable = deliverableDoc.data() as FinalDeliverable;

      const task = {
        title: deliverable.title,
        due: deliverable.dueDate.toDate().toISOString(),
        status: "needsAction",
      };

      const response = await taskList.tasks.insert({
        tasklist: taskListId,
        requestBody: task,
      });

      if (!response.data.id) {
        throw new Error("Task creation failed: No ID returned");
      }

      await db.collection("finalDeliverables").doc(deliverableId).update({
        taskId: response.data.id,
      });

      return res.status(200).json({
        success: true,
        id: response.data.id,
      });
    } catch (error) {
      console.error(
        `Error creating final deliverable task in calendar: ${error}`
      );
      return res
        .status(500)
        .json({ error: "Failed to create final deliverable task" });
    }
  },
  createTask: async (req, res) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userDoc = await db.collection("users").doc(userId).get();
      const user = userDoc.data() as User;
      let taskListId = user.taskListId;
      if (!taskListId) {
        taskListId = await createTaskList(userId, user);
      }

      const { taskId } = req.body;
      const taskDoc = await db.collection("tasks").doc(taskId).get();
      if (!taskDoc.exists) {
        return res.status(404).json({ error: "Task does not exist" });
      }
      const todo = taskDoc.data() as Todo;

      const task = {
        title: `${todo.courseCode}: ${todo.title}`,
        due: todo.date.toDate().toISOString(),
        status: "needsAction",
      };

      const response = await taskList.tasks.insert({
        tasklist: taskListId,
        requestBody: task,
      });

      if (!response.data.id) {
        throw new Error("Task creation failed: No ID returned");
      }

      await db.collection("finalDeliverables").doc(taskId).update({
        taskId: response.data.id,
      });

      return res.status(200).json({
        success: true,
        id: response.data.id,
      });
    } catch (error) {
      console.error(`Error creating task in calendar: ${error}`);
      return res.status(500).json({ error: "Failed to create task" });
    }
  },
};

const createCalendar = async (userId: string, user: User): Promise<string> => {
  try {
    const response = await calendar.calendars.insert({
      requestBody: {
        summary: `${user.email} Calendar`,
        timeZone: "America/New_York",
      },
    });

    await db.collection("users").doc(userId).update({
      calendarLink: response.data.id,
    });

    if (!response.data.id) {
      throw new Error("Calendar creation failed: No ID returned");
    }

    return response.data.id;
  } catch (error) {
    console.error("Error creating calendar:", error);
    throw error;
  }
};

const createTaskList = async (userId: string, user: User): Promise<string> => {
  try {
    const response = await taskList.tasklists.insert({
      requestBody: {
        title: `${user.email} Tasks`,
      },
    });

    await db.collection("users").doc(userId).update({
      taskListId: response.data.id,
    });

    if (!response.data.id) {
      throw new Error("Task list creation failed: No ID returned");
    }

    return response.data.id;
  } catch (error) {
    console.error("Error creating task list:", error);
    throw error;
  }
};

import { db, auth } from "../config/firebase";
import { CalendarRequestHandlers, Exam, User } from "../types";
import { google } from "googleapis";

const gCalClient = () => {
  const auth = new google.auth.JWT({
    email: process.env.FIREBASE_CLIENT_EMAIL,
    key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  return google.calendar({ version: "v3", auth: auth });
};

const calendar = gCalClient();

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

      return response.data.id;
    } catch (error) {
      console.error(`Error creating exam event in calendar: ${error}`);
      res.status(500).json({ error: "Failed to retrieve create exam event" });
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

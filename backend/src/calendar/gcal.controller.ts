import { db } from "../config/firebase";
import {
  CalendarRequestHandlers,
  Exam,
  FinalDeliverable,
  Todo,
  User,
  Course,
} from "../types";
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
  addAllCoursesToCalendar: async (req, res) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = userDoc.data() as User;
      let calendarId = user.calendarLink;

      if (!calendarId) {
        calendarId = await createCalendar(userId, user);
      }

      // Check if the user has courses in their data
      if (!user.courses || user.courses.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No courses found in user data",
          calendarId: calendarId,
          calendarUrl: `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}`,
          addUrl: `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(calendarId)}`,
        });
      }

      const totalEventPromises: Promise<any>[] = [];
      const courseResults: Array<{
        courseId: string;
        courseCode: string;
        exams: number;
        deliverables: number;
        todos: number;
      }> = [];

      // Process each course from the user's courses array
      for (const course of user.courses) {
        if (!course.id) {
          console.warn(`Course without ID found in user's courses array`);
          continue; // Skip if course doesn't have an ID
        }

        const courseId = course.id;
        const eventPromises: Promise<any>[] = [];

        // Get exams for this course
        const examSnapshot = await db
          .collection("exams")
          .where("courseId", "==", courseId)
          .get();

        const exams: Exam[] = [];
        examSnapshot.forEach((doc) => {
          exams.push({
            id: doc.id,
            ...(doc.data() as Exam),
          });
        });

        // Get deliverables for this course
        const deliverableSnapshot = await db
          .collection("finalDeliverables")
          .where("courseId", "==", courseId)
          .get();

        const deliverables: FinalDeliverable[] = [];
        deliverableSnapshot.forEach((doc) => {
          deliverables.push({
            id: doc.id,
            ...(doc.data() as FinalDeliverable),
          });
        });

        // Add exams to calendar
        for (const exam of exams) {
          if (exam.id) {
            await createExamEvent(userId, exam.id, eventPromises);
          }
        }

        // Add deliverables to calendar
        for (const deliverable of deliverables) {
          if (deliverable.id) {
            await createFinalDeliverableTask(
              userId,
              deliverable.id,
              eventPromises
            );
          }
        }

        // Get todos for this course
        const todoSnapshot = await db
          .collection("todos")
          .where("userId", "==", userId)
          .where("courseCode", "==", course.courseCode)
          .get();

        const todos: Todo[] = [];
        todoSnapshot.forEach((doc) => {
          todos.push({
            id: doc.id,
            ...(doc.data() as Todo),
          });
        });

        // Add todos to calendar
        for (const todo of todos) {
          if (todo.id) {
            await createTask(userId, todo.id, eventPromises);
          }
        }

        // Add course results to summary
        courseResults.push({
          courseId,
          courseCode: course.courseCode,
          exams: exams.length,
          deliverables: deliverables.length,
          todos: todos.length,
        });

        // Add this course's promises to total
        totalEventPromises.push(...eventPromises);
      }

      // If no valid courses were found
      if (courseResults.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No valid courses found for this user",
          calendarId: calendarId,
          calendarUrl: `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}`,
          addUrl: `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(calendarId)}`,
        });
      }

      // Process all calendar additions
      await Promise.all(totalEventPromises);

      // Create summary of what was added
      const summary = courseResults
        .map(
          (result) =>
            `${result.courseCode}: ${result.exams} exams, ${result.deliverables} deliverables, ${result.todos} todos`
        )
        .join("; ");

      // Calculate totals
      const totalExams = courseResults.reduce(
        (sum, course) => sum + course.exams,
        0
      );
      const totalDeliverables = courseResults.reduce(
        (sum, course) => sum + course.deliverables,
        0
      );
      const totalTodos = courseResults.reduce(
        (sum, course) => sum + course.todos,
        0
      );

      const calendarUrl = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}`;
      const addUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(calendarId)}`;

      return res.status(200).json({
        success: true,
        calendarId: calendarId,
        calendarUrl: calendarUrl,
        addUrl: addUrl,
        coursesAdded: courseResults.length,
        summary: summary,
        message: `Added ${totalExams} exams, ${totalDeliverables} deliverables, and ${totalTodos} todos to your calendar.`,
      });
    } catch (error) {
      console.error(`Error adding all courses to calendar: ${error}`);
      return res
        .status(500)
        .json({ error: "Failed to add courses to calendar" });
    }
  },
  addCourseToCalendar: async (req, res) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { courseId } = req.params;
      if (!courseId) {
        return res.status(400).json({ error: "Course ID is required" });
      }

      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = userDoc.data() as User;
      let calendarId = user.calendarLink;

      if (!calendarId) {
        calendarId = await createCalendar(userId, user);
      }

      const courseDoc = await db.collection("courses").doc(courseId).get();
      if (!courseDoc.exists) {
        return res.status(404).json({ error: "Course not found" });
      }

      const course = courseDoc.data() as Course;

      // Get all required data first
      const examSnapshot = await db
        .collection("exams")
        .where("courseId", "==", courseId)
        .get();

      const exams: Exam[] = [];
      examSnapshot.forEach((doc) => {
        exams.push({
          id: doc.id,
          ...(doc.data() as Exam),
        });
      });

      const deliverableSnapshot = await db
        .collection("finalDeliverables")
        .where("courseId", "==", courseId)
        .get();

      const deliverables: FinalDeliverable[] = [];
      deliverableSnapshot.forEach((doc) => {
        deliverables.push({
          id: doc.id,
          ...(doc.data() as FinalDeliverable),
        });
      });

      const todoSnapshot = await db
        .collection("todos")
        .where("userId", "==", userId)
        .where("courseCode", "==", course.courseCode)
        .get();

      const todos: Todo[] = [];
      todoSnapshot.forEach((doc) => {
        todos.push({
          id: doc.id,
          ...(doc.data() as Todo),
        });
      });

      // Prepare event data
      const allEvents = [];

      // Add exam events
      for (const exam of exams) {
        if (exam.id) {
          allEvents.push({
            type: "exam",
            id: exam.id,
          });
        }
      }

      // Add deliverable events
      for (const deliverable of deliverables) {
        if (deliverable.id) {
          allEvents.push({
            type: "deliverable",
            id: deliverable.id,
          });
        }
      }

      // Add todo events
      for (const todo of todos) {
        if (todo.id) {
          allEvents.push({
            type: "todo",
            id: todo.id,
          });
        }
      }

      // Process in batches with exponential backoff
      const batchSize = 10;
      let successCount = 0;
      let failCount = 0;

      // Helper function to add an event with backoff
      const addEventWithBackoff = async (
        eventType: string,
        eventId: string,
        attempt = 1
      ) => {
        const maxAttempts = 5;
        const baseDelay = 1000; // 1 second

        try {
          switch (eventType) {
            case "exam":
              await processExam(userId, eventId);
              break;
            case "deliverable":
              await processDeliverable(userId, eventId);
              break;
            case "todo":
              await processTodo(userId, eventId);
              break;
          }
          return true;
        } catch (error: any) {
          if (
            error.code === 429 || // Too Many Requests
            (error.code >= 500 && error.code < 600) // Server errors
          ) {
            if (attempt >= maxAttempts) {
              console.error(
                `Failed to add event ${eventId} after ${maxAttempts} attempts`
              );
              return false;
            }

            // Exponential backoff with jitter
            const delay =
              baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
            console.log(
              `Rate limit hit. Retrying in ${delay}ms (attempt ${attempt})`
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
            return addEventWithBackoff(eventType, eventId, attempt + 1);
          }

          console.error(`Error adding event ${eventType}:${eventId}:`, error);
          return false;
        }
      };

      // Process events in batches
      for (let i = 0; i < allEvents.length; i += batchSize) {
        const batch = allEvents.slice(i, i + batchSize);
        const results = await Promise.all(
          batch.map((event) => addEventWithBackoff(event.type, event.id))
        );

        // Count successful additions
        const successfulAdds = results.filter((result) => result).length;
        successCount += successfulAdds;
        failCount += batch.length - successfulAdds;

        // Add a small delay between batches
        if (i + batchSize < allEvents.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      const calendarUrl = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(calendarId)}`;
      const addUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(calendarId)}`;

      return res.status(200).json({
        success: true,
        calendarId: calendarId,
        calendarUrl: calendarUrl,
        addUrl: addUrl,
        stats: {
          exams: exams.length,
          deliverables: deliverables.length,
          todos: todos.length,
          successCount,
          failCount,
        },
        message: `Successfully added ${successCount} events to your calendar. Failed to add ${failCount} events.`,
      });
    } catch (error) {
      console.error(`Error adding course to calendar: ${error}`);
      return res
        .status(500)
        .json({ error: "Failed to add course to calendar" });
    }
  },

  // Get calendar link for sharing or opening
  getCalendarLink: async (req, res) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = userDoc.data() as User;
      const calendarId = user.calendarLink;

      if (!calendarId) {
        return res
          .status(404)
          .json({ error: "No calendar found for this user" });
      }

      const calendarDetails = await calendar.calendars.get({
        calendarId: calendarId,
      });

      // Generate URL for viewing the calendar
      const addUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(calendarId)}`;

      return res.status(200).json({
        success: true,
        calendarId: calendarId,
        calendarName: calendarDetails.data.summary,
        addUrl: addUrl,
      });
    } catch (error) {
      console.error(`Error getting calendar link: ${error}`);
      return res.status(500).json({ error: "Failed to get calendar link" });
    }
  },
  clearCalendarEvents: async (req, res) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = userDoc.data() as User;
      const calendarId = user.calendarLink;

      if (!calendarId) {
        return res
          .status(404)
          .json({ error: "No calendar found for this user" });
      }

      // Get all events from the calendar
      const events = await calendar.events.list({
        calendarId: calendarId,
        singleEvents: true,
        maxResults: 2500, // Google Calendar API limit
      });

      if (!events.data.items || events.data.items.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No events found to delete",
        });
      }

      // Implement batch processing with delay to avoid rate limits
      const batchSize = 10; // Process in small batches
      const totalEvents = events.data.items.length;
      let processedCount = 0;
      let failedCount = 0;

      // Helper function to delete with exponential backoff
      const deleteWithBackoff = async (eventId: string, attempt = 1) => {
        const maxAttempts = 5;
        const baseDelay = 1000; // 1 second

        try {
          await calendar.events.delete({
            calendarId: calendarId,
            eventId: eventId,
          });
          return true;
        } catch (error: any) {
          if (
            error.code === 429 || // Too Many Requests
            (error.code >= 500 && error.code < 600) // Server errors
          ) {
            if (attempt >= maxAttempts) {
              console.error(
                `Failed to delete event ${eventId} after ${maxAttempts} attempts`
              );
              return false;
            }

            // Exponential backoff with jitter
            const delay =
              baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
            console.log(
              `Rate limit hit. Retrying in ${delay}ms (attempt ${attempt})`
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
            return deleteWithBackoff(eventId, attempt + 1);
          }

          console.error(`Error deleting event ${eventId}:`, error);
          return false;
        }
      };

      // Process events in batches
      for (let i = 0; i < totalEvents; i += batchSize) {
        const batch = events.data.items.slice(i, i + batchSize);
        const results = await Promise.all(
          batch.map((event) => deleteWithBackoff(event.id as string))
        );

        // Count successful deletions
        const successfulDeletes = results.filter((result) => result).length;
        processedCount += successfulDeletes;
        failedCount += batch.length - successfulDeletes;

        // Add a small delay between batches
        if (i + batchSize < totalEvents) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      return res.status(200).json({
        success: true,
        message: `Successfully deleted ${processedCount} events from your calendar. Failed to delete ${failedCount} events.`,
      });
    } catch (error) {
      console.error(`Error clearing calendar events: ${error}`);
      return res.status(500).json({ error: "Failed to clear calendar events" });
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

    const calId = response.data.id;
    if (!calId) {
      throw new Error("Calendar creation failed: No ID returned");
    }

    await calendar.acl.insert({
      calendarId: calId,
      requestBody: {
        role: "writer",
        scope: { type: "user", value: user.email },
      },
    });

    await db.collection("users").doc(userId).update({
      calendarLink: calId,
    });

    return calId;
  } catch (error) {
    console.error("Error creating public calendar:", error);
    throw error;
  }
};

const createExamEvent = async (
  userId: string,
  examId: string,
  eventPromises: Promise<any>[]
) => {
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    const user = userDoc.data() as User;
    let calendarId = user.calendarLink;
    if (!calendarId) {
      calendarId = await createCalendar(userId, user);
    }

    const examDoc = await db.collection("exams").doc(examId).get();
    if (!examDoc.exists) {
      return "Exam does not exist";
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
      reminders: {
        useDefault: false,
        overrides: [{ method: "popup", minutes: 60 }],
      },
    };

    eventPromises.push(
      calendar.events.insert({
        calendarId: calendarId,
        requestBody: event,
      })
    );
  } catch (error) {
    console.error(`Error creating exam event in calendar: ${error}`);
    throw error;
  }
};

const createFinalDeliverableTask = async (
  userId: string,
  deliverableId: string,
  eventPromises: Promise<any>[]
) => {
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    const user = userDoc.data() as User;
    let calendarId = user.calendarLink;
    if (!calendarId) {
      calendarId = await createCalendar(userId, user);
    }

    const deliverableDoc = await db
      .collection("finalDeliverables")
      .doc(deliverableId)
      .get();
    if (!deliverableDoc.exists) {
      return "Final Deliverable does not exist";
    }
    const deliverable = deliverableDoc.data() as FinalDeliverable;

    const task = {
      summary: deliverable.title,
      start: {
        dateTime: deliverable.dueDate.toDate().toISOString(),
        timeZone: "America/New_York",
      },
      end: {
        dateTime: deliverable.dueDate.toDate().toISOString(),
        timeZone: "America/New_York",
      },
      colorId: "11",
      reminders: {
        useDefault: false,
        overrides: [{ method: "popup", minutes: 30 }],
      },
    };

    eventPromises.push(
      calendar.events.insert({
        calendarId: calendarId,
        requestBody: task,
      })
    );
  } catch (error) {
    console.error(
      `Error creating final deliverable task in calendar: ${error}`
    );
    throw error;
  }
};

const createTask = async (
  userId: string,
  taskId: string,
  eventPromises: Promise<any>[]
) => {
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    const user = userDoc.data() as User;
    let calendarId = user.calendarLink;
    if (!calendarId) {
      calendarId = await createCalendar(userId, user);
    }

    const taskDoc = await db.collection("todos").doc(taskId).get();
    if (!taskDoc.exists) {
      return "Task does not exist";
    }
    const todo = taskDoc.data() as Todo;

    let dateTimeValue;
    if (todo.date && typeof todo.date.toDate === "function") {
      // It's already a Firestore Timestamp object
      dateTimeValue = todo.date.toDate().toISOString();
    } else if (todo.date && todo.date.seconds !== undefined) {
      // It's a serialized timestamp object
      dateTimeValue = new Date(todo.date.seconds * 1000).toISOString();
    } else {
      console.warn(
        `Todo ${taskId} has invalid date format, using current time`
      );
      dateTimeValue = new Date().toISOString();
    }

    const task = {
      summary: `${todo.courseCode}: ${todo.title}`,
      start: {
        dateTime: dateTimeValue,
        timeZone: "America/New_York",
      },
      end: {
        dateTime: dateTimeValue,
        timeZone: "America/New_York",
      },
      colorId: todo.eventType == "Exam" ? "11" : "3",
      reminders: {
        useDefault: false,
        overrides: [{ method: "popup", minutes: 30 }],
      },
    };

    eventPromises.push(
      calendar.events.insert({
        calendarId: calendarId,
        requestBody: task,
      })
    );
  } catch (error) {
    console.error(`Error creating task in calendar: ${error}`);
    throw error;
  }
};

// Helper functions for batch processing
const processExam = async (userId: string, examId: string) => {
  const userDoc = await db.collection("users").doc(userId).get();
  const user = userDoc.data() as User;
  let calendarId = user.calendarLink;
  if (!calendarId) {
    calendarId = await createCalendar(userId, user);
  }

  const examDoc = await db.collection("exams").doc(examId).get();
  if (!examDoc.exists) {
    throw new Error("Exam does not exist");
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
    reminders: {
      useDefault: false,
      overrides: [{ method: "popup", minutes: 60 }],
    },
  };

  return await calendar.events.insert({
    calendarId: calendarId,
    requestBody: event,
  });
};

const processDeliverable = async (userId: string, deliverableId: string) => {
  const userDoc = await db.collection("users").doc(userId).get();
  const user = userDoc.data() as User;
  let calendarId = user.calendarLink;
  if (!calendarId) {
    calendarId = await createCalendar(userId, user);
  }

  const deliverableDoc = await db
    .collection("finalDeliverables")
    .doc(deliverableId)
    .get();
  if (!deliverableDoc.exists) {
    throw new Error("Final Deliverable does not exist");
  }
  const deliverable = deliverableDoc.data() as FinalDeliverable;

  const task = {
    summary: deliverable.title,
    start: {
      dateTime: deliverable.dueDate.toDate().toISOString(),
      timeZone: "America/New_York",
    },
    end: {
      dateTime: deliverable.dueDate.toDate().toISOString(),
      timeZone: "America/New_York",
    },
    colorId: "11",
    reminders: {
      useDefault: false,
      overrides: [{ method: "popup", minutes: 30 }],
    },
  };

  return await calendar.events.insert({
    calendarId: calendarId,
    requestBody: task,
  });
};

const processTodo = async (userId: string, todoId: string) => {
  const userDoc = await db.collection("users").doc(userId).get();
  const user = userDoc.data() as User;
  let calendarId = user.calendarLink;
  if (!calendarId) {
    calendarId = await createCalendar(userId, user);
  }

  const todoDoc = await db.collection("todos").doc(todoId).get();
  if (!todoDoc.exists) {
    throw new Error("Task does not exist");
  }
  const todo = todoDoc.data() as Todo;

  let dateTimeValue;
  if (todo.date && typeof todo.date.toDate === "function") {
    // It's already a Firestore Timestamp object
    dateTimeValue = todo.date.toDate().toISOString();
  } else if (todo.date && todo.date.seconds !== undefined) {
    // It's a serialized timestamp object
    dateTimeValue = new Date(todo.date.seconds * 1000).toISOString();
  } else {
    console.warn(`Todo ${todoId} has invalid date format, using current time`);
    dateTimeValue = new Date().toISOString();
  }

  const task = {
    summary: `${todo.courseCode}: ${todo.title}`,
    start: {
      dateTime: dateTimeValue,
      timeZone: "America/New_York",
    },
    end: {
      dateTime: dateTimeValue,
      timeZone: "America/New_York",
    },
    colorId: todo.eventType == "Exam" ? "11" : "3",
    reminders: {
      useDefault: false,
      overrides: [{ method: "popup", minutes: 30 }],
    },
  };

  return await calendar.events.insert({
    calendarId: calendarId,
    requestBody: task,
  });
};

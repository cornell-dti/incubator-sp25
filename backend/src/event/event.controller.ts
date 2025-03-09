import { db } from "../config/firebase";
import { Event } from "./event.type";
import { EventRequestHandlers } from "../requestTypes";

export const eventController: EventRequestHandlers = {
  getAllEvents: async (req, res) => {
    try {
      const snapshot = await db.collection("events").get();
      const events: Event[] = [];

      snapshot.forEach((doc) => {
        events.push({
          id: doc.id,
          ...(doc.data() as Event),
        });
      });

      res.status(200).json(events);
    } catch (error) {
      console.error("Error getting events:", error);
      res.status(500).json({ error: "Failed to retrieve events" });
    }
  },
  createEvent: async (req, res) => {
    try {
      const eventData: Event = req.body;

      if (
        !eventData.courseId ||
        !eventData.userId ||
        !eventData.title ||
        !eventData.startTime ||
        !eventData.endTime ||
        !eventData.eventType ||
        !eventData.weight
      ) {
        return res.status(400).json({
          error: "Missing required fields. All event properties are required.",
        });
      }

      const docRef = await db.collection("events").add(eventData);

      res.status(201).json({
        id: docRef.id,
        ...eventData,
      });
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ error: "Failed to create event" });
    }
  },

  updateEvent: async (req, res) => {
    try {
      const eventId = req.params.id;
      const eventData = req.body;

      const eventRef = db.collection("events").doc(eventId);
      const eventDoc = await eventRef.get();

      if (!eventDoc.exists) {
        return res.status(404).json({ error: "Event not found" });
      }

      await eventRef.update(eventData);

      const updatedDoc = await eventRef.get();

      res.status(200).json({
        id: eventId,
        ...updatedDoc.data(),
      });
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ error: "Failed to update event" });
    }
  },

  deleteEvent: async (req, res) => {
    try {
      const eventId = req.params.id;

      const eventRef = db.collection("events").doc(eventId);
      const eventDoc = await eventRef.get();

      if (!eventDoc.exists) {
        return res.status(404).json({ error: "Event not found" });
      }

      await eventRef.delete();

      res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ error: "Failed to delete event" });
    }
  },
};

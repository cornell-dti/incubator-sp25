import { db } from "../config/firebase";
import { FinalDeliverable } from "../types";
import { FinalDeliverableRequestHandlers } from "../types/requests";

export const finalDeliverableController: FinalDeliverableRequestHandlers = {
  getAllDeliverables: async (req, res) => {
    try {
      const snapshot = await db.collection("finalDeliverables").get();
      const deliverables: FinalDeliverable[] = [];

      snapshot.forEach((doc) => {
        deliverables.push({
          id: doc.id,
          ...(doc.data() as FinalDeliverable),
        });
      });

      res.status(200).json(deliverables);
    } catch (error) {
      console.error("Error getting final deliverables:", error);
      res.status(500).json({ error: "Failed to retrieve final deliverables" });
    }
  },
  createDeliverable: async (req, res) => {
    try {
      const deliverableData: FinalDeliverable = req.body;

      if (
        !deliverableData.courseId ||
        !deliverableData.title ||
        !deliverableData.dueDate
      ) {
        return res.status(400).json({
          error:
            "Missing required fields. All final deliverable properties are required.",
        });
      }

      const docRef = await db
        .collection("finalDeliverables")
        .add(deliverableData);

      res.status(201).json({
        id: docRef.id,
        ...deliverableData,
      });
    } catch (error) {
      console.error("Error creating final deliverable:", error);
      res.status(500).json({ error: "Failed to create final deliverable" });
    }
  },

  updateDeliverable: async (req, res) => {
    try {
      const deliverableId = req.params.id;
      const deliverableData = req.body;

      const deliverableRef = db
        .collection("finalDeliverables")
        .doc(deliverableId);
      const deliverableDoc = await deliverableRef.get();

      const docData = deliverableDoc.data();

      if (!docData) {
        return res.status(404).json({ error: "Final deliverable not found" });
      }

      if (docData.userId !== req.user?.uid) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      await deliverableRef.update(deliverableData);

      const updatedDoc = await deliverableRef.get();

      res.status(200).json({
        id: deliverableId,
        ...updatedDoc.data(),
      });
    } catch (error) {
      console.error("Error updating final deliverable:", error);
      res.status(500).json({ error: "Failed to update final deliverable" });
    }
  },

  deleteDeliverable: async (req, res) => {
    try {
      const deliverableId = req.params.id;

      const deliverableRef = db
        .collection("finalDeliverables")
        .doc(deliverableId);
      const deliverableDoc = await deliverableRef.get();

      const docData = deliverableDoc.data();

      if (!docData) {
        return res.status(404).json({ error: "Final deliverable not found" });
      }

      if (docData.userId !== req.user?.uid) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      await deliverableRef.delete();

      res
        .status(200)
        .json({ message: "Final deliverable deleted successfully" });
    } catch (error) {
      console.error("Error deleting final deliverable:", error);
      res.status(500).json({ error: "Failed to delete final deliverable" });
    }
  },

  getDeliverableByCourseId: async (req, res) => {
    try {
      const courseId = req.params.courseId;

      const snapshot = await db
        .collection("finalDeliverables")
        .where("courseId", "==", courseId)
        .get();

      const deliverables: FinalDeliverable[] = [];

      snapshot.forEach((doc) => {
        deliverables.push({
          id: doc.id,
          ...(doc.data() as FinalDeliverable),
        });
      });

      res.status(200).json(deliverables);
    } catch (error) {
      console.error("Error getting final deliverables by course ID:", error);
      res.status(500).json({ error: "Failed to retrieve final deliverables" });
    }
  },
};

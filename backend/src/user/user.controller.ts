import { db } from "../config/firebase";
import { User } from "./user.type";
import { Timestamp } from "firebase-admin/firestore";
import { UserRequestHandlers } from "../requestTypes";

export const userController: UserRequestHandlers = {
  getAllUsers: async (req, res) => {
    try {
      const usersSnapshot = await db.collection("users").get();
      const users: User[] = [];

      usersSnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...(doc.data() as User),
        });
      });

      res.status(200).json(users);
    } catch (error) {
      console.error("Error getting users:", error);
      res.status(500).json({ error: "Failed to retrieve users" });
    }
  },

  getUserById: async (req, res) => {
    try {
      const userDoc = await db.collection("users").doc(req.params.id).get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({
        id: userDoc.id,
        ...userDoc.data(),
      });
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ error: "Failed to retrieve user" });
    }
  },

  createUser: async (req, res) => {
    try {
      const userData: User = req.body;

      // Validate required fields
      if (!userData.email || !userData.name) {
        return res.status(400).json({ error: "Email and name are required" });
      }

      // Add timestamps
      const now = Timestamp.now();
      const userWithTimestamps = {
        ...userData,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await db.collection("users").add(userWithTimestamps);

      res.status(201).json({
        id: docRef.id,
        ...userWithTimestamps,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  },

  updateUser: async (req, res) => {
    try {
      const id = req.params.id;
      const userData = req.body;

      // Check if user exists
      const userRef = db.collection("users").doc(id);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }

      // Add update timestamp
      const updatedUser = {
        ...userData,
        updatedAt: Timestamp.now(),
      };

      await userRef.update(updatedUser);

      // Get the updated document
      const updatedDoc = await userRef.get();

      res.status(200).json({
        id,
        ...updatedDoc.data(),
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const id = req.params.id;

      // Check if user exists
      const userRef = db.collection("users").doc(id);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }

      await userRef.delete();

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  },
};

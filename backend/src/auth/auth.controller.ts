import { Request, Response } from "express";
import { db, auth } from "../config/firebase";
import { Timestamp } from "firebase-admin/firestore";
import { AuthRequest } from "../middleware/authenticate";
import { User } from "../types";

export const authController = {
  verifyToken: async (req: Request, res: Response): Promise<void> => {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        res.status(400).json({ error: "ID token is required" });
        return;
      }

      // Verify the token
      const decodedToken = await auth.verifyIdToken(idToken);
      const uid = decodedToken.uid;

      // Check if user exists in your database
      const userDoc = await db.collection("users").doc(uid).get();
      if (!userDoc.exists) {
        const userData: User = {
          email: decodedToken.email || "",
          name: decodedToken.name || decodedToken.display_name || "User",
          courses: [],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        await db.collection("users").doc(uid).set(userData);

        res.status(201).json({
          id: uid,
          ...userData,
          isNewUser: true,
        });
        return;
      }

      // Update last login time
      await db.collection("users").doc(uid).update({
        updatedAt: Timestamp.now(),
      });

      res.status(200).json({
        id: uid,
        ...userDoc.data(),
        isNewUser: false,
      });
    } catch (error) {
      console.error("Error verifying token:", error);
      res.status(401).json({ error: "Invalid ID token" });
    }
  },

  getCurrentUser: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { uid } = req.user!;

      const userDoc = await db.collection("users").doc(uid).get();

      if (!userDoc.exists) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json({
        id: uid,
        ...userDoc.data(),
      });
    } catch (error) {
      console.error("Error getting current user:", error);
      res.status(500).json({ error: "Failed to get current user" });
    }
  },
};

import { RequestHandler } from "express";
import admin from "../config/firebase";

const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: "Authorization header not found" });
      return;
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    res.locals.userId = decodedToken.uid;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Unauthorized" });
  }
};

export default authMiddleware;

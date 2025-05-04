import { Request, Response, NextFunction } from "express";
import { auth } from "../config/firebase";

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    name?: string;
  };
}

/**
 * Express middleware for authenticating requests using Firebase ID tokens.
 *
 * This middleware:
 * 1. Extracts the Bearer token from the Authorization header
 * 2. Verifies the token with Firebase Auth
 * 3. Attaches user information to the request object
 * 4. Responds with 401 if authentication fails
 *
 * @param {AuthRequest} req - Express request object with potential user property
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function to continue middleware chain
 * @returns {Promise<void>} Promise that resolves when middleware completes
 *
 * @example
 * // Apply to a single route
 * app.get('/protected', authMiddleware, (req: AuthRequest, res) => {
 *   res.json({ user: req.user });
 * });
 *
 * @throws {401} When token is missing, invalid, or expired
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ error: "Unauthorized: Missing or invalid token format" });
      return;
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(idToken);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || "",
      name: decodedToken.name || "",
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

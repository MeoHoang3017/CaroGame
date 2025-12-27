import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        isGuest: boolean;
      };
    }
  }
}

/**
 * Authentication Middleware
 * @description Verifies JWT token from Authorization header and attaches user info to request
 */
export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Expect header format: Authorization: Bearer <token>
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: "Access token missing",
      });
      return;
    }

    const token = authHeader.split(" ")[1]; // Take the part after "Bearer"

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
      return;
    }

    try {
      const user = verifyAccessToken(token);
      req.user = user; // Attach decoded user info to the request
      next();
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        res.status(401).json({
          success: false,
          message: "Token expired",
        });
        return;
      } else {
        res.status(403).json({
          success: false,
          message: "Invalid token",
        });
        return;
      }
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Authentication error",
      error: error.message,
    });
  }
};

/**
 * Optional Authentication Middleware
 * @description Attaches user info if token exists, but doesn't require it
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers["authorization"];

    if (authHeader) {
      const token = authHeader.split(" ")[1];
      if (token) {
        try {
          const user = verifyAccessToken(token);
          req.user = user;
        } catch (error) {
          // Ignore errors for optional auth
        }
      }
    }
    next();
  } catch (error) {
    next();
  }
};


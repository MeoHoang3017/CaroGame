import type { Request, Response } from "express";
import { authService } from "../services/auth.service";
import type { LoginUser, RegisterUser } from "../types/Auth";
import { SuccessResponse, ErrorResponse, sendResponse } from "../utils/response";

/**
 * Auth Controller
 * @description Handles HTTP requests for authentication operations
 */
export class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const data: RegisterUser = req.body;
      
      // Validate required fields
      const missingFields: string[] = [];
      if (!data.username) missingFields.push("username");
      if (!data.email) missingFields.push("email");
      if (!data.password) missingFields.push("password");
      
      if (missingFields.length > 0) {
        const response = ErrorResponse.MISSING_FIELDS(missingFields);
        return sendResponse(res, response);
      }

      const result = await authService.register(data);
      const response = SuccessResponse.REGISTER_SUCCESS(result);
      sendResponse(res, response);
    } catch (error: any) {
      const statusCode = error.statusCode || 400;
      const response = ErrorResponse.CUSTOM(
        statusCode,
        error.message || "Registration failed",
        error
      );
      sendResponse(res, response);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginUser = req.body;
      
      // Validate required fields
      const missingFields: string[] = [];
      if (!email) missingFields.push("email");
      if (!password) missingFields.push("password");
      
      if (missingFields.length > 0) {
        const response = ErrorResponse.MISSING_FIELDS(missingFields);
        return sendResponse(res, response);
      }

      const result = await authService.login(email, password);
      const response = SuccessResponse.LOGIN_SUCCESS(result);
      sendResponse(res, response);
    } catch (error: any) {
      const statusCode = error.statusCode || 401;
      const response = ErrorResponse.CUSTOM(
        statusCode,
        error.message || "Login failed",
        error
      );
      sendResponse(res, response);
    }
  }
}

export const authController = new AuthController();


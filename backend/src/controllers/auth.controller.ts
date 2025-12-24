import type { Request, Response } from "express";
import { authService } from "../services/auth.service";
import type { LoginUser, RegisterUser } from "../types/Auth";

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
      if (!data.username || !data.email || !data.password) {
        res.status(400).json({
          success: false,
          message: "Username, email, and password are required"
        });
        return;
      }

      const result = await authService.register(data);
      
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Registration failed"
      });
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
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Email and password are required"
        });
        return;
      }

      const result = await authService.login(email, password);
      
      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || "Login failed"
      });
    }
  }
}

export const authController = new AuthController();


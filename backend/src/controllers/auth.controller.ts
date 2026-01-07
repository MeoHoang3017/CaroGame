import type { Request, Response } from "express";
import { authService } from "../services/auth.service";
import type { LoginUser, RegisterUser } from "../types/Auth";
import { SuccessResponse, ErrorResponse, sendResponse } from "../utils/response";
import { securityLogger } from "../utils/security-logger";

/**
 * Auth Controller
 * @description Handles HTTP requests for authentication operations
 */
export class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   * Note: Validation is handled by validation middleware in routes
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const data: RegisterUser = req.body;
      console.log(data);
      // Validation đã được xử lý bởi validation middleware
      // Chỉ cần gọi service và xử lý kết quả
      const result = await authService.register(data);
      const response = SuccessResponse.REGISTER_SUCCESS(result);
      sendResponse(res, response);
    } catch (error: any) {
      const statusCode = error.statusCode || 400;
      // Không expose chi tiết lỗi trong production
      const errorMessage = process.env.NODE_ENV === 'production' 
        ? 'Registration failed. Please check your input and try again.'
        : error.message || "Registration failed";
      
      const response = ErrorResponse.CUSTOM(
        statusCode,
        errorMessage,
        process.env.NODE_ENV === 'development' ? error : undefined
      );
      sendResponse(res, response);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   * Note: Validation is handled by validation middleware in routes
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginUser = req.body;
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('user-agent') || 'unknown';
      
      // Validation đã được xử lý bởi validation middleware
      // Chỉ cần gọi service và xử lý kết quả
      const result = await authService.login(email, password);
      
      // Log successful login
      securityLogger.logSuccessfulLogin(
        result.user.id.toString(),
        email,
        ip,
        userAgent
      );
      
      const response = SuccessResponse.LOGIN_SUCCESS(result);
      sendResponse(res, response);
    } catch (error: any) {
      const statusCode = error.statusCode || 401;
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('user-agent') || 'unknown';
      
      // Log failed login attempt
      securityLogger.logFailedLogin(
        (req.body as LoginUser).email || 'unknown',
        ip,
        userAgent
      );
      
      // Không expose thông tin về user tồn tại hay không trong production
      const errorMessage = process.env.NODE_ENV === 'production'
        ? 'Invalid email or password'
        : error.message || "Login failed";
      
      const response = ErrorResponse.CUSTOM(
        statusCode,
        errorMessage,
        process.env.NODE_ENV === 'development' ? error : undefined
      );
      sendResponse(res, response);
    }
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        const response = ErrorResponse.CUSTOM(400, 'Refresh token is required');
        sendResponse(res, response);
        return;
      }

      const result = await authService.refresh(refreshToken);
      const response = SuccessResponse.CUSTOM(200, 'Token refreshed successfully', {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
      sendResponse(res, response);
    } catch (error: any) {
      const statusCode = error.statusCode || 401;
      const errorMessage = error.message || 'Failed to refresh token';
      const response = ErrorResponse.CUSTOM(
        statusCode,
        errorMessage,
        process.env.NODE_ENV === 'development' ? error : undefined
      );
      sendResponse(res, response);
    }
  }
}

export const authController = new AuthController();


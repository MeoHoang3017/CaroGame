import type { Request, Response } from "express";
import { userService } from "../services/user.service";
import type { UserModel } from "../types/User";
import { SuccessResponse, ErrorResponse, sendResponse } from "../utils/response";
import { SYSTEM_MESSAGES } from "../constants/messages";

/**
 * User Controller
 * @description Handles HTTP requests for user operations
 */
export class UserController {
  /**
   * Get user by ID
   * GET /api/users/:id
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        const response = ErrorResponse.MISSING_FIELDS(["id"]);
        return sendResponse(res, response);
      }

      const user = await userService.getUserById(id);
      
      if (!user) {
        const response = ErrorResponse.NOT_FOUND("User");
        return sendResponse(res, response);
      }

      const response = SuccessResponse.ITEM("User", user);
      sendResponse(res, response);
    } catch (error: any) {
      const response = ErrorResponse.BAD_REQUEST;
      sendResponse(res, response);
    }
  }

  /**
   * Get all users
   * GET /api/users
   */
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = parseInt(req.query.skip as string) || 0;

      const users = await userService.getAllUsers(limit, skip);
      const total = await userService.getUserCount();

      const response = SuccessResponse.CUSTOM(200, "Users retrieved successfully", {
        users,
        pagination: {
          total,
          limit,
          skip,
          hasMore: skip + limit < total
        }
      });
      sendResponse(res, response);
    } catch (error: any) {
      const response = ErrorResponse.SERVER_ERROR;
      sendResponse(res, response);
    }
  }

  /**
   * Get user by email
   * GET /api/users/email/:email
   */
  async getUserByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;
      
      if (!email) {
        const response = ErrorResponse.MISSING_FIELDS(["email"]);
        return sendResponse(res, response);
      }

      const user = await userService.getUserByEmail(email);
      
      if (!user) {
        const response = ErrorResponse.NOT_FOUND("User");
        return sendResponse(res, response);
      }

      const response = SuccessResponse.ITEM("User", user);
      sendResponse(res, response);
    } catch (error: any) {
      const response = ErrorResponse.BAD_REQUEST;
      sendResponse(res, response);
    }
  }

  /**
   * Get user by username
   * GET /api/users/username/:username
   */
  async getUserByUsername(req: Request, res: Response): Promise<void> {
    try {
      const { username } = req.params;
      
      if (!username) {
        const response = ErrorResponse.MISSING_FIELDS(["username"]);
        return sendResponse(res, response);
      }

      const user = await userService.getUserByUsername(username);
      
      if (!user) {
        const response = ErrorResponse.NOT_FOUND("User");
        return sendResponse(res, response);
      }

      const response = SuccessResponse.ITEM("User", user);
      sendResponse(res, response);
    } catch (error: any) {
      const response = ErrorResponse.BAD_REQUEST;
      sendResponse(res, response);
    }
  }

  /**
   * Create guest user
   * POST /api/users/guest
   */
  async createGuestUser(req: Request, res: Response): Promise<void> {
    try {
      const { username } = req.body;
      
      if (!username) {
        const response = ErrorResponse.MISSING_FIELDS(["username"]);
        return sendResponse(res, response);
      }

      const guestUser = await userService.createGuestUser(username);
      const response = SuccessResponse.CREATED("Guest user", guestUser);
      sendResponse(res, response);
    } catch (error: any) {
      const statusCode = error.statusCode || 400;
      const response = ErrorResponse.CUSTOM(
        statusCode,
        error.message || "Failed to create guest user",
        error
      );
      sendResponse(res, response);
    }
  }

  /**
   * Update user
   * PUT /api/users/:id
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: Partial<UserModel> = req.body;
      
      if (!id) {
        const response = ErrorResponse.MISSING_FIELDS(["id"]);
        return sendResponse(res, response);
      }

      const updatedUser = await userService.updateUser(id, updateData);
      
      if (!updatedUser) {
        const response = ErrorResponse.NOT_FOUND("User");
        return sendResponse(res, response);
      }

      const response = SuccessResponse.UPDATED("User", updatedUser);
      sendResponse(res, response);
    } catch (error: any) {
      const statusCode = error.statusCode || 400;
      const response = ErrorResponse.CUSTOM(
        statusCode,
        error.message || SYSTEM_MESSAGES.USER.UPDATE_FAILED,
        error
      );
      sendResponse(res, response);
    }
  }

  /**
   * Update user password
   * PUT /api/users/:id/password
   */
  async updatePassword(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      
      if (!id) {
        const response = ErrorResponse.MISSING_FIELDS(["id"]);
        return sendResponse(res, response);
      }

      if (!newPassword) {
        const response = ErrorResponse.MISSING_FIELDS(["newPassword"]);
        return sendResponse(res, response);
      }

      const updatedUser = await userService.updatePassword(id, newPassword);
      
      if (!updatedUser) {
        const response = ErrorResponse.NOT_FOUND("User");
        return sendResponse(res, response);
      }

      const response = SuccessResponse.CUSTOM(200, "Password updated successfully", null);
      sendResponse(res, response);
    } catch (error: any) {
      const statusCode = error.statusCode || 400;
      const response = ErrorResponse.CUSTOM(
        statusCode,
        error.message || "Failed to update password",
        error
      );
      sendResponse(res, response);
    }
  }

  /**
   * Delete user
   * DELETE /api/users/:id
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        const response = ErrorResponse.MISSING_FIELDS(["id"]);
        return sendResponse(res, response);
      }

      const deletedUser = await userService.deleteUser(id);
      
      if (!deletedUser) {
        const response = ErrorResponse.NOT_FOUND("User");
        return sendResponse(res, response);
      }

      const response = SuccessResponse.DELETED("User");
      sendResponse(res, response);
    } catch (error: any) {
      const statusCode = error.statusCode || 400;
      const response = ErrorResponse.CUSTOM(
        statusCode,
        error.message || SYSTEM_MESSAGES.USER.DELETE_FAILED,
        error
      );
      sendResponse(res, response);
    }
  }

  /**
   * Get users by guest status
   * GET /api/users/guests/:isGuest
   */
  async getUsersByGuestStatus(req: Request, res: Response): Promise<void> {
    try {
      const { isGuest } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = parseInt(req.query.skip as string) || 0;

      const isGuestBool = isGuest === 'true';
      const users = await userService.getUsersByGuestStatus(isGuestBool, limit, skip);

      const response = SuccessResponse.LIST("Users", users);
      sendResponse(res, response);
    } catch (error: any) {
      const response = ErrorResponse.BAD_REQUEST;
      sendResponse(res, response);
    }
  }

  /**
   * Get user count
   * GET /api/users/count
   */
  async getUserCount(req: Request, res: Response): Promise<void> {
    try {
      const count = await userService.getUserCount();

      const response = SuccessResponse.CUSTOM(200, "User count retrieved successfully", { count });
      sendResponse(res, response);
    } catch (error: any) {
      const response = ErrorResponse.SERVER_ERROR;
      sendResponse(res, response);
    }
  }
}

export const userController = new UserController();


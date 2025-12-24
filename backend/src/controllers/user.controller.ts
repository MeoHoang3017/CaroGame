import type { Request, Response } from "express";
import { userService } from "../services/user.service";
import type { UserModel } from "../types/User";

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
        res.status(400).json({
          success: false,
          message: "User ID is required"
        });
        return;
      }

      const user = await userService.getUserById(id);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found"
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data: user
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve user"
      });
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

      res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: {
          users,
          pagination: {
            total,
            limit,
            skip,
            hasMore: skip + limit < total
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve users"
      });
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
        res.status(400).json({
          success: false,
          message: "Email is required"
        });
        return;
      }

      const user = await userService.getUserByEmail(email);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found"
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data: user
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve user"
      });
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
        res.status(400).json({
          success: false,
          message: "Username is required"
        });
        return;
      }

      const user = await userService.getUserByUsername(username);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found"
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data: user
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve user"
      });
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
        res.status(400).json({
          success: false,
          message: "Username is required"
        });
        return;
      }

      const guestUser = await userService.createGuestUser(username);
      
      res.status(201).json({
        success: true,
        message: "Guest user created successfully",
        data: guestUser
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create guest user"
      });
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
        res.status(400).json({
          success: false,
          message: "User ID is required"
        });
        return;
      }

      const updatedUser = await userService.updateUser(id, updateData);
      
      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: "User not found"
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updatedUser
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update user"
      });
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
        res.status(400).json({
          success: false,
          message: "User ID is required"
        });
        return;
      }

      if (!newPassword) {
        res.status(400).json({
          success: false,
          message: "New password is required"
        });
        return;
      }

      const updatedUser = await userService.updatePassword(id, newPassword);
      
      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: "User not found"
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Password updated successfully"
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update password"
      });
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
        res.status(400).json({
          success: false,
          message: "User ID is required"
        });
        return;
      }

      const deletedUser = await userService.deleteUser(id);
      
      if (!deletedUser) {
        res.status(404).json({
          success: false,
          message: "User not found"
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "User deleted successfully"
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to delete user"
      });
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

      res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: users
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to retrieve users"
      });
    }
  }

  /**
   * Get user count
   * GET /api/users/count
   */
  async getUserCount(req: Request, res: Response): Promise<void> {
    try {
      const count = await userService.getUserCount();

      res.status(200).json({
        success: true,
        message: "User count retrieved successfully",
        data: { count }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get user count"
      });
    }
  }
}

export const userController = new UserController();


/**
 * User Service
 * @description User Service is a service that handles user operations like CRUD operations
 * @package services
 * @module UserService
 * @exports UserService
 */

import User from "../models/user.model";
import type { UserModel } from "../types/User";
import * as Hasher from "../utils/hasher";
import { sanitizeEmail, sanitizeUsername, sanitizeString } from "../utils/sanitize";
import { userCache } from "../utils/cache";

export class UserService {
  /**
   * Get user by ID
   * @param userId - User ID
   * @returns User document or null
   */
  async getUserById(userId: string): Promise<UserModel | null> {
    try {
      // Try to get from cache first
      const cachedUser = await userCache.getById<UserModel>(userId);
      if (cachedUser) {
        return cachedUser;
      }

      // If not in cache, get from database
      const user = await User.findById(userId);
      const userModel = user as unknown as UserModel | null;

      // Cache the result if found
      if (userModel) {
        await userCache.setById(userId, userModel);
      }

      return userModel;
    } catch (error) {
      throw new Error('Invalid user ID format');
    }
  }

  /**
   * Get user by email
   * @param email - User email
   * @returns User document or null
   */
  async getUserByEmail(email: string): Promise<UserModel | null> {
    const sanitizedEmail = sanitizeEmail(email);

    // Try to get from cache first
    const cachedUser = await userCache.getByEmail<UserModel>(sanitizedEmail);
    if (cachedUser) {
      return cachedUser;
    }

    // If not in cache, get from database
    const user = await User.findOne({ email: sanitizedEmail });
    const userModel = user as unknown as UserModel | null;

    // Cache the result if found
    if (userModel) {
      await userCache.setByEmail(sanitizedEmail, userModel);
      // Also cache by ID for faster lookup
      const userId = (userModel as any)._id?.toString() || userModel.id;
      if (userId) {
        await userCache.setById(userId, userModel);
      }
    }

    return userModel;
  }

  /**
   * Get user by username
   * @param username - Username
   * @returns User document or null
   */
  async getUserByUsername(username: string): Promise<UserModel | null> {
    const sanitizedUsername = sanitizeUsername(username);

    // Try to get from cache first
    const cachedUser = await userCache.getByUsername<UserModel>(sanitizedUsername);
    if (cachedUser) {
      return cachedUser;
    }

    // If not in cache, get from database
    const user = await User.findOne({ username: sanitizedUsername });
    const userModel = user as unknown as UserModel | null;

    // Cache the result if found
    if (userModel) {
      await userCache.setByUsername(sanitizedUsername, userModel);
      // Also cache by ID and email for faster lookup
      const userId = (userModel as any)._id?.toString() || userModel.id;
      if (userId) {
        await userCache.setById(userId, userModel);
      }
      if (userModel.email) {
        await userCache.setByEmail(userModel.email, userModel);
      }
    }

    return userModel;
  }

  /**
   * Get all users
   * @param limit - Maximum number of users to return
   * @param skip - Number of users to skip
   * @returns Array of users
   */
  async getAllUsers(limit: number = 10, skip: number = 0): Promise<UserModel[]> {
    const users = await User.find()
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });
    return users as unknown as UserModel[];
  }

  /**
   * Create a guest user
   * @param username - Guest username
   * @returns Created user
   */
  async createGuestUser(username: string): Promise<UserModel> {
    const sanitizedUsername = sanitizeUsername(username);
    
    if (!sanitizedUsername || sanitizedUsername.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }

    const existingUser = await this.getUserByUsername(sanitizedUsername);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    const guestUser = (await User.create({
      username: sanitizedUsername,
      isGuest: true,
      email: `guest_${Date.now()}@guest.local`, // Temporary email for guests
    } as any)) as unknown as UserModel;

    // Cache the newly created user
    const userId = (guestUser as any)._id?.toString() || guestUser.id;
    if (userId) {
      await userCache.setById(userId, guestUser);
      await userCache.setByUsername(sanitizedUsername, guestUser);
      if (guestUser.email) {
        await userCache.setByEmail(guestUser.email, guestUser);
      }
    }

    return guestUser;
  }

  /**
   * Update user information
   * @param userId - User ID
   * @param updateData - Data to update
   * @returns Updated user
   */
async updateUser(userId: string, updateData: Partial<UserModel>): Promise<UserModel | null> {
    // Get old user data for cache invalidation
    const oldUser = await this.getUserById(userId);
    const oldEmail = oldUser?.email;
    const oldUsername = oldUser?.username;

    // Don't allow updating password through this method
    const { password, ...safeUpdateData } = updateData as any;
    
    // If email is being updated, check for uniqueness
    if (safeUpdateData.email) {
      const existingUser = await this.getUserByEmail(safeUpdateData.email);
      if (existingUser) {
        const existingUserId = (existingUser as any)._id?.toString() || existingUser.id;
        if (existingUserId !== userId) {
          throw new Error('Email already in use');
        }
      }
      safeUpdateData.email = sanitizeEmail(safeUpdateData.email);
    }

    // If username is being updated, check for uniqueness
    if (safeUpdateData.username) {
      safeUpdateData.username = sanitizeUsername(safeUpdateData.username);
      
      if (!safeUpdateData.username || safeUpdateData.username.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }

      const existingUser = await this.getUserByUsername(safeUpdateData.username);
      if (existingUser) {
        const existingUserId = (existingUser as any)._id?.toString() || existingUser.id;
        if (existingUserId !== userId) {
          throw new Error('Username already in use');
        }
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: safeUpdateData },
      { new: true, runValidators: true }
    );

    const userModel = updatedUser as unknown as UserModel | null;

    // Invalidate and update cache
    if (userModel) {
      const newEmail = userModel.email || oldEmail;
      const newUsername = userModel.username || oldUsername;
      
      // Invalidate old cache entries
      await userCache.invalidate(userId, oldEmail, oldUsername);
      
      // Cache updated user
      await userCache.setById(userId, userModel);
      if (newEmail) {
        await userCache.setByEmail(newEmail, userModel);
      }
      if (newUsername) {
        await userCache.setByUsername(newUsername, userModel);
      }
    }

    return userModel;
  }

  /**
   * Update user password
   * @param userId - User ID
   * @param newPassword - New password
   * @returns Updated user
   */
  async updatePassword(userId: string, newPassword: string): Promise<UserModel | null> {
    const hashedPassword = await Hasher.hashPassword(newPassword);
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { password: hashedPassword } },
      { new: true }
    );

    const userModel = updatedUser as unknown as UserModel | null;

    // Invalidate cache (password change doesn't affect other fields, but we refresh cache)
    if (userModel) {
      await userCache.invalidate(userId, userModel.email, userModel.username);
      // Re-cache the user
      await userCache.setById(userId, userModel);
      if (userModel.email) {
        await userCache.setByEmail(userModel.email, userModel);
      }
      if (userModel.username) {
        await userCache.setByUsername(userModel.username, userModel);
      }
    }

    return userModel;
  }

  /**
   * Delete user by ID
   * @param userId - User ID
   * @returns Deleted user or null
   */
  async deleteUser(userId: string): Promise<UserModel | null> {
    // Get user data before deletion for cache invalidation
    const user = await this.getUserById(userId);
    const email = user?.email;
    const username = user?.username;

    const deletedUser = await User.findByIdAndDelete(userId);
    const userModel = deletedUser as unknown as UserModel | null;

    // Invalidate cache
    if (userModel || user) {
      await userCache.invalidate(userId, email, username);
    }

    return userModel;
  }

  /**
   * Check if user exists
   * @param userId - User ID
   * @returns Boolean indicating if user exists
   */
  async userExists(userId: string): Promise<boolean> {
    try {
      const user = await User.findById(userId);
      return user !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user count
   * @returns Total number of users
   */
  async getUserCount(): Promise<number> {
    return await User.countDocuments();
  }

  /**
   * Get users by guest status
   * @param isGuest - Guest status filter
   * @param limit - Maximum number of users to return
   * @param skip - Number of users to skip
   * @returns Array of users
   */
  async getUsersByGuestStatus(
    isGuest: boolean,
    limit: number = 10,
    skip: number = 0
  ): Promise<UserModel[]> {
    const filter: any = { isGuest };
    const users = await User.find(filter)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });
    return users as unknown as UserModel[];
  }
}

export const userService = new UserService();

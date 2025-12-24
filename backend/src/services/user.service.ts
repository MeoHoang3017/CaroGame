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

export class UserService {
  /**
   * Get user by ID
   * @param userId - User ID
   * @returns User document or null
   */
  async getUserById(userId: string): Promise<UserModel | null> {
    try {
      const user = await User.findById(userId);
      return user as unknown as UserModel | null;
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
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    return user as unknown as UserModel | null;
  }

  /**
   * Get user by username
   * @param username - Username
   * @returns User document or null
   */
  async getUserByUsername(username: string): Promise<UserModel | null> {
    const user = await User.findOne({ username: username.trim() });
    return user as unknown as UserModel | null;
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
    const existingUser = await this.getUserByUsername(username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    const guestUser = (await User.create({
      username: username.trim(),
      isGuest: true,
      email: `guest_${Date.now()}@guest.local`, // Temporary email for guests
    } as any)) as unknown as UserModel;

    return guestUser;
  }

  /**
   * Update user information
   * @param userId - User ID
   * @param updateData - Data to update
   * @returns Updated user
   */
  async updateUser(userId: string, updateData: Partial<UserModel>): Promise<UserModel | null> {
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
      safeUpdateData.email = safeUpdateData.email.toLowerCase().trim();
    }

    // If username is being updated, check for uniqueness
    if (safeUpdateData.username) {
      const existingUser = await this.getUserByUsername(safeUpdateData.username);
      if (existingUser) {
        const existingUserId = (existingUser as any)._id?.toString() || existingUser.id;
        if (existingUserId !== userId) {
          throw new Error('Username already in use');
        }
      }
      safeUpdateData.username = safeUpdateData.username.trim();
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: safeUpdateData },
      { new: true, runValidators: true }
    );

    return updatedUser as unknown as UserModel | null;
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

    return updatedUser as unknown as UserModel | null;
  }

  /**
   * Delete user by ID
   * @param userId - User ID
   * @returns Deleted user or null
   */
  async deleteUser(userId: string): Promise<UserModel | null> {
    const deletedUser = await User.findByIdAndDelete(userId);
    return deletedUser as unknown as UserModel | null;
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

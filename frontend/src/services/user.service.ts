/**
 * User Service
 * Handles user-related API calls
 */

import { api, type ApiResponse } from '../utils/api'
import type { Match, User } from '../types/api.types'

/**
 * Get all users with pagination
 */
export const getAllUsers = async (
  limit: number = 10,
  skip: number = 0
): Promise<ApiResponse<User[]>> => {
  return api.get<User[]>(`/users?limit=${limit}&skip=${skip}`, false)
}

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<ApiResponse<User>> => {
  return api.get<User>(`/users/${userId}`, false)
}

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string): Promise<ApiResponse<User>> => {
  return api.get<User>(`/users/email/${encodeURIComponent(email)}`, false)
}

/**
 * Get user by username
 */
export const getUserByUsername = async (username: string): Promise<ApiResponse<User>> => {
  return api.get<User>(`/users/username/${encodeURIComponent(username)}`, false)
}

/**
 * Get total user count
 */
export const getUserCount = async (): Promise<ApiResponse<number>> => {
  return api.get<number>('/users/count', false)
}

/**
 * Get users by guest status
 */
export const getUsersByGuestStatus = async (
  isGuest: boolean,
  limit: number = 10,
  skip: number = 0
): Promise<ApiResponse<User[]>> => {
  return api.get<User[]>(`/users/guests/${isGuest}?limit=${limit}&skip=${skip}`, false)
}

/**
 * Create a guest user
 */
export const createGuestUser = async (username: string): Promise<ApiResponse<User>> => {
  return api.post<User>('/users/guest', { username }, false)
}

/**
 * Update user information
 */
export const updateUser = async (
  userId: string,
  data: Partial<User>
): Promise<ApiResponse<User>> => {
  return api.put<User>(`/users/${userId}`, data, true)
}

/**
 * Update user password
 */
export const updatePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<ApiResponse<null>> => {
  return api.put<null>(`/users/${userId}/password`, { oldPassword, newPassword }, true)
}

/**
 * Delete user
 */
export const deleteUser = async (userId: string): Promise<ApiResponse<null>> => {
  return api.delete<null>(`/users/${userId}`, true)
}


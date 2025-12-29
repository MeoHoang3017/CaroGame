/**
 * User Hooks
 * Custom hooks for user operations using TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as userService from '@/services/user.service'
import type { User } from '@/types/api.types'

/**
 * Hook to get current authenticated user
 * This should be used with the user ID from auth context/token
 */
export const useCurrentUser = (userId?: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUserById(userId!),
    enabled: !!userId,
    select: (data) => data.result,
  })
}

/**
 * Hook to get user by ID
 */
export const useUser = (userId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUserById(userId),
    enabled: enabled && !!userId,
    select: (data) => data.result,
  })
}

/**
 * Hook to get user by email
 */
export const useUserByEmail = (email: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['user', 'email', email],
    queryFn: () => userService.getUserByEmail(email),
    enabled: enabled && !!email,
    select: (data) => data.result,
  })
}

/**
 * Hook to get user by username
 */
export const useUserByUsername = (username: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['user', 'username', username],
    queryFn: () => userService.getUserByUsername(username),
    enabled: enabled && !!username,
    select: (data) => data.result,
  })
}

/**
 * Hook to get all users with pagination
 */
export const useUsers = (limit: number = 10, skip: number = 0) => {
  return useQuery({
    queryKey: ['users', limit, skip],
    queryFn: () => userService.getAllUsers(limit, skip),
    select: (data) => data.result,
  })
}

/**
 * Hook to get user count
 */
export const useUserCount = () => {
  return useQuery({
    queryKey: ['users', 'count'],
    queryFn: () => userService.getUserCount(),
    select: (data) => data.result,
  })
}

/**
 * Hook to get users by guest status
 */
export const useUsersByGuestStatus = (
  isGuest: boolean,
  limit: number = 10,
  skip: number = 0
) => {
  return useQuery({
    queryKey: ['users', 'guests', isGuest, limit, skip],
    queryFn: () => userService.getUsersByGuestStatus(isGuest, limit, skip),
    select: (data) => data.result,
  })
}

/**
 * Hook to create guest user
 */
export const useCreateGuestUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (username: string) => userService.createGuestUser(username),
    onSuccess: (response) => {
      if (response.result) {
        const user = response.result
        // Update cache
        queryClient.setQueryData(['user', user.id || user._id], response)
        queryClient.setQueryData(['user', 'username', user.username], response)
        // Invalidate users list
        queryClient.invalidateQueries({ queryKey: ['users'] })
      }
    },
  })
}

/**
 * Hook to update user
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<User> }) =>
      userService.updateUser(userId, data),
    onSuccess: (response, variables) => {
      if (response.result) {
        // Update cache
        queryClient.setQueryData(['user', variables.userId], response)
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['user', variables.userId] })
        queryClient.invalidateQueries({ queryKey: ['users'] })
      }
    },
  })
}

/**
 * Hook to update password
 */
export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: ({
      userId,
      oldPassword,
      newPassword,
    }: {
      userId: string
      oldPassword: string
      newPassword: string
    }) => userService.updatePassword(userId, oldPassword, newPassword),
  })
}

/**
 * Hook to delete user
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => userService.deleteUser(userId),
    onSuccess: (_, userId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['user', userId] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}


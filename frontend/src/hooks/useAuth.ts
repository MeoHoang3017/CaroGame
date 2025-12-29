/**
 * Auth Hooks
 * Custom hooks for authentication using TanStack Query
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import * as authService from '@/services/auth.service'
import type { RegisterRequest, LoginRequest } from '@/types/api.types'

/**
 * Hook for user registration
 */
export const useRegister = () => {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (response) => {
      // Store token if registration includes auto-login
      if (response.result?.accessToken && typeof window !== 'undefined') {
        localStorage.setItem('accessToken', response.result.accessToken);
        queryClient.setQueryData(['auth', 'user'], response.result.user)
      }
      // Redirect to login or home
      router.push('/login')
    },
  })
}

/**
 * Hook for user login
 */
export const useLogin = () => {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      if (response.result) {
        // Store token and user
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', response.result.accessToken)
          localStorage.setItem('user', JSON.stringify(response.result.user))
        }
        // Update query cache
        queryClient.setQueryData(['auth', 'user'], response.result.user)
        const userId = response.result.user.id || response.result.user._id
        if (userId) {
          queryClient.setQueryData(['user', userId], {
            code: 200,
            message: 'User retrieved',
            result: response.result.user,
          })
        }
        // Redirect to home or profile
        router.push('/profile')
      }
    },
  })
}

/**
 * Hook for logout
 */
export const useLogout = () => {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => {
      authService.logout()
      return Promise.resolve()
    },
    onSuccess: () => {
      // Clear all queries
      queryClient.clear()
      // Redirect to home
      router.push('/')
    },
  })
}


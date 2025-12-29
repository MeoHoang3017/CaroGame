/**
 * Auth Service
 * Handles authentication-related API calls
 */

import { api, type ApiResponse } from '../utils/api'
import type { RegisterRequest, LoginRequest, AuthResponse } from '../types/api.types'

/**
 * Register a new user
 */
export const register = async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
  return api.post<AuthResponse>('/auth/register', data, false)
}

/**
 * Login user
 */
export const login = async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
  const response = await api.post<AuthResponse>('/auth/login', data, false)
  
  // Store token in localStorage
  if (response.result?.accessToken && typeof window !== 'undefined') {
    localStorage.setItem('accessToken', response.result.accessToken)
    localStorage.setItem('refreshToken', response.result.refreshToken)
  }
  
  return response
}

/**
 * Logout user (clear token)
 */
export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken')
  }
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('accessToken')
}

/**
 * Get stored access token
 */
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('accessToken')
}


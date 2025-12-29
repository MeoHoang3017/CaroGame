/**
 * API Configuration and Base Client
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

/**
 * Get authentication token from localStorage
 */
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('accessToken')
}

/**
 * Base API Response Structure
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  result?: T
  error?: {
    message: string
    details?: any
    stack?: string
  }
}

/**
 * API Error class
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Base API client with authentication support
 */
export const api = {
  /**
   * GET request
   */
  get: async <T>(endpoint: string, requireAuth: boolean = false): Promise<ApiResponse<T>> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (requireAuth) {
      const token = getAuthToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.message || `API Error: ${response.statusText}`,
        data.error
      )
    }

    return data
  },

  /**
   * POST request
   */
  post: async <T>(
    endpoint: string,
    data?: unknown,
    requireAuth: boolean = false
  ): Promise<ApiResponse<T>> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (requireAuth) {
      const token = getAuthToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })

    const responseData = await response.json()

    if (!response.ok) {
      throw new ApiError(
        response.status,
        responseData.message || `API Error: ${response.statusText}`,
        responseData.error
      )
    }

    return responseData
  },

  /**
   * PUT request
   */
  put: async <T>(
    endpoint: string,
    data?: unknown,
    requireAuth: boolean = true
  ): Promise<ApiResponse<T>> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (requireAuth) {
      const token = getAuthToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })

    const responseData = await response.json()

    if (!response.ok) {
      throw new ApiError(
        response.status,
        responseData.message || `API Error: ${response.statusText}`,
        responseData.error
      )
    }

    return responseData
  },

  /**
   * DELETE request
   */
  delete: async <T>(endpoint: string, requireAuth: boolean = true): Promise<ApiResponse<T>> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (requireAuth) {
      const token = getAuthToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    })

    const responseData = await response.json()

    if (!response.ok) {
      throw new ApiError(
        response.status,
        responseData.message || `API Error: ${response.statusText}`,
        responseData.error
      )
    }

    return responseData
  },
}


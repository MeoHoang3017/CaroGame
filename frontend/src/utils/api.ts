/**
 * API Configuration and Base Client
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Track if we're currently refreshing token to avoid duplicate requests
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: Error) => void
}> = []

/**
 * Process queued requests after token refresh
 */
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null

  try {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    const data = await response.json()

    if (!response.ok) {
      // Refresh failed - clear tokens and redirect to login
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      
      // Trigger logout event for other components
      window.dispatchEvent(new CustomEvent('logout'))
      return null
    }

    if (data.result?.accessToken) {
      localStorage.setItem('accessToken', data.result.accessToken)
      if (data.result.refreshToken) {
        localStorage.setItem('refreshToken', data.result.refreshToken)
      }
      return data.result.accessToken
    }

    return null
  } catch (error) {
    console.error('Token refresh failed:', error)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    window.dispatchEvent(new CustomEvent('logout'))
    return null
  }
}

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

    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    })

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && requireAuth) {
      if (!isRefreshing) {
        isRefreshing = true
        const newToken = await refreshAccessToken()
        isRefreshing = false

        if (newToken) {
          processQueue(null, newToken)
          // Retry request with new token
          headers['Authorization'] = `Bearer ${newToken}`
          response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers,
          })
        } else {
          processQueue(new Error('Token refresh failed'), null)
          throw new ApiError(401, 'Session expired. Please login again.')
        }
      } else {
        // Wait for token refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              headers['Authorization'] = `Bearer ${token}`
              fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers,
              })
                .then((res) => res.json())
                .then(resolve)
                .catch(reject)
            },
            reject: reject,
          })
        })
      }
    }

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

    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && requireAuth) {
      if (!isRefreshing) {
        isRefreshing = true
        const newToken = await refreshAccessToken()
        isRefreshing = false

        if (newToken) {
          processQueue(null, newToken)
          // Retry request with new token
          headers['Authorization'] = `Bearer ${newToken}`
          response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: data ? JSON.stringify(data) : undefined,
          })
        } else {
          processQueue(new Error('Token refresh failed'), null)
          throw new ApiError(401, 'Session expired. Please login again.')
        }
      } else {
        // Wait for token refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              headers['Authorization'] = `Bearer ${token}`
              fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers,
                body: data ? JSON.stringify(data) : undefined,
              })
                .then((res) => res.json())
                .then(resolve)
                .catch(reject)
            },
            reject: reject,
          })
        })
      }
    }

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

    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    })

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && requireAuth) {
      if (!isRefreshing) {
        isRefreshing = true
        const newToken = await refreshAccessToken()
        isRefreshing = false

        if (newToken) {
          processQueue(null, newToken)
          // Retry request with new token
          headers['Authorization'] = `Bearer ${newToken}`
          response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers,
            body: data ? JSON.stringify(data) : undefined,
          })
        } else {
          processQueue(new Error('Token refresh failed'), null)
          throw new ApiError(401, 'Session expired. Please login again.')
        }
      } else {
        // Wait for token refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              headers['Authorization'] = `Bearer ${token}`
              fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers,
                body: data ? JSON.stringify(data) : undefined,
              })
                .then((res) => res.json())
                .then(resolve)
                .catch(reject)
            },
            reject: reject,
          })
        })
      }
    }

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

    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    })

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && requireAuth) {
      if (!isRefreshing) {
        isRefreshing = true
        const newToken = await refreshAccessToken()
        isRefreshing = false

        if (newToken) {
          processQueue(null, newToken)
          // Retry request with new token
          headers['Authorization'] = `Bearer ${newToken}`
          response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers,
          })
        } else {
          processQueue(new Error('Token refresh failed'), null)
          throw new ApiError(401, 'Session expired. Please login again.')
        }
      } else {
        // Wait for token refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              headers['Authorization'] = `Bearer ${token}`
              fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers,
              })
                .then((res) => res.json())
                .then(resolve)
                .catch(reject)
            },
            reject: reject,
          })
        })
      }
    }

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


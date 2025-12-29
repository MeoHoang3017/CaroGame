/**
 * Auth Utilities
 * Helper functions for authentication
 */

/**
 * Get user ID from token
 * Note: This is a simple implementation. In production, you should decode JWT properly
 */
export const getUserIdFromToken = (): string | null => {
  if (typeof window === 'undefined') return null
  
  // For now, we'll need to store user ID separately or decode JWT
  // This is a placeholder - you should implement proper JWT decoding
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      return user.id || user._id || null
    } catch {
      return null
    }
  }
  
  return null
}

/**
 * Get user from localStorage
 */
export const getStoredUser = () => {
  if (typeof window === 'undefined') return null
  
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }
  
  return null
}

/**
 * Store user in localStorage
 */
export const storeUser = (user: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user))
  }
}

/**
 * Clear user from localStorage
 */
export const clearUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }
}


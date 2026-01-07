/**
 * Auth Logout Handler
 * Listens for logout events triggered by token refresh failure
 */

export const setupLogoutHandler = (onLogout: () => void) => {
  if (typeof window === 'undefined') return

  const handleLogout = () => {
    onLogout()
  }

  window.addEventListener('logout', handleLogout)

  return () => {
    window.removeEventListener('logout', handleLogout)
  }
}

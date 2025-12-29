import { io, Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from '@/types/socket.types'

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null

/**
 * Get socket instance with authentication
 */
export const getSocket = (url?: string): Socket<ServerToClientEvents, ClientToServerEvents> => {
  if (!socket || !socket.connected) {
    const serverUrl = url || process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'
    
    // Get auth token
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('accessToken') 
      : null

    socket = io(serverUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      auth: token ? { token } : undefined,
      extraHeaders: token ? {
        Authorization: `Bearer ${token}`
      } : undefined,
    }) as Socket<ServerToClientEvents, ClientToServerEvents>

    // Update auth when token changes
    if (typeof window !== 'undefined') {
      const updateAuth = () => {
        const newToken = localStorage.getItem('accessToken')
        if (newToken && socket) {
          socket.auth = { token: newToken }
          if (socket.io.opts.extraHeaders) {
            socket.io.opts.extraHeaders = {
              Authorization: `Bearer ${newToken}`
            }
          }
        }
      }

      // Listen for storage changes (when user logs in/out in another tab)
      window.addEventListener('storage', updateAuth)
    }
  }
  return socket
}

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

/**
 * Reconnect socket (useful when token changes)
 */
export const reconnectSocket = () => {
  disconnectSocket()
  return getSocket()
}


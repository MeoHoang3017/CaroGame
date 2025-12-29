import { useEffect, useState } from 'react'
import { Socket } from 'socket.io-client'
import { getSocket, disconnectSocket } from '@/lib/socket'
import type { ClientToServerEvents, ServerToClientEvents } from '@/types/socket.types'

export const useSocket = (url?: string) => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socketInstance = getSocket(url) as Socket<ServerToClientEvents, ClientToServerEvents>
    setSocket(socketInstance)

    socketInstance.on('connect', () => {
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      setIsConnected(false)
    })

    return () => {
      socketInstance.off('connect')
      socketInstance.off('disconnect')
    }
  }, [url])

  useEffect(() => {
    return () => {
      // Don't disconnect on unmount, keep connection alive
      // disconnectSocket()
    }
  }, [])

  return { socket, isConnected }
}


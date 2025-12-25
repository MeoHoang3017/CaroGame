import { useEffect, useState } from 'react'
import { Socket } from 'socket.io-client'
import { getSocket, disconnectSocket } from '@/lib/socket'

export const useSocket = (url?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socketInstance = getSocket(url)
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
      disconnectSocket()
    }
  }, [])

  return { socket, isConnected }
}


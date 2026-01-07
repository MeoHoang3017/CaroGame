/**
 * Room Hooks
 * Custom hooks for room operations using TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as roomService from '@/services/room.service'
import type { CreateRoomRequest, JoinRoomRequest } from '@/types/api.types'

/**
 * Hook to get available rooms
 */
export const useAvailableRooms = (limit: number = 20, skip: number = 0) => {
  return useQuery({
    queryKey: ['rooms', 'available', limit, skip],
    queryFn: () => roomService.getAvailableRooms(limit, skip),
    select: (data) => data.result,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  })
}

/**
 * Hook to get room by code
 */
export const useRoom = (roomCode: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['room', roomCode],
    queryFn: () => roomService.getRoom(roomCode),
    enabled: enabled && !!roomCode,
    select: (data) => data.result,
    refetchInterval: 3000, // Refetch every 3 seconds for real-time updates
  })
}

/**
 * Hook to create a room
 */
export const useCreateRoom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRoomRequest) => roomService.createRoom(data),
    onSuccess: (response) => {
      if (response.result) {
        const room = response.result
        // Update cache
        queryClient.setQueryData(['room', room.roomCode], response)
        // Invalidate available rooms list
        queryClient.invalidateQueries({ queryKey: ['rooms', 'available'] })
      }
    },
  })
}

/**
 * Hook to join a room
 */
export const useJoinRoom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: JoinRoomRequest) => roomService.joinRoom(data),
    onSuccess: (response, variables) => {
      if (response.result) {
        const room = response.result
        // Update cache
        queryClient.setQueryData(['room', room.roomCode], response)
        queryClient.setQueryData(['room', variables.roomCode], response)
        // Invalidate available rooms list
        queryClient.invalidateQueries({ queryKey: ['rooms', 'available'] })
      }
    },
  })
}

/**
 * Hook to leave a room
 */
export const useLeaveRoom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roomCode: string) => roomService.leaveRoom(roomCode),
    onSuccess: (response, roomCode) => {
      // Invalidate room and available rooms
      queryClient.invalidateQueries({ queryKey: ['room', roomCode] })
      queryClient.invalidateQueries({ queryKey: ['rooms', 'available'] })
    },
  })
}

/**
 * Hook to start a match in a room
 */
export const useStartMatch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roomCode: string) => roomService.startMatch(roomCode),
    onSuccess: (response, roomCode) => {
      if (response.result) {
        // Update room cache
        queryClient.setQueryData(['room', roomCode], {
          code: 200,
          message: 'Match started',
          result: response.result.room,
        })
        // Invalidate available rooms
        queryClient.invalidateQueries({ queryKey: ['rooms', 'available'] })
        // Set match in cache
        if (response.result.match) {
          const matchId = response.result.match.id || response.result.match._id
          if (matchId) {
            queryClient.setQueryData(['match', matchId], {
              code: 200,
              message: 'Match retrieved',
              result: response.result.match,
            })
          }
        }
      }
    },
  })
}

/**
 * Hook to reset room for a rematch
 */
export const useRematchRoom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roomCode: string) => roomService.rematchRoom(roomCode),
    onSuccess: (response, roomCode) => {
      if (response.result) {
        queryClient.setQueryData(['room', roomCode], response)
        queryClient.invalidateQueries({ queryKey: ['rooms', 'available'] })
      }
    },
  })
}


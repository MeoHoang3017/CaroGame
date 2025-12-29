/**
 * Room Service
 * Handles room-related API calls
 */

import { api, type ApiResponse } from '../utils/api'
import type { Room, CreateRoomRequest, JoinRoomRequest, Match } from '../types/api.types'

/**
 * Create a new room
 */
export const createRoom = async (data: CreateRoomRequest): Promise<ApiResponse<Room>> => {
  return api.post<Room>('/rooms/create', data, true)
}

/**
 * Join a room
 */
export const joinRoom = async (data: JoinRoomRequest): Promise<ApiResponse<Room>> => {
  return api.post<Room>('/rooms/join', data, true)
}

/**
 * Leave a room
 */
export const leaveRoom = async (roomCode: string): Promise<ApiResponse<Room>> => {
  return api.post<Room>(`/rooms/${roomCode}/leave`, undefined, true)
}

/**
 * Start a match in a room
 */
export const startMatch = async (roomCode: string): Promise<ApiResponse<{ room: Room; match: Match }>> => {
  return api.post<{ room: Room; match: Match }>(`/rooms/${roomCode}/start`, undefined, true)
}

/**
 * Get room by code
 */
export const getRoom = async (roomCode: string): Promise<ApiResponse<Room>> => {
  return api.get<Room>(`/rooms/${roomCode}`, false)
}

/**
 * Get available rooms
 */
export const getAvailableRooms = async (
  limit: number = 20,
  skip: number = 0
): Promise<ApiResponse<Room[]>> => {
  return api.get<Room[]>(`/rooms?limit=${limit}&skip=${skip}`, false)
}


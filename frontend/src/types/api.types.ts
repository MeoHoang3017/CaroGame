/**
 * API Types
 * Type definitions for API requests and responses
 */

/**
 * User Types
 */
export interface User {
  _id?: string
  id?: string
  username: string
  email: string
  isGuest: boolean
  createdAt?: string
  updatedAt?: string
}

/**
 * Auth Types
 */
export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  user: User,
  accessToken: string,
  refreshToken: string
}

/**
 * Room Types
 */
export interface Room {
  _id?: string
  id?: string
  roomCode: string
  hostId: string | User
  players: Array<{
    userId: string | User
    joinedAt: string
  }>
  maxPlayers: number
  boardSize: number
  status: 'waiting' | 'starting' | 'in-game' | 'closed'
  settings: {
    isPrivate: boolean
    allowSpectators: boolean
  }
  matchId?: string
  createdAt?: string
  updatedAt?: string
  expiresAt?: string
}

export interface CreateRoomRequest {
  maxPlayers?: number
  boardSize?: number
  isPrivate?: boolean
  allowSpectators?: boolean
}

export interface JoinRoomRequest {
  roomCode: string
}

/**
 * Match Types
 */
export interface Match {
  _id?: string
  id?: string
  players: Array<{
    userId: string | User
    symbol: 'X' | 'O'
  }>
  boardSize: number
  history: Array<{
    x: number
    y: number
    playerId: string
    timestamp: string
  }>
  currentTurn: number
  result: 'ongoing' | 'win-loss' | 'draw' | 'abandoned'
  winner?: string | User
  startTime: string
  endTime?: string
  roomCode: string
  createdAt?: string
  updatedAt?: string
}

export interface MakeMoveRequest {
  x: number
  y: number
}

export interface MakeMoveResponse {
  match: Match
  isWin: boolean
  isDraw: boolean
}


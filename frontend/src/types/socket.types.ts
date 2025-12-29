import type { Match, Room } from './api.types'

/**
 * Socket Event Types
 * Match với backend socket events
 */

// Client to Server Events
export interface ClientToServerEvents {
  // Room events
  'room:create': (data: {
    maxPlayers?: number
    boardSize?: number
    isPrivate?: boolean
    allowSpectators?: boolean
  }) => void
  'room:join': (data: { roomCode: string }) => void
  'room:leave': () => void
  'room:start': (data: { roomCode: string }) => void

  // Match events
  'match:join': (data: { matchId: string }) => void
  'match:leave': () => void
  'match:move': (data: { matchId: string; x: number; y: number }) => void
  'match:end': (data: { matchId: string }) => void
}

// Server to Client Events
export interface ServerToClientEvents {
  // Room events
  'room:created': (data: { room: Room }) => void
  'room:joined': (data: { room: Room }) => void
  'room:left': (data: { roomCode: string }) => void
  'room:updated': (data: { room: Room }) => void
  'room:started': (data: { room: Room; match: Match }) => void

  // Match events
  'match:joined': (data: { match: Match }) => void
  'match:left': (data: { matchId: string }) => void
  'match:move:made': (data: {
    match: Match
    move: { x: number; y: number; playerId: string }
  }) => void
  'match:win': (data: { match: Match; winner: string | Match['players'][0] }) => void
  'match:draw': (data: { match: Match }) => void
  'match:ended': (data: { match: Match }) => void
  'match:updated': (data: { match: Match }) => void

  // Error events
  error: (data: { message: string }) => void
}


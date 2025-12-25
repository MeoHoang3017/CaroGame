export interface ServerToClientEvents {
  gameStart: (data: { gameId: string; player: 'X' | 'O'; opponent: string }) => void
  gameMove: (data: { row: number; col: number; player: 'X' | 'O' }) => void
  gameEnd: (data: { winner: string | null; reason: string }) => void
  playerJoined: (data: { playerId: string; username: string }) => void
  playerLeft: (data: { playerId: string }) => void
  error: (data: { message: string }) => void
}

export interface ClientToServerEvents {
  joinGame: (data: { gameId?: string; username: string }) => void
  makeMove: (data: { gameId: string; row: number; col: number }) => void
  leaveGame: (data: { gameId: string }) => void
  requestRematch: (data: { gameId: string }) => void
}


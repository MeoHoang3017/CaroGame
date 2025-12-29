/**
 * Game Logic Utilities
 * Helper functions for game logic on the frontend
 */

import type { Match } from '@/types/api.types'

/**
 * Replay board from match history
 * Creates a 2D board array from match history
 */
export const replayBoardFromHistory = (
  match: Match
): (string | null)[][] => {
  if (!match.history || match.history.length === 0) {
    // Return empty board
    return Array(match.boardSize)
      .fill(null)
      .map(() => Array(match.boardSize).fill(null))
  }

  // Create empty board
  const board: (string | null)[][] = Array(match.boardSize)
    .fill(null)
    .map(() => Array(match.boardSize).fill(null))

  // Create player symbol map
  const playerSymbolMap = new Map<string, 'X' | 'O'>()
  match.players.forEach((player) => {
    const playerId = typeof player.userId === 'string'
      ? player.userId
      : player.userId?.id || player.userId?._id || ''
    if (playerId) {
      playerSymbolMap.set(playerId, player.symbol)
    }
  })

  // Replay each move
  match.history.forEach((move) => {
    const symbol = playerSymbolMap.get(move.playerId)
    if (symbol && move.x >= 0 && move.x < match.boardSize && move.y >= 0 && move.y < match.boardSize) {
      board[move.x][move.y] = symbol
    }
  })

  return board
}

/**
 * Get player symbol from match
 */
export const getPlayerSymbol = (
  match: Match,
  userId: string
): 'X' | 'O' | null => {
  const player = match.players.find((p) => {
    const playerId = typeof p.userId === 'string'
      ? p.userId
      : p.userId?.id || p.userId?._id || ''
    return playerId === userId
  })

  return player?.symbol || null
}

/**
 * Get opponent symbol
 */
export const getOpponentSymbol = (
  match: Match,
  userId: string
): 'X' | 'O' | null => {
  const playerSymbol = getPlayerSymbol(match, userId)
  if (!playerSymbol) return null

  return playerSymbol === 'X' ? 'O' : 'X'
}

/**
 * Check if it's the player's turn
 */
export const isPlayerTurn = (
  match: Match,
  userId: string
): boolean => {
  if (match.result !== 'ongoing') {
    return false
  }

  const playerSymbol = getPlayerSymbol(match, userId)
  if (!playerSymbol) {
    return false
  }

  // Current turn is based on history length
  // Even moves (0, 2, 4...) = X's turn
  // Odd moves (1, 3, 5...) = O's turn
  const moveCount = match.history?.length || 0
  const expectedSymbol = moveCount % 2 === 0 ? 'X' : 'O'

  return playerSymbol === expectedSymbol
}

/**
 * Get current player symbol (whose turn it is)
 */
export const getCurrentPlayerSymbol = (match: Match): 'X' | 'O' | null => {
  if (match.result !== 'ongoing') {
    return null
  }

  const moveCount = match.history?.length || 0
  return moveCount % 2 === 0 ? 'X' : 'O'
}

/**
 * Get current player info
 */
export const getCurrentPlayer = (match: Match): Match['players'][0] | null => {
  const currentSymbol = getCurrentPlayerSymbol(match)
  if (!currentSymbol) return null

  return match.players.find((p) => p.symbol === currentSymbol) || null
}

/**
 * Check if cell is valid for move
 */
export const isValidCell = (
  board: (string | null)[][],
  x: number,
  y: number,
  boardSize: number
): boolean => {
  // Check bounds
  if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) {
    return false
  }

  // Check if cell is empty
  if (board[x]?.[y] !== null && board[x]?.[y] !== undefined) {
    return false
  }

  return true
}

/**
 * Get player info by ID
 */
export const getPlayerById = (
  match: Match,
  userId: string
): Match['players'][0] | null => {
  return match.players.find((p) => {
    const playerId = typeof p.userId === 'string'
      ? p.userId
      : p.userId?.id || p.userId?._id || ''
    return playerId === userId
  }) || null
}

/**
 * Get opponent info
 */
export const getOpponent = (
  match: Match,
  userId: string
): Match['players'][0] | null => {
  const player = getPlayerById(match, userId)
  if (!player) return null

  return match.players.find((p) => {
    const playerId = typeof p.userId === 'string'
      ? p.userId
      : p.userId?.id || p.userId?._id || ''
    return playerId !== userId
  }) || null
}

/**
 * Check if match is finished
 */
export const isMatchFinished = (match: Match): boolean => {
  return match.result !== 'ongoing'
}

/**
 * Check if match is draw
 */
export const isMatchDraw = (match: Match): boolean => {
  return match.result === 'draw'
}

/**
 * Check if player won
 */
export const didPlayerWin = (match: Match, userId: string): boolean => {
  if (match.result !== 'win-loss') return false

  const winnerId = typeof match.winner === 'string'
    ? match.winner
    : match.winner?.id || match.winner?._id || ''

  return winnerId === userId
}


/**
 * Game Socket Hooks
 * Hooks for handling game/match socket events
 */

import { useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSocket } from './useSocket'
import type { Match } from '@/types/api.types'
import { CLIENT_EVENTS, SERVER_EVENTS } from '@/constants/socket.events'

/**
 * Hook to join a match room via socket
 */
export const useJoinMatch = (matchId: string | null) => {
  const { socket, isConnected } = useSocket()

  useEffect(() => {
    if (!socket || !isConnected || !matchId) return

    // Join match room
    socket.emit(CLIENT_EVENTS.MATCH_JOIN, { matchId })

    return () => {
      // Leave match room on cleanup
      socket.emit(CLIENT_EVENTS.MATCH_LEAVE)
    }
  }, [socket, isConnected, matchId])
}

/**
 * Hook to listen for match socket events
 */
export const useMatchSocket = (
  matchId: string | null,
  onMove?: (match: Match) => void,
  onWin?: (match: Match, winner: string | Match['players'][0]) => void,
  onDraw?: (match: Match) => void,
  onEnd?: (match: Match) => void,
  onError?: (message: string) => void
) => {
  const { socket, isConnected } = useSocket()
  const queryClient = useQueryClient()

  // Update match cache when receiving socket events
  const updateMatchCache = useCallback(
    (match: Match) => {
      queryClient.setQueryData(['match', matchId], {
        code: 200,
        message: 'Match updated',
        result: match,
      })
    },
    [queryClient, matchId]
  )

  useEffect(() => {
    if (!socket || !isConnected || !matchId) return

    // Listen for match move
    const handleMoveMade = (data: { match: Match; move: { x: number; y: number; playerId: string } }) => {
      updateMatchCache(data.match)
      onMove?.(data.match)
    }

    // Listen for match win
    const handleWin = (data: { match: Match; winner: string | Match['players'][0] }) => {
      updateMatchCache(data.match)
      onWin?.(data.match, data.winner)
    }

    // Listen for match draw
    const handleDraw = (data: { match: Match }) => {
      updateMatchCache(data.match)
      onDraw?.(data.match)
    }

    // Listen for match ended
    const handleEnded = (data: { match: Match }) => {
      updateMatchCache(data.match)
      onEnd?.(data.match)
    }

    // Listen for match updated
    const handleUpdated = (data: { match: Match }) => {
      updateMatchCache(data.match)
    }

    // Listen for errors
    const handleError = (data: { message: string }) => {
      onError?.(data.message)
    }

    // Register event listeners
    socket.on(SERVER_EVENTS.MATCH_MOVE_MADE, handleMoveMade)
    socket.on(SERVER_EVENTS.MATCH_WIN, handleWin)
    socket.on(SERVER_EVENTS.MATCH_DRAW, handleDraw)
    socket.on(SERVER_EVENTS.MATCH_ENDED, handleEnded)
    socket.on(SERVER_EVENTS.MATCH_UPDATED, handleUpdated)
    socket.on(SERVER_EVENTS.ERROR, handleError)

    // Cleanup
    return () => {
      socket.off(SERVER_EVENTS.MATCH_MOVE_MADE, handleMoveMade)
      socket.off(SERVER_EVENTS.MATCH_WIN, handleWin)
      socket.off(SERVER_EVENTS.MATCH_DRAW, handleDraw)
      socket.off(SERVER_EVENTS.MATCH_ENDED, handleEnded)
      socket.off(SERVER_EVENTS.MATCH_UPDATED, handleUpdated)
      socket.off(SERVER_EVENTS.ERROR, handleError)
    }
  }, [socket, isConnected, matchId, updateMatchCache, onMove, onWin, onDraw, onEnd, onError])
}

/**
 * Hook to make a move via socket (alternative to API)
 */
export const useMakeMoveSocket = () => {
  const { socket, isConnected } = useSocket()

  const makeMove = useCallback(
    (matchId: string, x: number, y: number) => {
      if (!socket || !isConnected) {
        throw new Error('Socket not connected')
      }

      socket.emit(CLIENT_EVENTS.MATCH_MOVE, { matchId, x, y })
    },
    [socket, isConnected]
  )

  return { makeMove, isConnected }
}


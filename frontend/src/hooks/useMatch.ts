/**
 * Match Hooks
 * Custom hooks for match operations using TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as matchService from '@/services/match.service'
import type { MakeMoveRequest } from '@/types/api.types'

/**
 * Hook to get match by ID
 */
export const useMatch = (matchId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['match', matchId],
    queryFn: () => matchService.getMatch(matchId),
    enabled: enabled && !!matchId,
    select: (data) => data.result,
    refetchInterval: (query) => {
      // Only refetch if match is ongoing
      const match = query.state.data?.result
      if (match?.result === 'ongoing') {
        return 2000 // Refetch every 2 seconds for ongoing matches
      }
      return false // Don't refetch completed matches
    },
  })
}

/**
 * Hook to get match history
 */
export const useMatchHistory = (matchId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['match', matchId, 'history'],
    queryFn: () => matchService.getMatchHistory(matchId),
    enabled: enabled && !!matchId,
    select: (data) => data.result,
  })
}

/**
 * Hook to get user matches
 */
export const useUserMatches = (
  userId: string,
  limit: number = 20,
  skip: number = 0,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['matches', 'user', userId, limit, skip],
    queryFn: () => matchService.getUserMatches(userId, limit, skip),
    enabled: enabled && !!userId,
    select: (data) => data.result,
  })
}

/**
 * Hook to make a move
 */
export const useMakeMove = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ matchId, data }: { matchId: string; data: MakeMoveRequest }) =>
      matchService.makeMove(matchId, data),
    onSuccess: (response, variables) => {
      if (response.result) {
        // Update match cache
        queryClient.setQueryData(['match', variables.matchId], {
          code: 200,
          message: 'Move made successfully',
          result: response.result.match,
        })
        // Invalidate user matches
        const match = response.result.match
        if (match.players) {
          match.players.forEach((player: any) => {
            const userId = typeof player.userId === 'string' 
              ? player.userId 
              : player.userId?.id || player.userId?._id
            if (userId) {
              queryClient.invalidateQueries({ queryKey: ['matches', 'user', userId] })
            }
          })
        }
      }
    },
  })
}

/**
 * Hook to end a match
 */
export const useEndMatch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (matchId: string) => matchService.endMatch(matchId),
    onSuccess: (response, matchId) => {
      if (response.result) {
        // Update match cache
        queryClient.setQueryData(['match', matchId], response)
        // Invalidate user matches
        const match = response.result
        if (match.players) {
          match.players.forEach((player: any) => {
            const userId = typeof player.userId === 'string' 
              ? player.userId 
              : player.userId?.id || player.userId?._id
            if (userId) {
              queryClient.invalidateQueries({ queryKey: ['matches', 'user', userId] })
            }
          })
        }
      }
    },
  })
}


/**
 * Match Service
 * Handles match-related API calls
 */

import { api, type ApiResponse } from '../utils/api'
import type { Match, MakeMoveRequest, MakeMoveResponse } from '../types/api.types'

/**
 * Get match by ID
 */
export const getMatch = async (matchId: string): Promise<ApiResponse<Match>> => {
  return api.get<Match>(`/matches/${matchId}`, true)
}

/**
 * Make a move in a match
 */
export const makeMove = async (
  matchId: string,
  data: MakeMoveRequest
): Promise<ApiResponse<MakeMoveResponse>> => {
  return api.post<MakeMoveResponse>(`/matches/${matchId}/move`, data, true)
}

/**
 * End a match (abandon)
 */
export const endMatch = async (matchId: string): Promise<ApiResponse<Match>> => {
  return api.post<Match>(`/matches/${matchId}/end`, undefined, true)
}

/**
 * Get match history (for replay)
 */
export const getMatchHistory = async (matchId: string): Promise<ApiResponse<Match>> => {
  return api.get<Match>(`/matches/${matchId}/history`, true)
}

/**
 * Get all matches for a user
 */
export const getUserMatches = async (
  userId: string,
  limit: number = 20,
  skip: number = 0
): Promise<ApiResponse<Match[]>> => {
  return api.get<Match[]>(`/matches/user/${userId}?limit=${limit}&skip=${skip}`, true)
}


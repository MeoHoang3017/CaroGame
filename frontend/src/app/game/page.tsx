/**
 * Game Page
 * Main page for playing the game
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { GameBoard } from '@/components/game/GameBoard'
import { GameStatus } from '@/components/game/GameStatus'
import { GameEndDialog } from '@/components/game/GameEndDialog'
import { useMatch, useMakeMove, useEndMatch } from '@/hooks/useMatch'
import { useJoinMatch, useMatchSocket } from '@/hooks/useGameSocket'
import { useRematchRoom, useLeaveRoom } from '@/hooks/useRoom'
import { getStoredUser } from '@/utils/auth'
import {
  isPlayerTurn,
  isMatchFinished,
  replayBoardFromHistory,
  isValidCell,
} from '@/utils/game-logic'
import { LogOut, Loader2, AlertCircle } from 'lucide-react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { toast } from '@/utils/toast'
import type { Match } from '@/types/api.types'

export default function GamePage() {
  return (
    <ProtectedRoute>
      <GameContent />
    </ProtectedRoute>
  )
}

function GameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get('matchId')
  const [showEndDialog, setShowEndDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const storedUser = getStoredUser()
  const userId = storedUser?.id || storedUser?._id

  // Fetch match data
  const { data: match, isLoading, error: matchError } = useMatch(matchId || '', !!matchId)

  // Mutations
  const makeMoveMutation = useMakeMove()
  const endMatchMutation = useEndMatch()
  const rematchMutation = useRematchRoom()
  const leaveRoomMutation = useLeaveRoom()

  // Socket integration
  useJoinMatch(matchId)
  useMatchSocket(
    matchId, 
    (match) => {
      // On move made
      console.log('Move made via socket:', match)
    },
    (match, winner) => {
      // On win
      setShowEndDialog(true)
    },
    (match) => {
      // On draw
      setShowEndDialog(true)
    },
    (match) => {
      // On end
      setShowEndDialog(true)
    },
    (message) => {
      // On error
      setError(message)
    }
  )

  // Handle cell click
  const handleCellClick = async (x: number, y: number) => {
    if (!matchId || !match || !userId) return

    // Check if it's player's turn
    if (!isPlayerTurn(match, userId)) {
      const msg = "It's not your turn!"
      setError(msg)
      toast.error(msg)
      return
    }

    // Check if match is finished
    if (isMatchFinished(match)) {
      const msg = 'Match has already ended'
      setError(msg)
      toast.error(msg)
      return
    }

    // Validate move (client-side check)
    const board = replayBoardFromHistory(match)
    if (!isValidCell(board, x, y, match.boardSize)) {
      const msg = 'Invalid move'
      setError(msg)
      toast.error(msg)
      return
    }

    setError(null)

    try {
      await makeMoveMutation.mutateAsync({
        matchId,
        data: { x, y },
      })
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to make move'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  // Handle end match
  const handleEndMatch = async () => {
    if (!matchId) return

    try {
      await endMatchMutation.mutateAsync(matchId)
      setShowEndDialog(true)
      toast.success('Match ended')
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to end match'
      setError(errorMessage)
      toast.error('Failed to end match', errorMessage)
    }
  }

  const handleRematch = async () => {
    if (!match?.roomCode) return
    try {
      const response = await rematchMutation.mutateAsync(match.roomCode)
      if (response.result) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('activeRoomCode', match.roomCode)
        }
        toast.success('Room is ready for a rematch. Returning to room.')
        router.push(`/room?code=${match.roomCode}`)
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to rematch'
      toast.error(msg)
    }
  }

  const leaveRoomAndNavigate = async (path: string) => {
    const roomCode = match?.roomCode
    try {
      if (roomCode) {
        await leaveRoomMutation.mutateAsync(roomCode)
      }
    } catch (err) {
      // ignore leave errors to avoid blocking navigation
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('activeRoomCode')
      }
      router.push(path)
    }
  }

  // Check if match ended
  useEffect(() => {
    if (match && isMatchFinished(match) && !showEndDialog) {
      setShowEndDialog(true)
    }
  }, [match, showEndDialog])

  // Redirect if no matchId
  useEffect(() => {
    if (!matchId) {
      router.push('/matching')
    }
  }, [matchId, router])

  // Redirect if not authenticated
  useEffect(() => {
    if (!userId) {
      router.push('/login')
    }
  }, [userId, router])

  if (!matchId) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-8 w-8 mx-auto text-warning" />
            <div>
              <h2 className="text-xl font-semibold">No Match ID</h2>
              <p className="text-muted-foreground">Please select a match to play</p>
            </div>
            <Button asChild>
              <Link href="/matching">Find a Match</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading game...</p>
        </div>
      </main>
    )
  }

  if (matchError || !match) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-destructive mb-4" />
            <p className="text-destructive mb-4">Failed to load game</p>
            <p className="text-sm text-muted-foreground mb-4">
              {matchError?.message || 'Match not found or you are not a player in this match'}
            </p>
            <Button asChild>
              <Link href="/matching">Back to Matching</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (!userId) {
    return null
  }

  const isPlayerTurnNow = isPlayerTurn(match, userId)
  const isFinished = isMatchFinished(match)

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid lg:grid-cols-3 gap-6"
        >
          {/* Game Board - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Error Message */}
            {error && (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Game Board */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4">
                  <h2 className="text-2xl font-bold">Game Board</h2>
                  <GameBoard
                    match={match}
                    onCellClick={handleCellClick}
                    disabled={!isPlayerTurnNow || isFinished || makeMoveMutation.isPending}
                    size="md"
                  />
                  {makeMoveMutation.isPending && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Making move...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            {!isFinished && (
              <div className="flex gap-4">
                <Button
                  variant="destructive"
                  onClick={handleEndMatch}
                  disabled={endMatchMutation.isPending}
                  className="flex-1"
                >
                  {endMatchMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Ending...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 mr-2" />
                      End Match
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <GameStatus match={match} currentUserId={userId} />

            {/* Match Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Match ID</span>
                    <span className="font-mono text-xs">{matchId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Board Size</span>
                    <span>{match.boardSize}x{match.boardSize}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Moves</span>
                    <span>{match.history?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Game End Dialog */}
      {match && (
        <GameEndDialog
          match={match}
          currentUserId={userId}
          open={showEndDialog}
          onClose={() => setShowEndDialog(false)}
          onRematch={handleRematch}
          rematchLoading={rematchMutation.isPending}
          onBackToHome={() => leaveRoomAndNavigate('/')}
          onBackToMatching={() => leaveRoomAndNavigate('/matching')}
        />
      )}
    </main>
    </ProtectedRoute>
  )
}


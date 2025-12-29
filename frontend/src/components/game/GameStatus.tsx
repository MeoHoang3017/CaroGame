/**
 * Game Status Component
 * Displays current game status, turn, and player info
 */

'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Users, Clock } from 'lucide-react'
import type { Match } from '@/types/api.types'
import {
  getCurrentPlayerSymbol,
  getPlayerById,
  isMatchFinished,
  isMatchDraw,
  didPlayerWin,
} from '@/utils/game-logic'

interface GameStatusProps {
  match: Match
  currentUserId: string
}

export function GameStatus({ match, currentUserId }: GameStatusProps) {
  const currentSymbol = getCurrentPlayerSymbol(match)
  const currentPlayer = currentSymbol
    ? match.players.find((p) => p.symbol === currentSymbol)
    : null
  const player = getPlayerById(match, currentUserId)
  const opponent = match.players.find((p) => {
    const playerId = typeof p.userId === 'string'
      ? p.userId
      : p.userId?.id || p.userId?._id || ''
    return playerId !== currentUserId
  })

  const isFinished = isMatchFinished(match)
  const isDraw = isMatchDraw(match)
  const playerWon = didPlayerWin(match, currentUserId)

  const getStatusText = () => {
    if (isFinished) {
      if (isDraw) {
        return 'Game Draw!'
      }
      if (playerWon) {
        return 'You Won! 🎉'
      }
      return 'You Lost'
    }

    if (!currentPlayer) {
      return 'Waiting...'
    }

    const isPlayerTurn = player?.symbol === currentSymbol
    return isPlayerTurn ? "Your Turn" : "Opponent's Turn"
  }

  const getStatusColor = () => {
    if (isFinished) {
      if (isDraw) return 'secondary'
      if (playerWon) return 'default'
      return 'destructive'
    }
    return player?.symbol === currentSymbol ? 'default' : 'secondary'
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Game Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">Status</span>
            </div>
            <Badge variant={getStatusColor()}>{getStatusText()}</Badge>
          </div>

          {/* Players */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Players</span>
            </div>
            <div className="space-y-2 pl-6">
              {player && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    You ({player.symbol})
                  </span>
                  {player.symbol === currentSymbol && !isFinished && (
                    <Badge variant="outline" className="text-xs">
                      Your Turn
                    </Badge>
                  )}
                </div>
              )}
              {opponent && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    {typeof opponent.userId === 'object'
                      ? opponent.userId?.username || 'Opponent'
                      : 'Opponent'} ({opponent.symbol})
                  </span>
                  {opponent.symbol === currentSymbol && !isFinished && (
                    <Badge variant="outline" className="text-xs">
                      Their Turn
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Match Info */}
          {isFinished && (
            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4" />
                <span>
                  {isDraw
                    ? 'Match ended in a draw'
                    : playerWon
                    ? 'Congratulations!'
                    : 'Better luck next time'}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


/**
 * Game End Dialog Component
 * Shows game end result (win/draw)
 */

'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trophy, RefreshCw, Home } from 'lucide-react'
import type { Match } from '@/types/api.types'
import { isMatchDraw, didPlayerWin, getOpponent } from '@/utils/game-logic'

interface GameEndDialogProps {
  match: Match
  currentUserId: string
  open: boolean
  onClose: () => void
  onRematch?: () => void
  rematchLoading?: boolean
  onBackToHome?: () => void
  onBackToMatching?: () => void
}

export function GameEndDialog({
  match,
  currentUserId,
  open,
  onClose,
  onRematch,
  rematchLoading = false,
  onBackToHome,
  onBackToMatching,
}: GameEndDialogProps) {
  const isDraw = isMatchDraw(match)
  const playerWon = didPlayerWin(match, currentUserId)
  const opponent = getOpponent(match, currentUserId)
  const handleBackToHome = () => {
    if (onBackToHome) onBackToHome()
  }
  const handleBackToMatching = () => {
    if (onBackToMatching) onBackToMatching()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex justify-center mb-4">
            {isDraw ? (
              <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-3xl">🤝</span>
              </div>
            ) : playerWon ? (
              <div className="h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                <Trophy className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-3xl">😔</span>
              </div>
            )}
          </div>
          <DialogTitle className="text-center text-2xl">
            {isDraw
              ? "It's a Draw!"
              : playerWon
              ? 'Congratulations! You Won!'
              : 'Game Over'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isDraw
              ? 'Both players played well. The game ended in a draw.'
              : playerWon
              ? `You defeated ${typeof opponent?.userId === 'object' ? opponent.userId?.username || 'your opponent' : 'your opponent'}!`
              : `${typeof opponent?.userId === 'object' ? opponent.userId?.username || 'Your opponent' : 'Your opponent'} won this match.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {onRematch && (
            <Button onClick={onRematch} className="w-full sm:w-auto" disabled={rematchLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {rematchLoading ? 'Setting up...' : 'Rematch'}
            </Button>
          )}
          <Button variant="outline" onClick={handleBackToHome} className="w-full sm:w-auto">
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <Button onClick={handleBackToMatching} className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Find New Match
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


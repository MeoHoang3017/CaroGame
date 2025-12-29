/**
 * Game Board Component
 * Interactive game board for Caro game
 */

'use client'

import { useMemo } from 'react'
import { GameCell } from './GameCell'
import { replayBoardFromHistory, isValidCell } from '@/utils/game-logic'
import type { Match } from '@/types/api.types'

interface GameBoardProps {
  match: Match
  onCellClick: (x: number, y: number) => void
  disabled?: boolean
  winningCells?: Array<{ x: number; y: number }>
  size?: 'sm' | 'md' | 'lg'
}

export function GameBoard({
  match,
  onCellClick,
  disabled = false,
  winningCells = [],
  size = 'md',
}: GameBoardProps) {
  // Replay board from match history
  const board = useMemo(() => {
    return replayBoardFromHistory(match)
  }, [match])

  // Check if cell is winning
  const isWinningCell = (x: number, y: number): boolean => {
    return winningCells.some((cell) => cell.x === x && cell.y === y)
  }

  // Check if cell can be clicked
  const isCellDisabled = (x: number, y: number): boolean => {
    if (disabled) return true
    if (match.result !== 'ongoing') return true
    if (board[x][y] !== null) return true
    return false
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="grid gap-1 p-2 bg-gray-100 dark:bg-gray-900 rounded-lg"
        style={{
          gridTemplateColumns: `repeat(${match.boardSize}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: match.boardSize }).map((_, x) =>
          Array.from({ length: match.boardSize }).map((_, y) => (
            <GameCell
              key={`${x}-${y}`}
              value={board[x][y] as 'X' | 'O' | null}
              x={x}
              y={y}
              onClick={onCellClick}
              disabled={isCellDisabled(x, y)}
              isWinning={isWinningCell(x, y)}
              size={size}
            />
          ))
        )}
      </div>
    </div>
  )
}


import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface GameState {
  board: (string | null)[][]
  currentPlayer: 'X' | 'O' | null
  gameStatus: 'waiting' | 'playing' | 'finished'
  winner: string | null
  playerId: string | null
  opponentId: string | null
}

interface GameActions {
  setBoard: (board: (string | null)[][]) => void
  makeMove: (row: number, col: number, player: 'X' | 'O') => void
  setCurrentPlayer: (player: 'X' | 'O' | null) => void
  setGameStatus: (status: 'waiting' | 'playing' | 'finished') => void
  setWinner: (winner: string | null) => void
  setPlayerId: (id: string | null) => void
  setOpponentId: (id: string | null) => void
  resetGame: () => void
}

const initialState: GameState = {
  board: Array(15).fill(null).map(() => Array(15).fill(null)),
  currentPlayer: null,
  gameStatus: 'waiting',
  winner: null,
  playerId: null,
  opponentId: null,
}

export const useGameStore = create<GameState & GameActions>()(
  devtools(
    (set) => ({
      ...initialState,
      setBoard: (board) => set({ board }),
      makeMove: (row, col, player) =>
        set((state) => {
          const newBoard = state.board.map((r) => [...r])
          newBoard[row][col] = player
          return { board: newBoard }
        }),
      setCurrentPlayer: (player) => set({ currentPlayer: player }),
      setGameStatus: (status) => set({ gameStatus: status }),
      setWinner: (winner) => set({ winner }),
      setPlayerId: (id) => set({ playerId: id }),
      setOpponentId: (id) => set({ opponentId: id }),
      resetGame: () => set(initialState),
    }),
    { name: 'GameStore' }
  )
)


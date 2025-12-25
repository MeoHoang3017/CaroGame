'use client'

import { motion } from 'framer-motion'
import { useSocket } from '@/hooks/useSocket'
import { useGameStore } from '@/stores/gameStore'
import { useAuthStore } from '@/stores/authStore'
import { useGameList } from '@/hooks/useGameQuery'

/**
 * Example component demonstrating how to use:
 * - Zustand stores (gameStore, authStore)
 * - Socket.io (useSocket hook)
 * - TanStack Query (useGameList hook)
 * - Framer Motion (animations)
 */
export function ExampleGameComponent() {
  const { socket, isConnected } = useSocket()
  const { board, gameStatus, currentPlayer, setGameStatus } = useGameStore()
  const { user, isAuthenticated } = useAuthStore()
  const { data: gamesData, isLoading } = useGameList()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-4">Game Status</h2>
      
      <div className="space-y-2">
        <p>
          Socket Status:{' '}
          <span className={isConnected ? 'text-green-500' : 'text-red-500'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </p>
        
        <p>
          Auth Status:{' '}
          <span className={isAuthenticated ? 'text-green-500' : 'text-gray-500'}>
            {isAuthenticated ? `Logged in as ${user?.username}` : 'Not logged in'}
          </span>
        </p>
        
        <p>
          Game Status: <span className="font-semibold">{gameStatus}</span>
        </p>
        
        <p>
          Current Player: <span className="font-semibold">{currentPlayer || 'None'}</span>
        </p>
        
        {isLoading ? (
          <p>Loading games...</p>
        ) : (
          <p>Available games: {gamesData?.games?.length || 0}</p>
        )}
      </div>
    </motion.div>
  )
}


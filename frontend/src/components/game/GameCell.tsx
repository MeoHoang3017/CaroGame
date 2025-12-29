/**
 * Game Cell Component
 * Individual cell in the game board
 */

'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GameCellProps {
  value: 'X' | 'O' | null
  x: number
  y: number
  onClick: (x: number, y: number) => void
  disabled?: boolean
  isWinning?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function GameCell({
  value,
  x,
  y,
  onClick,
  disabled = false,
  isWinning = false,
  size = 'md',
}: GameCellProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-10 h-10 text-xl sm:w-12 sm:h-12 sm:text-2xl',
    lg: 'w-14 h-14 text-3xl sm:w-16 sm:h-16 sm:text-4xl',
  }

  return (
    <motion.button
      type="button"
      onClick={() => !disabled && !value && onClick(x, y)}
      disabled={disabled || !!value}
      className={cn(
        'relative flex items-center justify-center',
        'border-2 border-gray-300 dark:border-gray-600',
        'bg-white dark:bg-gray-800',
        'hover:bg-gray-50 dark:hover:bg-gray-700',
        'transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'disabled:cursor-not-allowed',
        sizeClasses[size],
        value && 'cursor-default',
        !value && !disabled && 'cursor-pointer',
        isWinning && 'bg-yellow-100 dark:bg-yellow-900 border-yellow-400 dark:border-yellow-600'
      )}
      whileHover={!disabled && !value ? { scale: 1.05 } : {}}
      whileTap={!disabled && !value ? { scale: 0.95 } : {}}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {value && (
        <motion.span
          className={cn(
            'font-bold select-none',
            value === 'X' && 'text-blue-600 dark:text-blue-400',
            value === 'O' && 'text-red-600 dark:text-red-400'
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {value}
        </motion.span>
      )}
    </motion.button>
  )
}


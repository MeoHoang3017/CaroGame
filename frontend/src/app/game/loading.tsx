'use client'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function GameLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-6"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex justify-center"
        >
          <Loader2 className="h-12 w-12 text-primary" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Loading Game...</h2>
          <p className="text-muted-foreground">Preparing your match</p>
        </div>
      </motion.div>
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-4">Caro Game</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Welcome to the Caro Game frontend
        </p>
      </motion.div>
    </main>
  )
}


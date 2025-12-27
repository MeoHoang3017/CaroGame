'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Gamepad2, Users, Trophy, Zap } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Caro Game</h1>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome to Caro Game
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Challenge your friends in this classic strategy game. Play online, compete, and become the ultimate Caro champion!
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </motion.div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Multiplayer</CardTitle>
                <CardDescription>
                  Play with friends or challenge players from around the world in real-time matches.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Fast & Responsive</CardTitle>
                <CardDescription>
                  Enjoy smooth gameplay with real-time updates and instant moves. No lag, just fun!
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <Trophy className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>
                  Climb the ranks and compete for the top spot. Track your wins and improve your skills.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </div>

        {/* How to Play */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-20"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl text-center">How to Play</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Game Rules</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Players take turns placing their marks (X or O)</li>
                    <li>• The goal is to get 5 marks in a row (horizontal, vertical, or diagonal)</li>
                    <li>• First player to achieve this wins the game</li>
                    <li>• Block your opponent while building your own line</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Tips & Strategies</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Always watch for your opponent's potential winning moves</li>
                    <li>• Create multiple threats simultaneously</li>
                    <li>• Control the center of the board when possible</li>
                    <li>• Think ahead and plan your moves strategically</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t">
        <div className="text-center text-muted-foreground">
          <p>© 2024 Caro Game. Built with Next.js and Tailwind CSS.</p>
        </div>
      </footer>
    </main>
  )
}

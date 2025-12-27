'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Gamepad2, Users, Copy, Check, Play, LogOut, UserPlus } from 'lucide-react'
import Link from 'next/link'

export default function RoomPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const roomCode = searchParams.get('code') || 'ABC123'
  const [copied, setCopied] = useState(false)
  const [isHost, setIsHost] = useState(true) // TODO: Get from API
  const [roomStatus, setRoomStatus] = useState<'waiting' | 'starting' | 'playing'>('waiting')

  // Mock data
  const [players, setPlayers] = useState([
    { id: '1', username: 'You', avatar: '', isReady: true, isHost: true },
    { id: '2', username: 'Player2', avatar: '', isReady: false, isHost: false },
  ])

  const roomInfo = {
    code: roomCode,
    boardSize: 15,
    maxPlayers: 2,
    allowSpectators: true,
    spectators: 3,
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStartGame = () => {
    // TODO: Integrate with backend API
    setRoomStatus('starting')
    setTimeout(() => {
      router.push('/game')
    }, 2000)
  }

  const handleLeaveRoom = () => {
    // TODO: Integrate with backend API
    router.push('/matching')
  }

  const handleToggleReady = () => {
    // TODO: Integrate with backend API
    setPlayers(players.map(p => 
      p.id === '1' ? { ...p, isReady: !p.isReady } : p
    ))
  }

  const allPlayersReady = players.every(p => p.isReady) && players.length === roomInfo.maxPlayers

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Caro Game</h1>
        </div>
        <Button variant="ghost" asChild>
          <Link href="/matching">Back to Matching</Link>
        </Button>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid lg:grid-cols-3 gap-6"
        >
          {/* Main Room Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">Room {roomCode}</CardTitle>
                    <CardDescription>Waiting for players...</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCode}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Board Size</p>
                    <p className="text-lg font-semibold">{roomInfo.boardSize}x{roomInfo.boardSize}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Max Players</p>
                    <p className="text-lg font-semibold">{roomInfo.maxPlayers}</p>
                  </div>
                </div>
                <Separator />
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Players ({players.length}/{roomInfo.maxPlayers})
                  </h3>
                  <div className="space-y-3">
                    {players.map((player, index) => (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className={player.isHost ? 'border-primary' : ''}>
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={player.avatar} />
                                  <AvatarFallback>
                                    {player.username.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold flex items-center gap-2">
                                    {player.username}
                                    {player.isHost && (
                                      <Badge variant="secondary" className="text-xs">Host</Badge>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {player.isReady ? (
                                  <Badge className="bg-green-500">Ready</Badge>
                                ) : (
                                  <Badge variant="outline">Not Ready</Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                    {players.length < roomInfo.maxPlayers && (
                      <Card className="border-dashed">
                        <CardContent className="pt-4 text-center text-muted-foreground">
                          <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Waiting for more players...</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Spectators */}
            {roomInfo.allowSpectators && roomInfo.spectators > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Spectators</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{roomInfo.spectators} watching</p>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              {isHost ? (
                <Button
                  size="lg"
                  className="flex-1 gap-2"
                  onClick={handleStartGame}
                  disabled={!allPlayersReady || roomStatus === 'starting'}
                >
                  <Play className="h-5 w-5" />
                  {roomStatus === 'starting' ? 'Starting Game...' : 'Start Game'}
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant={players.find(p => p.id === '1')?.isReady ? 'outline' : 'default'}
                  className="flex-1"
                  onClick={handleToggleReady}
                >
                  {players.find(p => p.id === '1')?.isReady ? 'Not Ready' : 'Ready'}
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={handleLeaveRoom}
              >
                <LogOut className="h-5 w-5" />
                Leave Room
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Room Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Room Code</p>
                  <p className="font-mono text-lg font-semibold">{roomCode}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge variant="secondary">Waiting</Badge>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Share this room</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={handleCopyCode}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Room Code
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Game Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• First to get 5 in a row wins</p>
                <p>• Players take turns placing marks</p>
                <p>• Can be horizontal, vertical, or diagonal</p>
                <p>• Block your opponent while building your line</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </main>
  )
}


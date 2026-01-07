'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Users, Copy, Check, Play, LogOut, UserPlus, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRoom, useStartMatch, useLeaveRoom } from '@/hooks/useRoom'
import { getStoredUser } from '@/utils/auth'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { toast } from '@/utils/toast'

export default function RoomPage() {
  return (
    <ProtectedRoute>
      <RoomContent />
    </ProtectedRoute>
  )
}

function RoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomCode = searchParams.get('code') || ''
  const [copied, setCopied] = useState(false)
  
  const storedUser = getStoredUser()
  const userId = storedUser?.id || storedUser?._id

  // Fetch room data
  const { data: room, isLoading: roomLoading, error: roomError } = useRoom(roomCode, !!roomCode)
  
  // Mutations
  const startMatchMutation = useStartMatch()
  const leaveRoomMutation = useLeaveRoom()

  // Check if current user is host
  const isHost = useMemo(() => {
    if (!room || !userId) return false
    const hostId = typeof room.hostId === 'string' 
      ? room.hostId 
      : room.hostId?.id || room.hostId?._id
    return hostId === userId
  }, [room, userId])

  // Get players from room
  const players = useMemo(() => {
    if (!room?.players) return []
    return room.players.map((p: any) => {
      const playerUserId = typeof p.userId === 'string' 
        ? p.userId 
        : p.userId?.id || p.userId?._id
      const playerUsername = typeof p.userId === 'object' 
        ? p.userId?.username || 'Unknown'
        : 'Unknown'
      return {
        id: playerUserId,
        username: playerUsername,
        avatar: '',
        isReady: true, // TODO: Add ready status to backend
        isHost: playerUserId === (typeof room.hostId === 'string' ? room.hostId : room.hostId?.id || room.hostId?._id),
      }
    })
  }, [room])

  const roomInfo = room ? {
    code: room.roomCode,
    boardSize: room.boardSize,
    maxPlayers: room.maxPlayers,
    allowSpectators: room.settings?.allowSpectators || false,
    spectators: 0, // TODO: Get from backend
  } : {
    code: roomCode,
    boardSize: 15,
    maxPlayers: 2,
    allowSpectators: true,
    spectators: 0,
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStartGame = async () => {
    try {
      const response = await startMatchMutation.mutateAsync(roomCode)
      if (response.result?.match) {
        const matchId = response.result.match.id || response.result.match._id
        if (matchId) {
          toast.success('Match started!')
          router.push(`/game?matchId=${matchId}`)
        }
      }
    } catch (error: any) {
      const msg = error.message || 'Failed to start match'
      toast.error(msg)
    }
  }

  const handleLeaveRoom = async () => {
    try {
      await leaveRoomMutation.mutateAsync(roomCode)
      if (typeof window !== 'undefined') {
        const storedCode = localStorage.getItem('activeRoomCode')
        if (storedCode === roomCode) {
          localStorage.removeItem('activeRoomCode')
        }
      }
      toast.success('Left room')
      router.push('/matching')
    } catch (error: any) {
      const msg = error.message || 'Failed to leave room'
      toast.error(msg)
    }
  }

  const allPlayersReady = players.length === roomInfo.maxPlayers && room?.status === 'starting'
  
  // Redirect if no room code
  useEffect(() => {
    if (!roomCode) {
      router.push('/matching')
    }
  }, [roomCode, router])

  useEffect(() => {
    if (roomCode && typeof window !== 'undefined') {
      localStorage.setItem('activeRoomCode', roomCode)
    }
  }, [roomCode])

  // Redirect everyone to game when room is in-game and matchId exists
  useEffect(() => {
    const matchId =
      (room as any)?.matchId?._id ||
      (room as any)?.matchId?.id ||
      (room as any)?.matchId

    if (room?.status === 'in-game' && matchId) {
      router.push(`/game?matchId=${matchId}`)
    }
  }, [room, router])
  
  // Redirect if room not found
  useEffect(() => {
    if (roomError && !roomLoading) {
      setTimeout(() => {
        router.push('/matching')
      }, 3000)
    }
  }, [roomError, roomLoading, router])
  
  if (!roomCode) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-8 w-8 mx-auto text-warning" />
            <div>
              <h2 className="text-xl font-semibold">No Room Code</h2>
              <p className="text-muted-foreground">Please select or create a room</p>
            </div>
            <Button asChild>
              <Link href="/matching">Find a Room</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }
  
  if (roomLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }
  
  if (roomError || !room) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-destructive mb-4" />
            <p className="text-destructive mb-4">Room not found or failed to load</p>
            <p className="text-sm text-muted-foreground mb-4">Redirecting to matching...</p>
            <Button asChild>
              <Link href="/matching">Go to Matching</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">

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
                    <CardDescription>
                      {room.status === 'waiting' && 'Waiting for players...'}
                      {room.status === 'starting' && 'Starting game...'}
                      {room.status === 'in-game' && 'Game in progress'}
                      {room.status === 'closed' && 'Room closed'}
                    </CardDescription>
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
              {isHost && (
                <Button
                  size="lg"
                  className="flex-1 gap-2"
                  onClick={handleStartGame}
                  disabled={!allPlayersReady || startMatchMutation.isPending || room.status !== 'starting'}
                >
                  {startMatchMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      Start Game
                    </>
                  )}
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={handleLeaveRoom}
                disabled={leaveRoomMutation.isPending}
              >
                {leaveRoomMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Leaving...
                  </>
                ) : (
                  <>
                    <LogOut className="h-5 w-5" />
                    Leave Room
                  </>
                )}
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
                  <Badge variant="secondary">
                    {room.status === 'waiting' && 'Waiting'}
                    {room.status === 'starting' && 'Starting'}
                    {room.status === 'in-game' && 'In Game'}
                    {room.status === 'closed' && 'Closed'}
                  </Badge>
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
    </ProtectedRoute>
  )
}


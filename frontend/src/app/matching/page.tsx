'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Users, Search, Plus, Copy, Check, Loader2, AlertCircle, Gamepad2 } from 'lucide-react'
import { useAvailableRooms, useCreateRoom, useJoinRoom } from '@/hooks/useRoom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { toast } from '@/utils/toast'
import Link from 'next/link'

export default function MatchingPage() {
  return (
    <ProtectedRoute>
      <MatchingContent />
    </ProtectedRoute>
  )
}

function MatchingContent() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [roomCode, setRoomCode] = useState('')
  const [copied, setCopied] = useState(false)
  
  const [roomSettings, setRoomSettings] = useState({
    boardSize: '15',
    maxPlayers: '2',
    isPrivate: false,
    allowSpectators: true,
  })

  // Fetch available rooms
  const { data: dataAvailableRooms = { rooms: [], page: 0, limit: 0, total: 0 } , isLoading: roomsLoading, error: roomsError } = useAvailableRooms(50, 0)
  const availableRooms = Array.isArray(dataAvailableRooms) ? dataAvailableRooms : dataAvailableRooms?.rooms || [];
  // Create room mutation
  const createRoomMutation = useCreateRoom()
  
  // Join room mutation
  const joinRoomMutation = useJoinRoom()

  const getActiveRoomCode = () => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('activeRoomCode') || ''
  }

  const setActiveRoomCode = (code: string) => {
    if (typeof window === 'undefined') return
    localStorage.setItem('activeRoomCode', code)
  }

  const clearActiveRoomCode = () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('activeRoomCode')
  }

  const handleCreateRoom = async () => {
    try {
      const response = await createRoomMutation.mutateAsync({
        boardSize: parseInt(roomSettings.boardSize),
        maxPlayers: parseInt(roomSettings.maxPlayers),
        isPrivate: roomSettings.isPrivate,
        allowSpectators: roomSettings.allowSpectators,
      })
      
      if (response.result) {
        const newRoomCode = response.result.roomCode
        setActiveRoomCode(newRoomCode)
        setRoomCode(newRoomCode)
        setShowCreateDialog(false)
        toast.success('Room created successfully!')
        router.push(`/room?code=${newRoomCode}`)
      }
    } catch (error: any) {
      const msg = error.message || 'Failed to create room'
      toast.error(msg)
    }
  }

  const handleJoinRoom = async (code: string) => {
    try {
      const response = await joinRoomMutation.mutateAsync({ roomCode: code })
      if (response.result) {
        setActiveRoomCode(code)
        toast.success('Joined room!')
        router.push(`/room?code=${code}`)
      }
    } catch (error: any) {
      const msg = error.message || 'Failed to join room'
      // Nếu phòng cũ đã không tồn tại/expired, bỏ chặn để user thử lại
      if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('expired')) {
        clearActiveRoomCode()
      }
      toast.error(msg)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  console.log(availableRooms);
  const filteredRooms = availableRooms.filter((room: any) => {
    const code = room.roomCode?.toLowerCase() || ''
    const hostName = typeof room.hostId === 'object' 
      ? room.hostId?.username?.toLowerCase() || ''
      : ''
    return code.includes(searchQuery.toLowerCase()) || hostName.includes(searchQuery.toLowerCase())
  })

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
            <Link href="/profile">Profile</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/settings">Settings</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Home</Link>
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Find a Game</h2>
              <p className="text-muted-foreground">Join an existing room or create your own</p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Create Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Room</DialogTitle>
                  <DialogDescription>
                    Configure your game room settings
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="boardSize">Board Size</Label>
                    <Select
                      value={roomSettings.boardSize}
                      onValueChange={(value) => setRoomSettings({ ...roomSettings, boardSize: value })}
                    >
                      <SelectTrigger id="boardSize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10x10 (Small)</SelectItem>
                        <SelectItem value="15">15x15 (Medium)</SelectItem>
                        <SelectItem value="20">20x20 (Large)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxPlayers">Max Players</Label>
                    <Select
                      value={roomSettings.maxPlayers}
                      onValueChange={(value) => setRoomSettings({ ...roomSettings, maxPlayers: value })}
                    >
                      <SelectTrigger id="maxPlayers">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 Players</SelectItem>
                        <SelectItem value="4">4 Players</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="private">Private Room</Label>
                      <p className="text-sm text-muted-foreground">Only players with room code can join</p>
                    </div>
                    <Switch
                      id="private"
                      checked={roomSettings.isPrivate}
                      onCheckedChange={(checked) => setRoomSettings({ ...roomSettings, isPrivate: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="spectators">Allow Spectators</Label>
                      <p className="text-sm text-muted-foreground">Let others watch the game</p>
                    </div>
                    <Switch
                      id="spectators"
                      checked={roomSettings.allowSpectators}
                      onCheckedChange={(checked) => setRoomSettings({ ...roomSettings, allowSpectators: checked })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                    disabled={createRoomMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateRoom}
                    disabled={createRoomMutation.isPending}
                  >
                    {createRoomMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Room'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by room code or host name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Available Rooms */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Available Rooms</h3>
            {roomsLoading ? (
              <Card className="col-span-full">
                <CardContent className="pt-6 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="mt-4 text-muted-foreground">Loading rooms...</p>
                </CardContent>
              </Card>
            ) : roomsError ? (
              <Card className="col-span-full">
                <CardContent className="pt-6 text-center">
                  <AlertCircle className="h-8 w-8 mx-auto text-destructive" />
                  <p className="mt-4 text-destructive">Failed to load rooms</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRooms.length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      No rooms found. Create your own room to get started!
                    </CardContent>
                  </Card>
                ) : (
                  filteredRooms.map((room: any, index: number) => {
                    const hostName = typeof room.hostId === 'object' 
                      ? room.hostId?.username || 'Unknown'
                      : 'Unknown'
                    const playerCount = room.players?.length || 0
                    const isFull = playerCount >= room.maxPlayers
                    
                    return (
                      <motion.div
                        key={room.roomCode || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{room.roomCode}</CardTitle>
                                <CardDescription>Host: {hostName}</CardDescription>
                              </div>
                              {room.settings?.isPrivate && (
                                <Badge variant="secondary">Private</Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>{playerCount}/{room.maxPlayers} Players</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Board: {room.boardSize}x{room.boardSize}
                              </div>
                            </div>
                            <Button
                              className="w-full"
                              onClick={() => handleJoinRoom(room.roomCode)}
                              disabled={isFull || joinRoomMutation.isPending}
                            >
                              {isFull ? 'Room Full' : 'Join Room'}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  )
}


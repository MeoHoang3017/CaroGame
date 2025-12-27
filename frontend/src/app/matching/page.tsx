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
import { Gamepad2, Users, Search, Plus, Copy, Check } from 'lucide-react'
import Link from 'next/link'

export default function MatchingPage() {
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

  // Mock data for available rooms
  const availableRooms = [
    { id: '1', code: 'ABC123', host: 'Player1', players: 1, maxPlayers: 2, boardSize: 15, isPrivate: false },
    { id: '2', code: 'XYZ789', host: 'Player2', players: 2, maxPlayers: 2, boardSize: 20, isPrivate: false },
    { id: '3', code: 'DEF456', host: 'Player3', players: 1, maxPlayers: 4, boardSize: 15, isPrivate: true },
  ]

  const handleCreateRoom = () => {
    // TODO: Integrate with backend API
    const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    setRoomCode(newRoomCode)
    setShowCreateDialog(false)
    // Navigate to room page
    router.push(`/room?code=${newRoomCode}`)
  }

  const handleJoinRoom = (code: string) => {
    // TODO: Integrate with backend API
    router.push(`/room?code=${code}`)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filteredRooms = availableRooms.filter(room =>
    room.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.host.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRoom}>Create Room</Button>
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRooms.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    No rooms found. Create your own room to get started!
                  </CardContent>
                </Card>
              ) : (
                filteredRooms.map((room, index) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{room.code}</CardTitle>
                            <CardDescription>Host: {room.host}</CardDescription>
                          </div>
                          {room.isPrivate && (
                            <Badge variant="secondary">Private</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{room.players}/{room.maxPlayers} Players</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Board: {room.boardSize}x{room.boardSize}
                          </div>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => handleJoinRoom(room.code)}
                          disabled={room.players >= room.maxPlayers}
                        >
                          {room.players >= room.maxPlayers ? 'Room Full' : 'Join Room'}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}


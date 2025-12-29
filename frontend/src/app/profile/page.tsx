'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Edit, Save, Trophy, TrendingUp, Calendar, Mail, User, Loader2, Gamepad2 } from 'lucide-react'
import { useUser, useUpdateUser } from '@/hooks/useUser'
import { useUserMatches } from '@/hooks/useMatch'
import { getStoredUser } from '@/utils/auth'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { toast } from '@/utils/toast'
import Link from 'next/link'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ username: '', email: '' })
  
  // Get user ID from stored user
  const storedUser = getStoredUser()
  const userId = storedUser?.id || storedUser?._id
  
  // Fetch user data
  const { data: user, isLoading: userLoading, error: userError } = useUser(userId || '', !!userId)
  
  // Fetch user matches for stats
  const { data: dataMatches = { matches: [], page: 0, limit: 0, total: 0 }, isLoading: matchesLoading } = useUserMatches(userId || '', 100, 0, !!userId)
  const matches = Array.isArray(dataMatches) ? dataMatches : dataMatches?.matches || [];

  // Update user mutation
  const updateUserMutation = useUpdateUser()
  
  // Calculate stats from matches
  const stats = useMemo(() => {
    if (!matches || matches.length === 0) {
      return {
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        winRate: 0,
        currentStreak: 0,
        bestStreak: 0,
        rank: 0,
        totalPoints: 0,
      }
    }

    
    const gamesPlayed = matches.length
    const gamesWon = matches.filter((m: any) => {
      const winnerId = typeof m.winner === 'string' ? m.winner : m.winner?.id || m.winner?._id
      return winnerId === userId && m.result === 'win-loss'
    }).length
    const gamesLost = matches.filter((m: any) => {
      const winnerId = typeof m.winner === 'string' ? m.winner : m.winner?.id || m.winner?._id
      return winnerId !== userId && m.result === 'win-loss'
    }).length
    const winRate = gamesPlayed > 0 ? (gamesWon / gamesPlayed) * 100 : 0
    
    return {
      gamesPlayed,
      gamesWon,
      gamesLost,
      winRate: Math.round(winRate * 10) / 10,
      currentStreak: 0, // TODO: Calculate from match history
      bestStreak: 0, // TODO: Calculate from match history
      rank: 0, // TODO: Get from backend
      totalPoints: gamesWon * 10, // Simple calculation
    }
  }, [matches, userId])
  
  // Initialize edit data when user loads
  useEffect(() => {
    if (user) {
      setEditData({
        username: user.username || '',
        email: user.email || '',
      })
    }
  }, [user])
  
  const handleSave = async () => {
    if (!userId) return
    
    try {
      await updateUserMutation.mutateAsync({
        userId,
        data: editData,
      })
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      toast.error('Failed to update profile', error.message)
    }
  }

  const handleChange = (field: string, value: string) => {
    setEditData({ ...editData, [field]: value })
  }
  
  // Use user data or fallback
  const profile = user ? {
    username: user.username || 'Unknown',
    email: user.email || '',
    avatar: '',
    bio: 'Caro game enthusiast', // TODO: Add bio field to user model
    joinDate: user.createdAt || new Date().toISOString(),
  } : {
    username: 'Loading...',
    email: '',
    avatar: '',
    bio: '',
    joinDate: new Date().toISOString(),
  }
  
  const achievements = [
    { id: '1', name: 'First Win', description: 'Win your first game', unlocked: stats.gamesWon > 0 },
    { id: '2', name: 'Streak Master', description: 'Win 10 games in a row', unlocked: stats.bestStreak >= 10 },
    { id: '3', name: 'Century Club', description: 'Play 100 games', unlocked: stats.gamesPlayed >= 100 },
    { id: '4', name: 'Perfect Game', description: 'Win without losing a single piece', unlocked: false },
  ]
  
  if (userLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }
  
  if (userError || !user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-destructive">Failed to load profile. Please try again.</p>
            <Button className="mt-4" asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

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
            <Link href="/settings">Settings</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/matching">Matching</Link>
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="text-2xl">
                    {profile.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={editData.username}
                          onChange={(e) => handleChange('username', e.target.value)}
                          disabled={updateUserMutation.isPending}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          disabled={updateUserMutation.isPending}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleSave} 
                          className="gap-2"
                          disabled={updateUserMutation.isPending}
                        >
                          {updateUserMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditing(false)}
                          disabled={updateUserMutation.isPending}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <h2 className="text-3xl font-bold">{profile.username}</h2>
                        {stats.rank > 0 && <Badge variant="secondary">Rank #{stats.rank}</Badge>}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Profile
                        </Button>
                      </div>
                      {profile.bio && <p className="text-muted-foreground mb-4">{profile.bio}</p>}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{profile.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Joined {new Date(profile.joinDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Games Played</p>
                    <p className="text-2xl font-bold">{stats.gamesPlayed}</p>
                  </div>
                  <Gamepad2 className="h-8 w-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
                    <p className="text-2xl font-bold">{stats.winRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
                    <p className="text-2xl font-bold">{stats.currentStreak}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Points</p>
                    <p className="text-2xl font-bold">{stats.totalPoints}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Detailed Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Game Statistics</CardTitle>
                <CardDescription>Your performance overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Games Won</span>
                  <span className="font-semibold text-green-600">{stats.gamesWon}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Games Lost</span>
                  <span className="font-semibold text-red-600">{stats.gamesLost}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Best Streak</span>
                  <span className="font-semibold">{stats.bestStreak}</span>
                </div>
                <Separator />
                {stats.rank > 0 && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Global Rank</span>
                      <span className="font-semibold">#{stats.rank}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Your unlocked achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.map((achievement: any) => (
                    <div
                      key={achievement.id}
                      className={`p-3 rounded-lg border ${
                        achievement.unlocked
                          ? 'bg-primary/5 border-primary/20'
                          : 'bg-muted/50 border-muted opacity-60'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold flex items-center gap-2">
                            {achievement.name}
                            {achievement.unlocked && (
                              <Badge variant="default" className="text-xs">Unlocked</Badge>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {achievement.description}
                          </p>
                          {achievement.unlocked && achievement.date && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Unlocked on {new Date(achievement.date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {achievement.unlocked && (
                          <Trophy className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </main>
  )
}


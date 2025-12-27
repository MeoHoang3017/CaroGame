'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Gamepad2, Edit, Save, Trophy, TrendingUp, Calendar, Mail, User } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    username: 'Player1',
    email: 'player1@example.com',
    avatar: '',
    bio: 'Caro game enthusiast',
    joinDate: '2024-01-15',
  })

  const stats = {
    gamesPlayed: 127,
    gamesWon: 78,
    gamesLost: 49,
    winRate: 61.4,
    currentStreak: 5,
    bestStreak: 12,
    rank: 42,
    totalPoints: 2450,
  }

  const achievements = [
    { id: '1', name: 'First Win', description: 'Win your first game', unlocked: true, date: '2024-01-16' },
    { id: '2', name: 'Streak Master', description: 'Win 10 games in a row', unlocked: true, date: '2024-02-20' },
    { id: '3', name: 'Century Club', description: 'Play 100 games', unlocked: true, date: '2024-03-10' },
    { id: '4', name: 'Perfect Game', description: 'Win without losing a single piece', unlocked: false },
  ]

  const handleSave = () => {
    // TODO: Integrate with backend API
    console.log('Saving profile:', profile)
    setIsEditing(false)
  }

  const handleChange = (field: string, value: string) => {
    setProfile({ ...profile, [field]: value })
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
                          value={profile.username}
                          onChange={(e) => handleChange('username', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Input
                          id="bio"
                          value={profile.bio}
                          onChange={(e) => handleChange('bio', e.target.value)}
                          placeholder="Tell us about yourself"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSave} className="gap-2">
                          <Save className="h-4 w-4" />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <h2 className="text-3xl font-bold">{profile.username}</h2>
                        <Badge variant="secondary">Rank #{stats.rank}</Badge>
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
                      <p className="text-muted-foreground mb-4">{profile.bio}</p>
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
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Global Rank</span>
                  <span className="font-semibold">#{stats.rank}</span>
                </div>
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
                  {achievements.map((achievement) => (
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


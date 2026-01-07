'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Trophy, TrendingUp, Gamepad2 } from 'lucide-react'

type Stats = {
  gamesPlayed: number
  gamesWon: number
  gamesLost: number
  winRate: number
  currentStreak: number
  bestStreak: number
  rank: number
  totalPoints: number
}

type Achievement = {
  id: string
  name: string
  description: string
  unlocked: boolean
  date?: string
}

export function StatsGrid({ stats }: { stats: Stats }) {
  return (
    <>
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
      </div>
    </>
  )
}

export function AchievementsList({ achievements }: { achievements: Achievement[] }) {
  return (
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
                      <Badge variant="default" className="text-xs">
                        Unlocked
                      </Badge>
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
  )
}


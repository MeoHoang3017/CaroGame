'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Edit, Save, Calendar, Mail, User, Loader2 } from 'lucide-react'
import { useUser, useUpdateUser, useUpdatePassword } from '@/hooks/useUser'
import { useUserMatches } from '@/hooks/useMatch'
import { getStoredUser } from '@/utils/auth'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { toast } from '@/utils/toast'
import Link from 'next/link'
import type { ComponentType } from 'react'
import { Lock } from 'lucide-react'

const StatsGrid = dynamic(() => import('./ProfileSections').then((m) => m.StatsGrid), {
  ssr: false,
  loading: () => <SectionSkeleton title="Statistics" />,
}) as ComponentType<{ stats: any }>

const AchievementsList = dynamic(
  () => import('./ProfileSections').then((m) => m.AchievementsList),
  {
    ssr: false,
    loading: () => <SectionSkeleton title="Achievements" />,
  }
) as ComponentType<{ achievements: any[] }>

export default function ProfileClient() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}

function ProfileContent() {
  const [editData, setEditData] = useState({ username: '', email: '' })
  const [isEditing, setIsEditing] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    next: '',
    confirm: '',
  })
  const storedUser = getStoredUser()
  const userId = storedUser?.id || storedUser?._id

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useUser(userId || '', !!userId)

  const {
    data: dataMatches = { matches: [], page: 0, limit: 0, total: 0 },
  } = useUserMatches(userId || '', 20, 0, !!userId)
  const matches = Array.isArray(dataMatches)
    ? dataMatches
    : dataMatches?.matches || []

  const updateUserMutation = useUpdateUser()
  const updatePasswordMutation = useUpdatePassword()

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
      const winnerId =
        typeof m.winner === 'string'
          ? m.winner
          : m.winner?.id || m.winner?._id
      return winnerId === userId && m.result === 'win-loss'
    }).length
    const gamesLost = matches.filter((m: any) => {
      const winnerId =
        typeof m.winner === 'string'
          ? m.winner
          : m.winner?.id || m.winner?._id
      return winnerId !== userId && m.result === 'win-loss'
    }).length
    const winRate = gamesPlayed > 0 ? (gamesWon / gamesPlayed) * 100 : 0

    return {
      gamesPlayed,
      gamesWon,
      gamesLost,
      winRate: Math.round(winRate * 10) / 10,
      currentStreak: 0,
      bestStreak: 0,
      rank: 0,
      totalPoints: gamesWon * 10,
    }
  }, [matches, userId])

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
        // Email update is not allowed; only send username
        data: { username: editData.username },
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

  const handlePasswordChange = (field: 'current' | 'next' | 'confirm', value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }))
  }

  const handlePasswordSave = async () => {
    if (!userId) return
    if (!passwordForm.current || !passwordForm.next || !passwordForm.confirm) {
      toast.error('Vui lòng nhập đầy đủ mật khẩu')
      return
    }
    if (passwordForm.next !== passwordForm.confirm) {
      toast.error('Mật khẩu mới không khớp')
      return
    }
    try {
      await updatePasswordMutation.mutateAsync({
        userId,
        oldPassword: passwordForm.current,
        newPassword: passwordForm.next,
      })
      toast.success('Đổi mật khẩu thành công')
      setPasswordForm({ current: '', next: '', confirm: '' })
    } catch (error: any) {
      toast.error(error?.message || 'Đổi mật khẩu thất bại')
    }
  }

  const profile = user
    ? {
        username: user.username || 'Unknown',
        email: user.email || '',
        avatar: '',
        bio: 'Caro game enthusiast',
        joinDate: user.createdAt || new Date().toISOString(),
      }
    : {
        username: 'Loading...',
        email: '',
        avatar: '',
        bio: '',
        joinDate: new Date().toISOString(),
      }

  const achievements = [
    {
      id: '1',
      name: 'First Win',
      description: 'Win your first game',
      unlocked: stats.gamesWon > 0,
    },
    {
      id: '2',
      name: 'Streak Master',
      description: 'Win 10 games in a row',
      unlocked: stats.bestStreak >= 10,
    },
    {
      id: '3',
      name: 'Century Club',
      description: 'Play 100 games',
      unlocked: stats.gamesPlayed >= 100,
    },
    {
      id: '4',
      name: 'Perfect Game',
      description: 'Win without losing a single piece',
      unlocked: false,
    },
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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
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
                          disabled
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
                        {stats.rank > 0 && (
                          <Badge variant="secondary">Rank #{stats.rank}</Badge>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
                          <Edit className="h-4 w-4" />
                          Edit Profile
                        </Button>
                      </div>
                      {profile.bio && (
                        <p className="text-muted-foreground mb-4">{profile.bio}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{profile.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Joined {new Date(profile.joinDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <StatsGrid stats={stats} />
          <AchievementsList achievements={achievements} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Đổi mật khẩu
            </CardTitle>
            <CardDescription>Cập nhật mật khẩu tài khoản của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.current}
                onChange={(e) => handlePasswordChange('current', e.target.value)}
                disabled={updatePasswordMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.next}
                onChange={(e) => handlePasswordChange('next', e.target.value)}
                disabled={updatePasswordMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                disabled={updatePasswordMutation.isPending}
              />
            </div>
            <Button
              className="gap-2"
              onClick={handlePasswordSave}
              disabled={updatePasswordMutation.isPending}
            >
              {updatePasswordMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                'Cập nhật mật khẩu'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function SectionSkeleton({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Loading...</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse" />
      </CardContent>
    </Card>
  )
}


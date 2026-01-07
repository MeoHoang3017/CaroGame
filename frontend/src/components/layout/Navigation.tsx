/**
 * Navigation Component
 * Shared navigation component for all pages
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Gamepad2, User as UserIcon, Settings, LogOut, Menu, X } from 'lucide-react'
import { getStoredUser, clearUser } from '@/utils/auth'
import { useLogout } from '@/hooks/useAuth'
import { useLeaveRoom } from '@/hooks/useRoom'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import type { User as ApiUser } from '@/types/api.types'

export function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<ApiUser | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hasRedirectedToRoom, setHasRedirectedToRoom] = useState(false)
  const logoutMutation = useLogout()
  const leaveRoomMutation = useLeaveRoom()

  useEffect(() => {
    const storedUser = getStoredUser()
    setUser(storedUser)
  }, [])

  // If user has an active room and navigates away from room/game, treat it as leaving the room
  useEffect(() => {
    if (typeof window === 'undefined') return
    const activeRoomCode = localStorage.getItem('activeRoomCode')
    if (!activeRoomCode) return

    const isRoomPage = pathname?.startsWith('/room')
    const isGamePage = pathname?.startsWith('/game')
    // If not on room/game and we haven't redirected yet, bring the user back to their active room
    if (!isRoomPage && !isGamePage && !hasRedirectedToRoom) {
      setHasRedirectedToRoom(true)
      router.replace(`/room?code=${activeRoomCode}`)
      return
    }

    if (isRoomPage || isGamePage) return

    leaveRoomMutation.mutate(activeRoomCode, {
      onSettled: () => {
        localStorage.removeItem('activeRoomCode')
      },
    })
  }, [pathname, leaveRoomMutation, hasRedirectedToRoom, router])

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
      clearUser()
      setUser(null)
      router.push('/')
      setIsMobileMenuOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const isAuthenticated = !!user
  const isHomePage = pathname === '/'
  const isLoginPage = pathname === '/login'
  const isRegisterPage = pathname === '/register'

  // Don't show navigation on login/register pages
  if (isLoginPage || isRegisterPage) {
    return null
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Gamepad2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Caro Game</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/matching">Matching</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/profile">Profile</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/settings">Settings</Link>
                </Button>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      {/*
                        Avatar is not part of User type; read loosely from stored user.
                      */}
                      {(() => {
                        const avatar = (user as any)?.avatar
                        return (
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={avatar} alt={user?.username} />
                        <AvatarFallback>
                          {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                        )
                      })()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.username || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <UserIcon className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {!isHomePage && (
                  <Button variant="ghost" asChild>
                    <Link href="/">Home</Link>
                  </Button>
                )}
                <ThemeToggle />
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-2">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/matching" onClick={() => setIsMobileMenuOpen(false)}>
                    Matching
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                    Profile
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                    Settings
                  </Link>
                </Button>
                <div className="px-4 py-2">
                  <ThemeToggle />
                </div>
                <div className="flex items-center gap-2 px-4 py-2">
                  {(() => {
                    const avatar = (user as any)?.avatar
                    return (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={avatar} alt={user?.username} />
                        <AvatarFallback>
                          {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )
                  })()}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user?.username || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                </Button>
              </>
            ) : (
              <>
                {!isHomePage && (
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                      Home
                    </Link>
                  </Button>
                )}
                <div className="px-4 py-2">
                  <ThemeToggle />
                </div>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button className="w-full justify-start" asChild>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    Register
                  </Link>
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}


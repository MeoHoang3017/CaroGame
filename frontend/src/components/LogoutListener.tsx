/**
 * Logout Listener Component
 * Listens for logout events triggered by token refresh failures
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/utils/toast'

export function LogoutListener() {
  const router = useRouter()

  useEffect(() => {
    const handleLogout = () => {
      // Clear user data
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      
      // Show message and redirect
      toast.error('Your session has expired. Please login again.')
      router.push('/login')
    }

    window.addEventListener('logout', handleLogout as EventListener)
    return () => {
      window.removeEventListener('logout', handleLogout as EventListener)
    }
  }, [router])

  return null
}

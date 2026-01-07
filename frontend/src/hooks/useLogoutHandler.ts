/**
 * useLogoutHandler Hook
 * Handles session expiration from token refresh failures
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLogout } from './useAuth'
import { toast } from '@/utils/toast'

export const useLogoutHandler = () => {
  const router = useRouter()
  const logoutMutation = useLogout()

  useEffect(() => {
    const handleLogout = async () => {
      await logoutMutation.mutateAsync()
      toast.error('Your session has expired. Please login again.')
      router.push('/login')
    }

    window.addEventListener('logout', handleLogout)
    return () => {
      window.removeEventListener('logout', handleLogout)
    }
  }, [logoutMutation, router])
}

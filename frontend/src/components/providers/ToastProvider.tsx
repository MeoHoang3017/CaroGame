/**
 * Toast Provider
 * Wrapper for sonner toast notifications
 */

'use client'

import { Toaster } from 'sonner'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={4000}
    />
  )
}


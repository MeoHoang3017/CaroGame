/**
 * Page Loader Component
 * Full page loading indicator
 */

'use client'

import { LoadingSpinner } from './LoadingSpinner'

interface PageLoaderProps {
  text?: string
}

export function PageLoader({ text = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}


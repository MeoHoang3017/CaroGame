import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/Providers'
import { Navigation } from '@/components/layout/Navigation'
import { LogoutListener } from '../components/LogoutListener'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Caro Game',
  description: 'A multiplayer Caro game built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <LogoutListener />
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  )
}


import type { Metadata } from 'next'
import { DM_Mono, Geist } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from '@/components/ui/sonner'
import NavSidebar from '@/components/layout/NavSidebar'
import ErrorBoundary from '@/components/layout/ErrorBoundary'
import './globals.css'
const geistSans = Geist({
  variable: '--font-geist-sans',
  weight: '400',
  subsets: ['latin']
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: '400'
})

export const metadata: Metadata = {
  title: 'NEXUS Console',
  description:
    'Enterprise control plane for Agno AgentOS. Manage agents, traces, memory, knowledge, evals, schedules, workflows, approvals, and metrics.'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${dmMono.variable} antialiased`}>
        <NuqsAdapter>
          <div className="flex h-screen">
            <NavSidebar />
            <main className="flex-1 overflow-hidden">
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
          </div>
        </NuqsAdapter>
        <Toaster />
      </body>
    </html>
  )
}

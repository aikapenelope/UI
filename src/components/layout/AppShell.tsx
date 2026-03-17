'use client'

import { useState } from 'react'
import NavSidebar, {
  ConnectionSettingsDialog
} from '@/components/layout/NavSidebar'
import ConnectionBanner from '@/components/shared/ConnectionBanner'
import ErrorBoundary from '@/components/layout/ErrorBoundary'

/**
 * Client-side shell that wraps the sidebar, connection banner, and main
 * content area. Extracted from layout.tsx so the root layout can stay a
 * server component while the shell manages client state (settings dialog).
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const openSettings = () => setSettingsOpen(true)

  return (
    <div className="flex h-screen">
      <NavSidebar onOpenSettings={openSettings} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <ConnectionBanner onOpenSettings={openSettings} />
        <main className="flex-1 overflow-hidden">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
      <ConnectionSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  )
}

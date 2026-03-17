'use client'

import { useStore } from '@/store'
import { WifiOff, Settings } from 'lucide-react'

/**
 * Thin banner shown at the top of the main content area when the AgentOS
 * endpoint is unreachable. Clicking it opens the connection settings.
 */
export default function ConnectionBanner({
  onOpenSettings
}: {
  onOpenSettings: () => void
}) {
  const isActive = useStore((s) => s.isEndpointActive)
  const isLoading = useStore((s) => s.isEndpointLoading)

  if (isActive || isLoading) return null

  return (
    <button
      onClick={onOpenSettings}
      className="flex w-full items-center justify-center gap-2 bg-[#E53935]/10 px-4 py-1.5 text-xs text-[#E53935] transition-colors hover:bg-[#E53935]/15"
    >
      <WifiOff size={12} />
      <span>Not connected to AgentOS</span>
      <span className="flex items-center gap-1 rounded border border-[#E53935]/30 px-1.5 py-0.5 text-[10px]">
        <Settings size={10} />
        Settings
      </span>
    </button>
  )
}

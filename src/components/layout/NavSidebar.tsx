'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import Icon from '@/components/ui/icon'
import { useStore } from '@/store'
import { getHealthAPI } from '@/api/config'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import {
  MessageSquare,
  Activity,
  Brain,
  BookOpen,
  FlaskConical,
  Clock,
  GitBranch,
  ShieldCheck,
  BarChart3,
  Blocks,
  Package,
  Settings,
  Bot,
  Users
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { label: 'Chat', href: '/', icon: <MessageSquare size={16} /> },
  { label: 'Agents', href: '/agents', icon: <Bot size={16} /> },
  { label: 'Teams', href: '/teams', icon: <Users size={16} /> },
  { label: 'Traces', href: '/traces', icon: <Activity size={16} /> },
  { label: 'Memory', href: '/memory', icon: <Brain size={16} /> },
  { label: 'Knowledge', href: '/knowledge', icon: <BookOpen size={16} /> },
  { label: 'Evals', href: '/evals', icon: <FlaskConical size={16} /> },
  { label: 'Schedules', href: '/schedules', icon: <Clock size={16} /> },
  { label: 'Workflows', href: '/workflows', icon: <GitBranch size={16} /> },
  {
    label: 'Approvals',
    href: '/approvals',
    icon: <ShieldCheck size={16} />
  },
  { label: 'Metrics', href: '/metrics', icon: <BarChart3 size={16} /> },
  { label: 'Studio', href: '/studio', icon: <Blocks size={16} /> },
  { label: 'Registry', href: '/registry', icon: <Package size={16} /> }
]

// ---------------------------------------------------------------------------
// Connection status type
// ---------------------------------------------------------------------------

type ConnectionStatus = 'connected' | 'disconnected' | 'checking'

function statusColor(s: ConnectionStatus): string {
  switch (s) {
    case 'connected':
      return 'bg-[#22C55E]'
    case 'disconnected':
      return 'bg-[#E53935]'
    case 'checking':
      return 'bg-yellow-500 animate-pulse'
  }
}

// ---------------------------------------------------------------------------
// Settings dialog
// ---------------------------------------------------------------------------

function ConnectionSettingsDialog({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const endpoint = useStore((s) => s.selectedEndpoint)
  const authToken = useStore((s) => s.authToken)
  const setSelectedEndpoint = useStore((s) => s.setSelectedEndpoint)
  const setAuthToken = useStore((s) => s.setAuthToken)

  const [draftEndpoint, setDraftEndpoint] = useState(endpoint)
  const [draftToken, setDraftToken] = useState(authToken)
  const [status, setStatus] = useState<ConnectionStatus>('checking')
  const [statusText, setStatusText] = useState('')

  // Check health on open
  const checkHealth = useCallback(async () => {
    setStatus('checking')
    setStatusText('Checking...')
    try {
      const res = await getHealthAPI(draftEndpoint, draftToken || undefined)
      if (res && res.status === 'ok') {
        setStatus('connected')
        setStatusText('Connected')
      } else {
        setStatus('disconnected')
        setStatusText('Unhealthy response')
      }
    } catch {
      setStatus('disconnected')
      setStatusText('Unreachable')
    }
  }, [draftEndpoint, draftToken])

  useEffect(() => {
    if (open) {
      setDraftEndpoint(endpoint)
      setDraftToken(authToken)
      void checkHealth()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleSave = () => {
    setSelectedEndpoint(draftEndpoint.trim())
    setAuthToken(draftToken.trim())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-[#111113] sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Settings size={14} />
            Connection Settings
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Status indicator */}
          <div className="flex items-center gap-2 rounded border border-border px-3 py-2">
            <div className={`h-2 w-2 rounded-full ${statusColor(status)}`} />
            <span className="text-xs text-muted">{statusText}</span>
          </div>

          {/* Endpoint */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">
              AgentOS Endpoint
            </label>
            <input
              value={draftEndpoint}
              onChange={(e) => setDraftEndpoint(e.target.value)}
              placeholder="http://localhost:7777"
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>

          {/* Auth token */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">
              Auth Token (optional)
            </label>
            <input
              type="password"
              value={draftToken}
              onChange={(e) => setDraftToken(e.target.value)}
              placeholder="Bearer token or security key"
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <span className="text-[10px] text-muted">
              Set OS_SECURITY_KEY or JWT token for authenticated endpoints
            </span>
          </div>

          {/* Test button */}
          <button
            onClick={() => void checkHealth()}
            disabled={status === 'checking'}
            className="self-start rounded border border-border px-3 py-1 text-xs text-muted hover:bg-accent hover:text-primary disabled:opacity-40"
          >
            Test Connection
          </button>
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded border border-border px-4 py-1.5 text-xs text-muted hover:bg-accent hover:text-primary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded bg-primary px-4 py-1.5 text-xs font-medium text-primaryAccent hover:opacity-90"
          >
            Save
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// NavSidebar
// ---------------------------------------------------------------------------

export default function NavSidebar() {
  const pathname = usePathname()
  const endpoint = useStore((s) => s.selectedEndpoint)
  const authToken = useStore((s) => s.authToken)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [connStatus, setConnStatus] = useState<ConnectionStatus>('checking')

  // Periodic health check
  useEffect(() => {
    let cancelled = false
    const check = async () => {
      try {
        const res = await getHealthAPI(endpoint, authToken || undefined)
        if (!cancelled) {
          setConnStatus(
            res && res.status === 'ok' ? 'connected' : 'disconnected'
          )
        }
      } catch {
        if (!cancelled) setConnStatus('disconnected')
      }
    }
    void check()
    const interval = setInterval(() => void check(), 30_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [endpoint, authToken])

  return (
    <>
      <nav className="flex h-screen w-14 shrink-0 flex-col items-center border-r border-primary/10 bg-background py-3">
        {/* Logo */}
        <div className="mb-4 flex items-center justify-center">
          <Icon type="agno" size="xs" />
        </div>

        {/* Navigation items */}
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-1">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-primary'
                }`}
                title={item.label}
              >
                {item.icon}
                {/* Tooltip */}
                <span className="bg-popover text-popover-foreground pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Settings button at bottom */}
        <div className="mt-2 flex flex-col items-center gap-2 px-1">
          <button
            onClick={() => setSettingsOpen(true)}
            className="text-muted-foreground group relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-accent hover:text-primary"
            title="Connection Settings"
          >
            <div className="relative">
              <Settings size={16} />
              <div
                className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-background ${statusColor(connStatus)}`}
              />
            </div>
            <span className="bg-popover text-popover-foreground pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium opacity-0 shadow-md transition-opacity group-hover:opacity-100">
              Settings
            </span>
          </button>
        </div>
      </nav>

      <ConnectionSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </>
  )
}

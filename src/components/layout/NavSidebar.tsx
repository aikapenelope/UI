'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icon from '@/components/ui/icon'
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
  Package
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { label: 'Chat', href: '/', icon: <MessageSquare size={16} /> },
  { label: 'Traces', href: '/traces', icon: <Activity size={16} /> },
  { label: 'Memory', href: '/memory', icon: <Brain size={16} /> },
  { label: 'Knowledge', href: '/knowledge', icon: <BookOpen size={16} /> },
  { label: 'Evals', href: '/evals', icon: <FlaskConical size={16} /> },
  { label: 'Schedules', href: '/schedules', icon: <Clock size={16} /> },
  { label: 'Workflows', href: '/workflows', icon: <GitBranch size={16} /> },
  { label: 'Approvals', href: '/approvals', icon: <ShieldCheck size={16} /> },
  { label: 'Metrics', href: '/metrics', icon: <BarChart3 size={16} /> },
  { label: 'Studio', href: '/studio', icon: <Blocks size={16} /> },
  { label: 'Registry', href: '/registry', icon: <Package size={16} /> }
]

export default function NavSidebar() {
  const pathname = usePathname()

  return (
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
    </nav>
  )
}

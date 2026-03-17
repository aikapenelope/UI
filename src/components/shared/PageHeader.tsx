import type { ReactNode } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'

/**
 * Standardised page header with title, optional subtitle / count badge,
 * a refresh button, and an optional trailing action slot.
 */
export default function PageHeader({
  title,
  subtitle,
  count,
  loading,
  onRefresh,
  actions
}: {
  title: string
  subtitle?: string
  count?: number
  loading?: boolean
  onRefresh?: () => void
  actions?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-sm font-semibold text-primary">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground text-xs">{subtitle}</p>
          )}
        </div>
        {count != null && (
          <span className="text-muted-foreground rounded-md bg-accent px-2 py-0.5 font-mono text-[11px]">
            {count}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {actions}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="text-muted-foreground rounded border border-border p-1.5 transition-colors hover:bg-accent hover:text-primary disabled:opacity-40"
            title="Refresh"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
          </button>
        )}
      </div>
    </div>
  )
}

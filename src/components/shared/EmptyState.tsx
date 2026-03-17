import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

/**
 * Consistent empty-state placeholder used across all data pages.
 *
 * @param icon    - Lucide icon element (defaults to Inbox)
 * @param title   - Short heading, e.g. "No sessions found"
 * @param description - Longer helper text
 * @param action  - Optional CTA button / link
 */
export default function EmptyState({
  icon,
  title,
  description,
  action
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <div className="text-muted-foreground flex h-12 w-12 items-center justify-center rounded-full border border-border bg-accent/50">
        {icon ?? <Inbox size={20} />}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-primary">{title}</p>
        {description && (
          <p className="text-muted-foreground mt-0.5 max-w-xs text-xs">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}

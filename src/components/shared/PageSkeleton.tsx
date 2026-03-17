import { Skeleton } from '@/components/ui/skeleton'

/**
 * Generic loading skeleton for list / table pages.
 * Renders `rows` shimmer bars inside a padded container.
 */
export default function PageSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={String(i)} className="h-10 w-full rounded" />
      ))}
    </div>
  )
}

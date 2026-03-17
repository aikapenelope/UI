'use client'

import { memo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { TraceSummary, PaginationInfo } from '@/types/agentOS'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function statusVariant(
  status: string
): 'default' | 'destructive' | 'secondary' | 'outline' {
  if (status === 'ERROR') return 'destructive'
  if (status === 'OK') return 'default'
  return 'secondary'
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function TraceListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded" />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function TraceListEmpty() {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted">
      <p className="text-sm">No traces found</p>
      <p className="text-xs">
        Traces will appear here once your agents start running.
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

interface PaginationBarProps {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
}

function PaginationBar({ pagination, onPageChange }: PaginationBarProps) {
  const { page, total_pages, total_count } = pagination
  if (total_pages <= 1) return null

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted">
      <span>
        Page {page} of {total_pages} ({total_count} total)
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded p-1 hover:bg-accent disabled:opacity-30"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          disabled={page >= total_pages}
          onClick={() => onPageChange(page + 1)}
          className="rounded p-1 hover:bg-accent disabled:opacity-30"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface TraceListTableProps {
  traces: TraceSummary[]
  pagination: PaginationInfo | null
  isLoading: boolean
  selectedTraceId: string | null
  onSelectTrace: (traceId: string) => void
  onPageChange: (page: number) => void
}

function TraceListTableInner({
  traces,
  pagination,
  isLoading,
  selectedTraceId,
  onSelectTrace,
  onPageChange
}: TraceListTableProps) {
  if (isLoading) return <TraceListSkeleton />
  if (traces.length === 0) return <TraceListEmpty />

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border text-xs hover:bg-transparent">
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-[90px] text-right">Duration</TableHead>
              <TableHead className="w-[70px] text-right">Spans</TableHead>
              <TableHead className="w-[160px] text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {traces.map((trace) => (
              <TableRow
                key={trace.trace_id}
                onClick={() => onSelectTrace(trace.trace_id)}
                className={`cursor-pointer border-border text-xs transition-colors ${
                  selectedTraceId === trace.trace_id
                    ? 'bg-accent/60'
                    : 'hover:bg-accent/30'
                }`}
              >
                <TableCell>
                  <Badge
                    variant={statusVariant(trace.status)}
                    className="font-dmmono text-[10px]"
                  >
                    {trace.status}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[200px] truncate font-medium">
                  {trace.name}
                  {trace.input && (
                    <span className="ml-2 truncate text-muted">
                      {trace.input.slice(0, 60)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right font-dmmono">
                  {trace.duration}
                </TableCell>
                <TableCell className="text-right font-dmmono">
                  {trace.total_spans}
                  {trace.error_count > 0 && (
                    <span className="ml-1 text-destructive">
                      ({trace.error_count}err)
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right text-muted">
                  {formatTimestamp(trace.start_time)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {pagination && (
        <PaginationBar pagination={pagination} onPageChange={onPageChange} />
      )}
    </div>
  )
}

const TraceListTable = memo(TraceListTableInner)
TraceListTable.displayName = 'TraceListTable'

export default TraceListTable

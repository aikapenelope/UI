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
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ContentResponse, PaginationInfo } from '@/types/agentOS'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso?: string | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatSize(bytes?: string | null): string {
  if (!bytes) return '-'
  const n = parseInt(bytes, 10)
  if (isNaN(n) || n === 0) return '-'
  if (n >= 1_048_576) return `${(n / 1_048_576).toFixed(1)} MB`
  if (n >= 1_024) return `${(n / 1_024).toFixed(1)} KB`
  return `${n} B`
}

function statusVariant(
  status?: string | null
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'completed':
      return 'default'
    case 'processing':
      return 'secondary'
    case 'failed':
      return 'destructive'
    default:
      return 'outline'
  }
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

interface PaginationControlsProps {
  pagination: PaginationInfo | null
  onPageChange: (page: number) => void
}

function PaginationControls({
  pagination,
  onPageChange
}: PaginationControlsProps) {
  if (!pagination || pagination.total_pages <= 1) return null
  const page = pagination.page ?? 1
  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-2">
      <span className="text-[10px] text-muted">
        Page {page} of {pagination.total_pages} ({pagination.total_count} items)
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded p-1 text-muted transition-colors hover:bg-accent hover:text-primary disabled:opacity-30"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pagination.total_pages}
          className="rounded p-1 text-muted transition-colors hover:bg-accent hover:text-primary disabled:opacity-30"
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

interface KnowledgeContentTableProps {
  contents: ContentResponse[]
  pagination: PaginationInfo | null
  onDelete: (contentId: string) => void
  onPageChange: (page: number) => void
}

function KnowledgeContentTableInner({
  contents,
  pagination,
  onDelete,
  onPageChange
}: KnowledgeContentTableProps) {
  if (contents.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-xs text-muted">
        No content uploaded yet
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Table>
        <TableHeader>
          <TableRow className="border-border text-xs hover:bg-transparent">
            <TableHead>Name</TableHead>
            <TableHead className="w-[100px]">Type</TableHead>
            <TableHead className="w-[80px]">Size</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[150px]">Created</TableHead>
            <TableHead className="w-[60px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contents.map((c) => (
            <TableRow key={c.id} className="border-border text-xs">
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-primary">
                    {c.name || c.id}
                  </span>
                  {c.description && (
                    <span className="text-[10px] text-muted">
                      {c.description.length > 80
                        ? c.description.slice(0, 80) + '...'
                        : c.description}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted">{c.type || '-'}</TableCell>
              <TableCell className="font-dmmono text-muted">
                {formatSize(c.size)}
              </TableCell>
              <TableCell>
                <Badge
                  variant={statusVariant(c.status)}
                  className="text-[10px]"
                >
                  {c.status || 'unknown'}
                </Badge>
              </TableCell>
              <TableCell className="text-muted">
                {formatDate(c.created_at)}
              </TableCell>
              <TableCell className="text-right">
                <button
                  onClick={() => onDelete(c.id)}
                  className="rounded p-1 text-muted transition-colors hover:bg-red-900/20 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <PaginationControls pagination={pagination} onPageChange={onPageChange} />
    </div>
  )
}

const KnowledgeContentTable = memo(KnowledgeContentTableInner)
KnowledgeContentTable.displayName = 'KnowledgeContentTable'

export default KnowledgeContentTable

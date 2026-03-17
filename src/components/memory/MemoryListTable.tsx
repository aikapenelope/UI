'use client'

import { memo, useCallback } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { UserMemory, PaginationInfo } from '@/types/agentOS'

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

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '...' : text
}

// ---------------------------------------------------------------------------
// Pagination controls
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
  const totalPages = pagination.total_pages

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-2">
      <span className="text-[10px] text-muted">
        Page {page} of {totalPages} ({pagination.total_count} total)
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
          disabled={page >= totalPages}
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

interface MemoryListTableProps {
  memories: UserMemory[]
  pagination: PaginationInfo | null
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onSelectAll: (ids: string[]) => void
  onClearSelection: () => void
  onEdit: (memory: UserMemory) => void
  onDelete: (memoryId: string) => void
  onPageChange: (page: number) => void
}

function MemoryListTableInner({
  memories,
  pagination,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onEdit,
  onDelete,
  onPageChange
}: MemoryListTableProps) {
  const allSelected =
    memories.length > 0 && memories.every((m) => selectedIds.has(m.memory_id))

  const handleToggleAll = useCallback(() => {
    if (allSelected) {
      onClearSelection()
    } else {
      onSelectAll(memories.map((m) => m.memory_id))
    }
  }, [allSelected, memories, onSelectAll, onClearSelection])

  if (memories.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-xs text-muted">
        No memories found
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <Table>
        <TableHeader>
          <TableRow className="border-border text-xs hover:bg-transparent">
            <TableHead className="w-[36px]">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleToggleAll}
                className="accent-primary"
              />
            </TableHead>
            <TableHead>Memory</TableHead>
            <TableHead className="w-[200px]">Topics</TableHead>
            <TableHead className="w-[100px]">User</TableHead>
            <TableHead className="w-[160px]">Updated</TableHead>
            <TableHead className="w-[80px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {memories.map((m) => (
            <TableRow key={m.memory_id} className="border-border text-xs">
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedIds.has(m.memory_id)}
                  onChange={() => onToggleSelect(m.memory_id)}
                  className="accent-primary"
                />
              </TableCell>
              <TableCell className="max-w-[400px]">
                <span className="text-primary" title={m.memory}>
                  {truncate(m.memory, 120)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {(m.topics ?? []).slice(0, 3).map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                  {(m.topics ?? []).length > 3 && (
                    <span className="text-[10px] text-muted">
                      +{(m.topics ?? []).length - 3}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="font-dmmono text-muted">
                {m.user_id ? truncate(m.user_id, 12) : '-'}
              </TableCell>
              <TableCell className="text-muted">
                {formatDate(m.updated_at)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onEdit(m)}
                    className="rounded p-1 text-muted transition-colors hover:bg-accent hover:text-primary"
                    title="Edit"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => onDelete(m.memory_id)}
                    className="rounded p-1 text-muted transition-colors hover:bg-red-900/20 hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <PaginationControls pagination={pagination} onPageChange={onPageChange} />
    </div>
  )
}

const MemoryListTable = memo(MemoryListTableInner)
MemoryListTable.displayName = 'MemoryListTable'

export default MemoryListTable

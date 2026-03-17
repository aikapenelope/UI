'use client'

import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Sparkles, ArrowRight } from 'lucide-react'
import type { OptimizeMemoriesResponse } from '@/types/agentOS'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatNumber(n: number): string {
  return n.toLocaleString()
}

function pct(value: number): string {
  return `${value.toFixed(1)}%`
}

// ---------------------------------------------------------------------------
// Stat row
// ---------------------------------------------------------------------------

interface StatRowProps {
  label: string
  before: number
  after: number
  unit?: string
}

function StatRow({ label, before, after, unit = '' }: StatRowProps) {
  const delta = before - after
  const isPositive = delta > 0
  return (
    <div className="flex items-center justify-between py-1.5 text-xs">
      <span className="text-muted">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-dmmono text-muted">
          {formatNumber(before)}
          {unit}
        </span>
        <ArrowRight size={10} className="text-muted" />
        <span className="font-dmmono text-primary">
          {formatNumber(after)}
          {unit}
        </span>
        {isPositive && (
          <span className="font-dmmono text-green-400">
            -{formatNumber(delta)}
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MemoryOptimizeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isOptimizing: boolean
  result: OptimizeMemoriesResponse | null
  onPreview: (userId: string) => void
  onApply: (userId: string) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MemoryOptimizeDialog({
  open,
  onOpenChange,
  isOptimizing,
  result,
  onPreview,
  onApply
}: MemoryOptimizeDialogProps) {
  const [userId, setUserId] = useState('')

  const handlePreview = useCallback(() => {
    const trimmed = userId.trim()
    if (trimmed) onPreview(trimmed)
  }, [userId, onPreview])

  const handleApply = useCallback(() => {
    const trimmed = userId.trim()
    if (trimmed) onApply(trimmed)
  }, [userId, onApply])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-[#111113] sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Sparkles size={14} />
            Optimize Memories
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* User ID input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted">User ID</label>
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID to optimize"
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <p className="text-[10px] text-muted">
              Combines all memories for this user into an optimized summary,
              reducing token usage while preserving key information.
            </p>
          </div>

          {/* Results */}
          {result && (
            <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
              <h4 className="text-xs font-medium text-primary">
                Optimization Results
              </h4>
              <div className="flex flex-col divide-y divide-border">
                <StatRow
                  label="Memories"
                  before={result.memories_before}
                  after={result.memories_after}
                />
                <StatRow
                  label="Tokens"
                  before={result.tokens_before}
                  after={result.tokens_after}
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted">Reduction</span>
                <span className="font-dmmono text-sm font-semibold text-green-400">
                  {pct(result.reduction_percentage)}
                </span>
              </div>
              {result.tokens_saved > 0 && (
                <p className="text-[10px] text-muted">
                  Saved {formatNumber(result.tokens_saved)} tokens
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded border border-border px-4 py-1.5 text-xs text-muted transition-colors hover:bg-accent hover:text-primary"
          >
            Close
          </button>
          <button
            onClick={handlePreview}
            disabled={!userId.trim() || isOptimizing}
            className="rounded border border-border px-4 py-1.5 text-xs text-muted transition-colors hover:bg-accent hover:text-primary disabled:opacity-40"
          >
            {isOptimizing ? 'Running...' : 'Preview'}
          </button>
          <button
            onClick={handleApply}
            disabled={!userId.trim() || isOptimizing || !result}
            className="rounded bg-primary px-4 py-1.5 text-xs font-medium text-primaryAccent transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Apply
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

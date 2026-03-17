'use client'

import { memo, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import type { DayAggregatedMetrics, ModelMetric } from '@/types/agentOS'

// ---------------------------------------------------------------------------
// Aggregate model metrics across all days
// ---------------------------------------------------------------------------

function aggregateModels(metrics: DayAggregatedMetrics[]): ModelMetric[] {
  const map = new Map<string, ModelMetric>()

  for (const day of metrics) {
    for (const m of day.model_metrics) {
      const key = `${m.model_id}::${m.model_provider ?? ''}`
      const existing = map.get(key)
      if (existing) {
        existing.count += m.count
      } else {
        map.set(key, { ...m })
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count)
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface ModelUsageTableProps {
  metrics: DayAggregatedMetrics[]
}

function ModelUsageTableInner({ metrics }: ModelUsageTableProps) {
  const models = useMemo(() => aggregateModels(metrics), [metrics])

  if (models.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-border text-xs text-muted">
        No model usage data
      </div>
    )
  }

  const totalCalls = models.reduce((sum, m) => sum + m.count, 0)

  return (
    <div className="rounded-lg border border-border bg-background">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-xs font-medium uppercase text-muted">
          Model Usage
        </h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-border text-xs hover:bg-transparent">
            <TableHead>Model</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead className="w-[100px] text-right">Calls</TableHead>
            <TableHead className="w-[80px] text-right">Share</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models.map((m) => (
            <TableRow
              key={`${m.model_id}-${m.model_provider ?? ''}`}
              className="border-border text-xs"
            >
              <TableCell className="font-dmmono font-medium">
                {m.model_id}
              </TableCell>
              <TableCell className="text-muted">
                {m.model_provider ?? '-'}
              </TableCell>
              <TableCell className="text-right font-dmmono">
                {m.count.toLocaleString()}
              </TableCell>
              <TableCell className="text-right text-muted">
                {totalCalls > 0
                  ? `${((m.count / totalCalls) * 100).toFixed(1)}%`
                  : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

const ModelUsageTable = memo(ModelUsageTableInner)
ModelUsageTable.displayName = 'ModelUsageTable'

export default ModelUsageTable

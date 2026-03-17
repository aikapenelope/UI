'use client'

import { memo, useMemo } from 'react'
import type { DayAggregatedMetrics } from '@/types/agentOS'

// ---------------------------------------------------------------------------
// Shared chart constants
// ---------------------------------------------------------------------------

const CHART_H = 160
const CHART_PAD = { top: 8, right: 8, bottom: 24, left: 48 }

function formatShortDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

// ---------------------------------------------------------------------------
// Generic bar chart (SVG)
// ---------------------------------------------------------------------------

interface BarChartProps {
  title: string
  data: { label: string; value: number }[]
  color: string
}

function BarChart({ title, data, color }: BarChartProps) {
  const maxVal = Math.max(...data.map((d) => d.value), 1)
  const innerW = 600 - CHART_PAD.left - CHART_PAD.right
  const innerH = CHART_H - CHART_PAD.top - CHART_PAD.bottom
  const barW = Math.max(4, innerW / data.length - 2)

  // Y-axis ticks (3 levels)
  const ticks = [0, Math.round(maxVal / 2), maxVal]

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4">
      <h3 className="text-xs font-medium uppercase text-muted">{title}</h3>
      <svg
        viewBox={`0 0 600 ${CHART_H}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Y-axis ticks */}
        {ticks.map((tick) => {
          const y = CHART_PAD.top + innerH - (tick / maxVal) * innerH
          return (
            <g key={tick}>
              <line
                x1={CHART_PAD.left}
                x2={600 - CHART_PAD.right}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
              />
              <text
                x={CHART_PAD.left - 6}
                y={y + 3}
                textAnchor="end"
                className="fill-muted text-[9px]"
              >
                {formatNumber(tick)}
              </text>
            </g>
          )
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const x = CHART_PAD.left + (i / data.length) * innerW + 1
          const barH = (d.value / maxVal) * innerH
          const y = CHART_PAD.top + innerH - barH
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={2}
                fill={color}
                opacity={0.8}
              >
                <title>
                  {d.label}: {d.value.toLocaleString()}
                </title>
              </rect>
              {/* X-axis label (show every Nth to avoid overlap) */}
              {(i % Math.ceil(data.length / 8) === 0 ||
                i === data.length - 1) && (
                <text
                  x={x + barW / 2}
                  y={CHART_H - 4}
                  textAnchor="middle"
                  className="fill-muted text-[8px]"
                >
                  {d.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Runs per day chart
// ---------------------------------------------------------------------------

interface MetricsChartsProps {
  metrics: DayAggregatedMetrics[]
}

function MetricsChartsInner({ metrics }: MetricsChartsProps) {
  const sorted = useMemo(
    () => [...metrics].sort((a, b) => a.date.localeCompare(b.date)),
    [metrics]
  )

  const runsData = useMemo(
    () =>
      sorted.map((m) => ({
        label: formatShortDate(m.date),
        value: m.agent_runs_count + m.team_runs_count + m.workflow_runs_count
      })),
    [sorted]
  )

  const tokensData = useMemo(
    () =>
      sorted.map((m) => ({
        label: formatShortDate(m.date),
        value: m.token_metrics.total_tokens ?? 0
      })),
    [sorted]
  )

  if (sorted.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-border text-xs text-muted">
        No data to chart
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <BarChart title="Runs per Day" data={runsData} color="#3b82f6" />
      <BarChart title="Tokens per Day" data={tokensData} color="#22c55e" />
    </div>
  )
}

const MetricsCharts = memo(MetricsChartsInner)
MetricsCharts.displayName = 'MetricsCharts'

export default MetricsCharts

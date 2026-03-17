'use client'

import { memo, useMemo } from 'react'
import { Bot, Users, Zap, Coins } from 'lucide-react'
import type { DayAggregatedMetrics } from '@/types/agentOS'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
}

function StatCard({ label, value, sub, icon }: StatCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4">
      <div className="flex items-center gap-2 text-muted">
        {icon}
        <span className="text-xs font-medium uppercase">{label}</span>
      </div>
      <p className="text-2xl font-semibold tracking-tight text-primary">
        {value}
      </p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface MetricsSummaryCardsProps {
  metrics: DayAggregatedMetrics[]
}

function MetricsSummaryCardsInner({ metrics }: MetricsSummaryCardsProps) {
  const totals = useMemo(() => {
    let runs = 0
    let sessions = 0
    let users = 0
    let inputTokens = 0
    let outputTokens = 0
    let totalTokens = 0

    for (const day of metrics) {
      runs +=
        day.agent_runs_count + day.team_runs_count + day.workflow_runs_count
      sessions +=
        day.agent_sessions_count +
        day.team_sessions_count +
        day.workflow_sessions_count
      users += day.users_count
      inputTokens += day.token_metrics.input_tokens ?? 0
      outputTokens += day.token_metrics.output_tokens ?? 0
      totalTokens += day.token_metrics.total_tokens ?? 0
    }

    return { runs, sessions, users, inputTokens, outputTokens, totalTokens }
  }, [metrics])

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label="Total Runs"
        value={formatNumber(totals.runs)}
        sub={`${metrics.length} days`}
        icon={<Zap size={14} />}
      />
      <StatCard
        label="Sessions"
        value={formatNumber(totals.sessions)}
        icon={<Bot size={14} />}
      />
      <StatCard
        label="Unique Users"
        value={formatNumber(totals.users)}
        icon={<Users size={14} />}
      />
      <StatCard
        label="Tokens"
        value={formatNumber(totals.totalTokens)}
        sub={`${formatNumber(totals.inputTokens)} in / ${formatNumber(totals.outputTokens)} out`}
        icon={<Coins size={14} />}
      />
    </div>
  )
}

const MetricsSummaryCards = memo(MetricsSummaryCardsInner)
MetricsSummaryCards.displayName = 'MetricsSummaryCards'

export default MetricsSummaryCards

'use client'

import { useCallback, useEffect, useState } from 'react'
import { useStore } from '@/store'
import { getMetricsAPI } from '@/api/metrics'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { DayAggregatedMetrics } from '@/types/agentOS'
import {
  CreditCard,
  Loader2,
  MessageSquare,
  RefreshCw,
  Zap
} from 'lucide-react'

export default function BillingPage() {
  const endpoint = useStore((s) => s.selectedEndpoint)
  const authToken = useStore((s) => s.authToken)

  const [metrics, setMetrics] = useState<DayAggregatedMetrics[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await getMetricsAPI(endpoint, undefined, authToken || undefined)
    setMetrics(res?.metrics ?? [])
    setLoading(false)
  }, [endpoint, authToken])

  useEffect(() => {
    void load()
  }, [load])

  // Aggregate totals across all days
  const totals = metrics.reduce(
    (acc, day) => {
      acc.agentRuns += day.agent_runs_count
      acc.agentSessions += day.agent_sessions_count
      acc.teamRuns += day.team_runs_count
      acc.teamSessions += day.team_sessions_count
      acc.workflowRuns += day.workflow_runs_count
      acc.workflowSessions += day.workflow_sessions_count
      acc.users += day.users_count
      acc.inputTokens += day.token_metrics.input_tokens ?? 0
      acc.outputTokens += day.token_metrics.output_tokens ?? 0
      acc.totalTokens += day.token_metrics.total_tokens ?? 0
      return acc
    },
    {
      agentRuns: 0,
      agentSessions: 0,
      teamRuns: 0,
      teamSessions: 0,
      workflowRuns: 0,
      workflowSessions: 0,
      users: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0
    }
  )

  const totalRuns = totals.agentRuns + totals.teamRuns + totals.workflowRuns
  const totalSessions =
    totals.agentSessions + totals.teamSessions + totals.workflowSessions

  if (loading) {
    return (
      <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
        <Loader2 size={16} className="mr-2 animate-spin" />
        Loading usage data...
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto max-w-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-accent">
              <CreditCard size={18} className="text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-primary">Billing</h1>
              <p className="text-muted-foreground text-xs">
                Usage summary for this AgentOS instance
              </p>
            </div>
          </div>
          <button
            onClick={() => void load()}
            className="text-muted-foreground rounded border border-border p-1.5 hover:bg-accent hover:text-primary"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        <Separator className="my-4" />

        {/* Top-level stats */}
        <div className="grid grid-cols-3 gap-3">
          <BigStatCard
            icon={<Zap size={16} />}
            label="Total Runs"
            value={totalRuns.toLocaleString()}
          />
          <BigStatCard
            icon={<MessageSquare size={16} />}
            label="Total Sessions"
            value={totalSessions.toLocaleString()}
          />
          <BigStatCard
            icon={<CreditCard size={16} />}
            label="Total Tokens"
            value={totals.totalTokens.toLocaleString()}
          />
        </div>

        <Separator className="my-4" />

        {/* Token breakdown */}
        <h2 className="mb-3 text-xs font-semibold text-primary">Token Usage</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Input Tokens"
            value={totals.inputTokens.toLocaleString()}
          />
          <StatCard
            label="Output Tokens"
            value={totals.outputTokens.toLocaleString()}
          />
        </div>

        <Separator className="my-4" />

        {/* Runs breakdown */}
        <h2 className="mb-3 text-xs font-semibold text-primary">
          Runs by Type
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Agent Runs"
            value={totals.agentRuns.toLocaleString()}
          />
          <StatCard
            label="Team Runs"
            value={totals.teamRuns.toLocaleString()}
          />
          <StatCard
            label="Workflow Runs"
            value={totals.workflowRuns.toLocaleString()}
          />
        </div>

        <Separator className="my-4" />

        {/* Sessions breakdown */}
        <h2 className="mb-3 text-xs font-semibold text-primary">
          Sessions by Type
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Agent Sessions"
            value={totals.agentSessions.toLocaleString()}
          />
          <StatCard
            label="Team Sessions"
            value={totals.teamSessions.toLocaleString()}
          />
          <StatCard
            label="Workflow Sessions"
            value={totals.workflowSessions.toLocaleString()}
          />
        </div>

        <Separator className="my-4" />

        {/* Users */}
        <div className="flex items-center justify-between rounded border border-border px-3 py-2">
          <span className="text-muted-foreground text-xs">Unique Users</span>
          <span className="text-xs font-medium text-primary">
            {totals.users.toLocaleString()}
          </span>
        </div>

        <Separator className="my-4" />

        {/* Period info */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-[10px]">
            Data from {metrics.length} day{metrics.length !== 1 ? 's' : ''}
          </span>
          <Badge variant="outline" className="text-[10px] font-normal">
            Self-hosted (no billing API)
          </Badge>
        </div>

        {/* Note */}
        <div className="mt-3 rounded border border-border bg-accent/30 px-3 py-2">
          <p className="text-muted-foreground text-[10px]">
            Billing management (plans, invoices, payment methods) is available
            on Agno Cloud. This self-hosted instance shows aggregated usage
            metrics from the local database.
          </p>
        </div>
      </div>
    </ScrollArea>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function BigStatCard({
  icon,
  label,
  value
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded border border-border px-3 py-3">
      <div className="text-muted-foreground flex items-center gap-1.5">
        {icon}
      </div>
      <p className="mt-1 text-lg font-semibold text-primary">{value}</p>
      <p className="text-muted-foreground text-[10px]">{label}</p>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-border px-3 py-2">
      <p className="text-muted-foreground text-[10px]">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-primary">{value}</p>
    </div>
  )
}

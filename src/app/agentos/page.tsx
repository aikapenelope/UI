'use client'

import { useCallback, useEffect, useState } from 'react'
import { useStore } from '@/store'
import { apiGet } from '@/api/client'
import { APIRoutes } from '@/api/routes'
import PageHeader from '@/components/shared/PageHeader'
import PageSkeleton from '@/components/shared/PageSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type {
  APIInfoResponse,
  OSConfigResponse,
  OSModel
} from '@/types/agentOS'
import {
  Bot,
  Cpu,
  Database,
  GitBranch,
  Globe,
  Server,
  Users,
  Zap
} from 'lucide-react'

export default function AgentOSPage() {
  const endpoint = useStore((s) => s.selectedEndpoint)
  const authToken = useStore((s) => s.authToken)

  const [apiInfo, setApiInfo] = useState<APIInfoResponse | null>(null)
  const [config, setConfig] = useState<OSConfigResponse | null>(null)
  const [models, setModels] = useState<OSModel[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const token = authToken || undefined
    const [info, cfg, mdls] = await Promise.all([
      apiGet<APIInfoResponse>(APIRoutes.APIInfo(endpoint), token),
      apiGet<OSConfigResponse>(APIRoutes.Config(endpoint), token),
      apiGet<OSModel[]>(APIRoutes.Models(endpoint), token)
    ])
    setApiInfo(info)
    setConfig(cfg)
    setModels(mdls ?? [])
    setLoading(false)
  }, [endpoint, authToken])

  useEffect(() => {
    void load()
  }, [load])

  const agentCount = config?.agents?.length ?? 0
  const teamCount = config?.teams?.length ?? 0
  const workflowCount = config?.workflows?.length ?? 0
  const modelCount = models.length
  const dbCount = config?.databases?.length ?? 0
  const ifaceCount = config?.interfaces?.length ?? 0

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={config?.name || apiInfo?.name || 'AgentOS'}
        subtitle={config?.description || 'Enterprise Agent Operating System'}
        loading={loading}
        onRefresh={() => void load()}
      />

      {loading ? (
        <PageSkeleton rows={10} />
      ) : (
        <ScrollArea className="flex-1">
          <div className="mx-auto max-w-4xl p-6">
            {/* Hero stat cards */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard
                icon={<Bot size={22} />}
                label="Agents"
                value={agentCount}
                color="brand"
              />
              <StatCard
                icon={<Users size={22} />}
                label="Teams"
                value={teamCount}
                color="blue"
              />
              <StatCard
                icon={<GitBranch size={22} />}
                label="Workflows"
                value={workflowCount}
                color="amber"
              />
              <StatCard
                icon={<Cpu size={22} />}
                label="Models"
                value={modelCount}
                color="positive"
              />
            </div>

            {/* System info row */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <InfoCard
                icon={<Server size={14} />}
                label="OS ID"
                value={config?.os_id || apiInfo?.id || '\u2014'}
              />
              <InfoCard
                icon={<Globe size={14} />}
                label="Version"
                value={apiInfo?.version || '\u2014'}
              />
              <InfoCard
                icon={<Database size={14} />}
                label="Database"
                value={config?.os_database || '\u2014'}
              />
            </div>

            <Separator className="my-5" />

            {/* Agents section */}
            <SectionHeader
              icon={<Bot size={14} />}
              title="Agents"
              count={agentCount}
            />
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {config?.agents?.map((a) => (
                <div
                  key={a.id}
                  className="glass glass-hover flex items-center gap-3 rounded-xl px-3 py-2.5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <Bot size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-medium text-primary">
                      {a.name || a.id}
                    </span>
                    {a.description && (
                      <p className="text-muted-foreground truncate text-[10px]">
                        {a.description}
                      </p>
                    )}
                  </div>
                  {a.db_id && (
                    <span className="chip-neutral rounded-full px-2 py-0.5 text-[9px]">
                      db: {a.db_id}
                    </span>
                  )}
                </div>
              ))}
              {agentCount === 0 && (
                <EmptyState
                  icon={<Bot size={18} />}
                  title="No agents registered"
                  description="Register agents in your AgentOS configuration."
                />
              )}
            </div>

            <Separator className="my-5" />

            {/* Teams section */}
            <SectionHeader
              icon={<Users size={14} />}
              title="Teams"
              count={teamCount}
            />
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {config?.teams?.map((t) => (
                <div
                  key={t.id}
                  className="glass glass-hover flex items-center gap-3 rounded-xl px-3 py-2.5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
                    <Users size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-medium text-primary">
                      {t.name || t.id}
                    </span>
                    {t.description && (
                      <p className="text-muted-foreground truncate text-[10px]">
                        {t.description}
                      </p>
                    )}
                  </div>
                  {t.mode && (
                    <span className="chip-info rounded-full px-2 py-0.5 text-[9px]">
                      {t.mode}
                    </span>
                  )}
                </div>
              ))}
              {teamCount === 0 && (
                <EmptyState
                  icon={<Users size={18} />}
                  title="No teams registered"
                  description="Register teams in your AgentOS configuration."
                />
              )}
            </div>

            <Separator className="my-5" />

            {/* Workflows section */}
            <SectionHeader
              icon={<GitBranch size={14} />}
              title="Workflows"
              count={workflowCount}
            />
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {config?.workflows?.map((w) => (
                <div
                  key={w.id}
                  className="glass glass-hover flex items-center gap-3 rounded-xl px-3 py-2.5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
                    <GitBranch size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-medium text-primary">
                      {w.name || w.id}
                    </span>
                    {w.description && (
                      <p className="text-muted-foreground truncate text-[10px]">
                        {w.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {w.is_component && (
                      <span className="chip-neutral rounded-full px-2 py-0.5 text-[9px]">
                        component
                      </span>
                    )}
                    {w.stage && (
                      <span className="chip-warning rounded-full px-2 py-0.5 text-[9px]">
                        {w.stage}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {workflowCount === 0 && (
                <EmptyState
                  icon={<GitBranch size={18} />}
                  title="No workflows registered"
                  description="Register workflows in your AgentOS configuration."
                />
              )}
            </div>

            <Separator className="my-5" />

            {/* Quick stats row */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <MiniStat
                icon={<Database size={13} />}
                label="Databases"
                value={dbCount}
              />
              <MiniStat
                icon={<Cpu size={13} />}
                label="Models"
                value={modelCount}
              />
              <MiniStat
                icon={<Globe size={13} />}
                label="Interfaces"
                value={ifaceCount}
              />
              <MiniStat
                icon={<Zap size={13} />}
                label="Total Components"
                value={agentCount + teamCount + workflowCount}
              />
            </div>

            {/* Models list */}
            {modelCount > 0 && (
              <>
                <Separator className="my-5" />
                <SectionHeader
                  icon={<Cpu size={14} />}
                  title="Available Models"
                  count={modelCount}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {models.map((m) => (
                    <span
                      key={`${String(m.provider)}-${String(m.id)}`}
                      className="chip-neutral rounded-full px-2.5 py-1 text-[10px]"
                    >
                      {m.provider ? `${m.provider} / ` : ''}
                      {m.id || '\u2014'}
                    </span>
                  ))}
                </div>
              </>
            )}

            {/* Interfaces list */}
            {ifaceCount > 0 && (
              <>
                <Separator className="my-5" />
                <SectionHeader
                  icon={<Globe size={14} />}
                  title="Interfaces"
                  count={ifaceCount}
                />
                <div className="mt-2 grid gap-2">
                  {config?.interfaces?.map((iface) => (
                    <div
                      key={iface.route}
                      className="glass flex items-center justify-between rounded-xl px-3 py-2"
                    >
                      <span className="font-mono text-[11px] text-primary">
                        {iface.route}
                      </span>
                      <div className="flex gap-1.5">
                        <span className="chip-info rounded-full px-2 py-0.5 text-[9px]">
                          {iface.type}
                        </span>
                        <span className="chip-neutral rounded-full px-2 py-0.5 text-[9px]">
                          v{iface.version}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function StatCard({
  icon,
  label,
  value,
  color
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: 'brand' | 'blue' | 'amber' | 'positive'
}) {
  const glowClass = {
    brand: 'glow-brand',
    blue: 'glow-blue',
    amber: 'glow-amber',
    positive: 'glow-positive'
  }[color]

  const iconBg = {
    brand: 'bg-brand/10 text-brand',
    blue: 'bg-info/10 text-info',
    amber: 'bg-warning/10 text-warning',
    positive: 'bg-positive/10 text-positive'
  }[color]

  return (
    <div className={`stat-card rounded-xl p-4 ${glowClass}`}>
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}
      >
        {icon}
      </div>
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-muted-foreground text-[11px]">{label}</p>
    </div>
  )
}

function InfoCard({
  icon,
  label,
  value
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="glass rounded-xl px-3 py-2">
      <div className="text-muted-foreground flex items-center gap-1.5 text-[10px]">
        {icon}
        {label}
      </div>
      <p className="mt-0.5 truncate text-xs font-medium text-primary">
        {value}
      </p>
    </div>
  )
}

function MiniStat({
  icon,
  label,
  value
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="glass flex items-center gap-2.5 rounded-xl px-3 py-2.5">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-primary">{value}</p>
        <p className="text-muted-foreground text-[10px]">{label}</p>
      </div>
    </div>
  )
}

function SectionHeader({
  icon,
  title,
  count
}: {
  icon: React.ReactNode
  title: string
  count: number
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <h2 className="text-xs font-semibold text-primary">{title}</h2>
      <Badge variant="secondary" className="text-[10px] font-normal">
        {count}
      </Badge>
    </div>
  )
}

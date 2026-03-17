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
  Users
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
          <div className="mx-auto max-w-3xl p-6">
            {/* API Info */}
            <div className="grid grid-cols-3 gap-3">
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

            <Separator className="my-4" />

            {/* Agents */}
            <SectionHeader
              icon={<Bot size={14} />}
              title="Agents"
              count={config?.agents?.length ?? 0}
            />
            <div className="mt-2 grid gap-2">
              {config?.agents?.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded border border-border px-3 py-2"
                >
                  <div>
                    <span className="text-xs font-medium text-primary">
                      {a.name || a.id}
                    </span>
                    {a.description && (
                      <p className="text-muted-foreground max-w-md truncate text-[10px]">
                        {a.description}
                      </p>
                    )}
                  </div>
                  {a.db_id && (
                    <Badge variant="outline" className="text-[9px] font-normal">
                      db: {a.db_id}
                    </Badge>
                  )}
                </div>
              ))}
              {(!config?.agents || config.agents.length === 0) && (
                <EmptyState
                  icon={<Bot size={18} />}
                  title="No agents registered"
                  description="Register agents in your AgentOS configuration."
                />
              )}
            </div>

            <Separator className="my-4" />

            {/* Teams */}
            <SectionHeader
              icon={<Users size={14} />}
              title="Teams"
              count={config?.teams?.length ?? 0}
            />
            <div className="mt-2 grid gap-2">
              {config?.teams?.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded border border-border px-3 py-2"
                >
                  <div>
                    <span className="text-xs font-medium text-primary">
                      {t.name || t.id}
                    </span>
                    {t.description && (
                      <p className="text-muted-foreground max-w-md truncate text-[10px]">
                        {t.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {t.mode && (
                      <Badge
                        variant="secondary"
                        className="text-[9px] font-normal"
                      >
                        {t.mode}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {(!config?.teams || config.teams.length === 0) && (
                <EmptyState
                  icon={<Users size={18} />}
                  title="No teams registered"
                  description="Register teams in your AgentOS configuration."
                />
              )}
            </div>

            <Separator className="my-4" />

            {/* Workflows */}
            <SectionHeader
              icon={<GitBranch size={14} />}
              title="Workflows"
              count={config?.workflows?.length ?? 0}
            />
            <div className="mt-2 grid gap-2">
              {config?.workflows?.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between rounded border border-border px-3 py-2"
                >
                  <div>
                    <span className="text-xs font-medium text-primary">
                      {w.name || w.id}
                    </span>
                    {w.description && (
                      <p className="text-muted-foreground max-w-md truncate text-[10px]">
                        {w.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {w.is_component && (
                      <Badge
                        variant="outline"
                        className="text-[9px] font-normal"
                      >
                        component
                      </Badge>
                    )}
                    {w.stage && (
                      <Badge
                        variant="secondary"
                        className="text-[9px] font-normal"
                      >
                        {w.stage}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {(!config?.workflows || config.workflows.length === 0) && (
                <EmptyState
                  icon={<GitBranch size={18} />}
                  title="No workflows registered"
                  description="Register workflows in your AgentOS configuration."
                />
              )}
            </div>

            <Separator className="my-4" />

            {/* Databases */}
            <SectionHeader
              icon={<Database size={14} />}
              title="Databases"
              count={config?.databases?.length ?? 0}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {config?.databases?.map((db) => (
                <Badge
                  key={db}
                  variant="outline"
                  className="text-[10px] font-normal"
                >
                  {db}
                </Badge>
              ))}
              {(!config?.databases || config.databases.length === 0) && (
                <p className="text-muted-foreground text-xs">No databases</p>
              )}
            </div>

            <Separator className="my-4" />

            {/* Models */}
            <SectionHeader
              icon={<Cpu size={14} />}
              title="Available Models"
              count={models.length}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {models.map((m) => (
                <Badge
                  key={`${String(m.provider)}-${String(m.id)}`}
                  variant="outline"
                  className="text-[10px] font-normal"
                >
                  {m.provider ? `${m.provider} / ` : ''}
                  {m.id || '\u2014'}
                </Badge>
              ))}
              {models.length === 0 && (
                <p className="text-muted-foreground text-xs">
                  No models available
                </p>
              )}
            </div>

            <Separator className="my-4" />

            {/* Interfaces */}
            <SectionHeader
              icon={<Globe size={14} />}
              title="Interfaces"
              count={config?.interfaces?.length ?? 0}
            />
            <div className="mt-2 grid gap-2">
              {config?.interfaces?.map((iface) => (
                <div
                  key={iface.route}
                  className="flex items-center justify-between rounded border border-border px-3 py-2"
                >
                  <span className="font-mono text-[11px] text-primary">
                    {iface.route}
                  </span>
                  <div className="flex gap-1">
                    <Badge
                      variant="secondary"
                      className="text-[9px] font-normal"
                    >
                      {iface.type}
                    </Badge>
                    <Badge variant="outline" className="text-[9px] font-normal">
                      v{iface.version}
                    </Badge>
                  </div>
                </div>
              ))}
              {(!config?.interfaces || config.interfaces.length === 0) && (
                <p className="text-muted-foreground text-xs">No interfaces</p>
              )}
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
    <div className="rounded border border-border px-3 py-2">
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

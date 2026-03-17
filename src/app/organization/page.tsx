'use client'

import { useCallback, useEffect, useState } from 'react'
import { useStore } from '@/store'
import { apiGet } from '@/api/client'
import { APIRoutes } from '@/api/routes'
import PageHeader from '@/components/shared/PageHeader'
import PageSkeleton from '@/components/shared/PageSkeleton'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { APIInfoResponse, OSConfigResponse } from '@/types/agentOS'
import { Bot, GitBranch, Users } from 'lucide-react'

export default function OrganizationPage() {
  const endpoint = useStore((s) => s.selectedEndpoint)
  const authToken = useStore((s) => s.authToken)

  const [apiInfo, setApiInfo] = useState<APIInfoResponse | null>(null)
  const [config, setConfig] = useState<OSConfigResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const token = authToken || undefined
    const [info, cfg] = await Promise.all([
      apiGet<APIInfoResponse>(APIRoutes.APIInfo(endpoint), token),
      apiGet<OSConfigResponse>(APIRoutes.Config(endpoint), token)
    ])
    setApiInfo(info)
    setConfig(cfg)
    setLoading(false)
  }, [endpoint, authToken])

  useEffect(() => {
    void load()
  }, [load])

  const agentCount = config?.agents?.length ?? 0
  const teamCount = config?.teams?.length ?? 0
  const workflowCount = config?.workflows?.length ?? 0

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Organization"
        subtitle={
          config?.name || apiInfo?.name || 'Self-hosted AgentOS instance'
        }
        loading={loading}
        onRefresh={() => void load()}
      />

      {loading ? (
        <PageSkeleton rows={8} />
      ) : (
        <ScrollArea className="flex-1">
          <div className="mx-auto max-w-2xl p-6">
            {/* Instance info */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard
                label="OS ID"
                value={config?.os_id || apiInfo?.id || '\u2014'}
              />
              <StatCard label="Version" value={apiInfo?.version || '\u2014'} />
              <StatCard
                label="Components"
                value={String(agentCount + teamCount + workflowCount)}
              />
            </div>

            <Separator className="my-4" />

            {/* Summary counts */}
            <h2 className="mb-3 text-xs font-semibold text-primary">
              Registered Components
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <CountCard
                icon={<Bot size={14} />}
                label="Agents"
                count={agentCount}
              />
              <CountCard
                icon={<Users size={14} />}
                label="Teams"
                count={teamCount}
              />
              <CountCard
                icon={<GitBranch size={14} />}
                label="Workflows"
                count={workflowCount}
              />
            </div>

            <Separator className="my-4" />

            {/* Agent list */}
            {agentCount > 0 && (
              <>
                <h3 className="text-muted-foreground mb-2 text-[11px] font-medium">
                  Agents
                </h3>
                <div className="flex flex-col gap-1">
                  {config?.agents?.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between rounded border border-border px-3 py-1.5"
                    >
                      <span className="text-xs text-primary">
                        {a.name || a.id}
                      </span>
                      {a.description && (
                        <span className="text-muted-foreground max-w-[200px] truncate text-[10px]">
                          {a.description}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
              </>
            )}

            {/* Team list */}
            {teamCount > 0 && (
              <>
                <h3 className="text-muted-foreground mb-2 text-[11px] font-medium">
                  Teams
                </h3>
                <div className="flex flex-col gap-1">
                  {config?.teams?.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between rounded border border-border px-3 py-1.5"
                    >
                      <span className="text-xs text-primary">
                        {t.name || t.id}
                      </span>
                      {t.mode && (
                        <Badge
                          variant="secondary"
                          className="text-[9px] font-normal"
                        >
                          {t.mode}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
              </>
            )}

            {/* Workflow list */}
            {workflowCount > 0 && (
              <>
                <h3 className="text-muted-foreground mb-2 text-[11px] font-medium">
                  Workflows
                </h3>
                <div className="flex flex-col gap-1">
                  {config?.workflows?.map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between rounded border border-border px-3 py-1.5"
                    >
                      <span className="text-xs text-primary">
                        {w.name || w.id}
                      </span>
                      {w.stage && (
                        <Badge
                          variant="outline"
                          className="text-[9px] font-normal"
                        >
                          {w.stage}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
              </>
            )}

            {/* Note */}
            <div className="rounded border border-border bg-accent/30 px-3 py-2">
              <p className="text-muted-foreground text-[10px]">
                Organization management (members, roles, permissions) is
                available on Agno Cloud. This self-hosted instance shows the OS
                configuration and registered components.
              </p>
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-border px-3 py-2">
      <p className="text-muted-foreground text-[10px]">{label}</p>
      <p className="mt-0.5 truncate text-xs font-medium text-primary">
        {value}
      </p>
    </div>
  )
}

function CountCard({
  icon,
  label,
  count
}: {
  icon: React.ReactNode
  label: string
  count: number
}) {
  return (
    <div className="flex items-center gap-2 rounded border border-border px-3 py-2">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-primary">{count}</p>
        <p className="text-muted-foreground text-[10px]">{label}</p>
      </div>
    </div>
  )
}

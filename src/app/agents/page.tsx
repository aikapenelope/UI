'use client'

import { useCallback, useEffect, useState } from 'react'
import { useStore } from '@/store'
import { getAgentsAPI } from '@/api/os'
import AgentDetailPanel from '@/components/agents/AgentDetailPanel'
import PageHeader from '@/components/shared/PageHeader'
import PageSkeleton from '@/components/shared/PageSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import type { AgentDetails } from '@/types/os'
import {
  BookOpen,
  Bot,
  Brain,
  Cpu,
  Grid3X3,
  LayoutList,
  Lightbulb,
  Wrench
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Agent card (glassmorphism grid view)
// ---------------------------------------------------------------------------

function AgentCard({
  agent,
  isSelected,
  onClick
}: {
  agent: AgentDetails
  isSelected: boolean
  onClick: () => void
}) {
  const toolCount = agent.tools?.tools?.length ?? 0

  return (
    <button
      onClick={onClick}
      className={`glass glass-hover group flex flex-col gap-3 rounded-xl p-4 text-left transition-all ${
        isSelected ? 'glass-active glow-brand' : ''
      }`}
    >
      {/* Icon + name */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <Bot size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-primary">
            {agent.name || agent.id}
          </p>
          {agent.description && (
            <p className="text-muted-foreground mt-0.5 line-clamp-2 text-[11px]">
              {agent.description}
            </p>
          )}
        </div>
      </div>

      {/* Model */}
      {agent.model && (
        <div className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
          <Cpu size={11} className="shrink-0" />
          <span className="truncate">
            {agent.model.provider ? `${agent.model.provider} / ` : ''}
            {agent.model.model || agent.model.name || '\u2014'}
          </span>
        </div>
      )}

      {/* Capability chips */}
      <div className="flex flex-wrap gap-1.5">
        {toolCount > 0 && (
          <span className="chip-info flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]">
            <Wrench size={9} />
            {toolCount} tools
          </span>
        )}
        {agent.knowledge && (
          <span className="chip-brand flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]">
            <BookOpen size={9} />
            Knowledge
          </span>
        )}
        {agent.memory && (
          <span className="chip-success flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]">
            <Brain size={9} />
            Memory
          </span>
        )}
        {agent.reasoning?.reasoning && (
          <span className="chip-warning flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]">
            <Lightbulb size={9} />
            CoT
          </span>
        )}
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// View toggle button
// ---------------------------------------------------------------------------

function ViewToggle({
  view,
  onChange
}: {
  view: 'grid' | 'table'
  onChange: (v: 'grid' | 'table') => void
}) {
  return (
    <div className="flex items-center rounded-lg border border-border">
      <button
        onClick={() => onChange('grid')}
        className={`rounded-l-lg p-1.5 transition-colors ${
          view === 'grid'
            ? 'bg-accent text-primary'
            : 'text-muted-foreground hover:text-primary'
        }`}
        title="Grid view"
      >
        <Grid3X3 size={14} />
      </button>
      <button
        onClick={() => onChange('table')}
        className={`rounded-r-lg p-1.5 transition-colors ${
          view === 'table'
            ? 'bg-accent text-primary'
            : 'text-muted-foreground hover:text-primary'
        }`}
        title="Table view"
      >
        <LayoutList size={14} />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AgentsPage() {
  const endpoint = useStore((s) => s.selectedEndpoint)
  const authToken = useStore((s) => s.authToken)

  const [agents, setAgents] = useState<AgentDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<AgentDetails | null>(null)
  const [view, setView] = useState<'grid' | 'table'>('grid')

  const fetchAgents = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAgentsAPI(endpoint, authToken || undefined)
      setAgents(data)
      if (selected) {
        const updated = data.find((a) => a.id === selected.id)
        setSelected(updated ?? null)
      }
    } finally {
      setLoading(false)
    }
  }, [endpoint, authToken, selected])

  useEffect(() => {
    void fetchAgents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, authToken])

  return (
    <div className="flex h-full">
      {/* Left: agent list */}
      <div className="flex flex-1 flex-col overflow-hidden border-r border-border">
        <PageHeader
          title="Agents"
          subtitle={`${agents.length} agent${agents.length !== 1 ? 's' : ''} registered`}
          count={agents.length}
          loading={loading}
          onRefresh={() => void fetchAgents()}
          actions={<ViewToggle view={view} onChange={setView} />}
        />

        <ScrollArea className="flex-1">
          {loading && agents.length === 0 ? (
            <PageSkeleton rows={6} />
          ) : agents.length === 0 ? (
            <EmptyState
              icon={<Bot size={20} />}
              title="No agents found"
              description="Make sure your AgentOS endpoint is running and has agents registered."
            />
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  isSelected={selected?.id === agent.id}
                  onClick={() => setSelected(agent)}
                />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-[11px] font-medium">
                    Name
                  </TableHead>
                  <TableHead className="text-muted-foreground text-[11px] font-medium">
                    Model
                  </TableHead>
                  <TableHead className="text-muted-foreground text-[11px] font-medium">
                    Capabilities
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => {
                  const toolCount = agent.tools?.tools?.length ?? 0
                  const isSelected = selected?.id === agent.id
                  return (
                    <TableRow
                      key={agent.id}
                      onClick={() => setSelected(agent)}
                      className={`cursor-pointer border-border ${
                        isSelected ? 'bg-accent/50' : 'hover:bg-accent/30'
                      }`}
                    >
                      <TableCell className="py-2">
                        <div className="text-xs font-medium text-primary">
                          {agent.name || agent.id}
                        </div>
                        {agent.description && (
                          <div className="text-muted-foreground mt-0.5 max-w-[300px] truncate text-[10px]">
                            {agent.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-2">
                        {agent.model ? (
                          <div className="text-muted-foreground flex items-center gap-1 text-[11px]">
                            <Cpu size={10} />
                            <span>
                              {agent.model.provider
                                ? `${agent.model.provider} / `
                                : ''}
                              {agent.model.model ||
                                agent.model.name ||
                                '\u2014'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">
                            {'\u2014'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex flex-wrap gap-1">
                          {toolCount > 0 && (
                            <span className="chip-info rounded-full px-1.5 py-0.5 text-[9px]">
                              {toolCount} tools
                            </span>
                          )}
                          {agent.knowledge && (
                            <span className="chip-brand rounded-full px-1.5 py-0.5 text-[9px]">
                              KB
                            </span>
                          )}
                          {agent.memory && (
                            <span className="chip-success rounded-full px-1.5 py-0.5 text-[9px]">
                              Mem
                            </span>
                          )}
                          {agent.reasoning?.reasoning && (
                            <span className="chip-warning rounded-full px-1.5 py-0.5 text-[9px]">
                              CoT
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </div>

      {/* Right: detail panel */}
      <div className="hidden w-[340px] shrink-0 flex-col overflow-hidden lg:flex">
        {selected ? (
          <AgentDetailPanel agent={selected} />
        ) : (
          <EmptyState
            icon={<Bot size={20} />}
            title="Select an agent"
            description="Click on an agent to view its details."
          />
        )}
      </div>

      <Separator orientation="vertical" className="hidden lg:block" />
    </div>
  )
}

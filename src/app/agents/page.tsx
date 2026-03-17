'use client'

import { useCallback, useEffect, useState } from 'react'
import { useStore } from '@/store'
import { getAgentsAPI } from '@/api/os'
import AgentDetailPanel from '@/components/agents/AgentDetailPanel'
import PageHeader from '@/components/shared/PageHeader'
import PageSkeleton from '@/components/shared/PageSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import { Badge } from '@/components/ui/badge'
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
import { BookOpen, Bot, Brain, Cpu, Lightbulb, Wrench } from 'lucide-react'

export default function AgentsPage() {
  const endpoint = useStore((s) => s.selectedEndpoint)
  const authToken = useStore((s) => s.authToken)

  const [agents, setAgents] = useState<AgentDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<AgentDetails | null>(null)

  const fetchAgents = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAgentsAPI(endpoint, authToken || undefined)
      setAgents(data)
      // Keep selection in sync
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
                            <Badge
                              variant="outline"
                              className="gap-0.5 text-[9px] font-normal"
                            >
                              <Wrench size={8} />
                              {toolCount}
                            </Badge>
                          )}
                          {agent.knowledge && (
                            <Badge
                              variant="outline"
                              className="gap-0.5 text-[9px] font-normal"
                            >
                              <BookOpen size={8} />
                              KB
                            </Badge>
                          )}
                          {agent.memory && (
                            <Badge
                              variant="outline"
                              className="gap-0.5 text-[9px] font-normal"
                            >
                              <Brain size={8} />
                              Mem
                            </Badge>
                          )}
                          {agent.reasoning?.reasoning && (
                            <Badge
                              variant="outline"
                              className="gap-0.5 text-[9px] font-normal"
                            >
                              <Lightbulb size={8} />
                              CoT
                            </Badge>
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

      {/* Separator visible on lg */}
      <Separator orientation="vertical" className="hidden lg:block" />
    </div>
  )
}

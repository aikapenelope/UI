'use client'

import { useCallback, useEffect, useState } from 'react'
import { useStore } from '@/store'
import { getTeamsAPI } from '@/api/os'
import TeamDetailPanel from '@/components/teams/TeamDetailPanel'
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
import type { TeamDetails } from '@/types/os'
import {
  BookOpen,
  Brain,
  Cpu,
  Lightbulb,
  Loader2,
  RefreshCw,
  Users,
  Wrench
} from 'lucide-react'

export default function TeamsPage() {
  const endpoint = useStore((s) => s.selectedEndpoint)
  const authToken = useStore((s) => s.authToken)

  const [teams, setTeams] = useState<TeamDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<TeamDetails | null>(null)

  const fetchTeams = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getTeamsAPI(endpoint, authToken || undefined)
      setTeams(data)
      if (selected) {
        const updated = data.find((t) => t.id === selected.id)
        setSelected(updated ?? null)
      }
    } finally {
      setLoading(false)
    }
  }, [endpoint, authToken, selected])

  useEffect(() => {
    void fetchTeams()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, authToken])

  return (
    <div className="flex h-full">
      {/* Left: team list */}
      <div className="flex flex-1 flex-col overflow-hidden border-r border-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h1 className="text-sm font-semibold text-primary">Teams</h1>
            <p className="text-muted-foreground text-xs">
              {teams.length} team{teams.length !== 1 ? 's' : ''} registered
            </p>
          </div>
          <button
            onClick={() => void fetchTeams()}
            disabled={loading}
            className="text-muted-foreground rounded border border-border p-1.5 hover:bg-accent hover:text-primary disabled:opacity-40"
            title="Refresh"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
          </button>
        </div>

        {/* Table */}
        <ScrollArea className="flex-1">
          {loading && teams.length === 0 ? (
            <div className="text-muted-foreground flex items-center justify-center py-20 text-xs">
              <Loader2 size={16} className="mr-2 animate-spin" />
              Loading teams...
            </div>
          ) : teams.length === 0 ? (
            <div className="text-muted-foreground py-20 text-center text-xs">
              No teams found. Make sure your AgentOS endpoint is running.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-[11px] font-medium">
                    Name
                  </TableHead>
                  <TableHead className="text-muted-foreground text-[11px] font-medium">
                    Mode
                  </TableHead>
                  <TableHead className="text-muted-foreground text-[11px] font-medium">
                    Members
                  </TableHead>
                  <TableHead className="text-muted-foreground text-[11px] font-medium">
                    Capabilities
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => {
                  const toolCount = team.tools?.tools?.length ?? 0
                  const memberCount = team.members?.length ?? 0
                  const isSelected = selected?.id === team.id
                  return (
                    <TableRow
                      key={team.id}
                      onClick={() => setSelected(team)}
                      className={`cursor-pointer border-border ${
                        isSelected ? 'bg-accent/50' : 'hover:bg-accent/30'
                      }`}
                    >
                      <TableCell className="py-2">
                        <div className="text-xs font-medium text-primary">
                          {team.name || team.id}
                        </div>
                        {team.description && (
                          <div className="text-muted-foreground mt-0.5 max-w-[250px] truncate text-[10px]">
                            {team.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-2">
                        {team.mode ? (
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-normal"
                          >
                            {team.mode}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="text-muted-foreground flex items-center gap-1 text-[11px]">
                          <Users size={10} />
                          {memberCount}
                        </div>
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
                          {team.knowledge && (
                            <Badge
                              variant="outline"
                              className="gap-0.5 text-[9px] font-normal"
                            >
                              <BookOpen size={8} />
                              KB
                            </Badge>
                          )}
                          {team.memory && (
                            <Badge
                              variant="outline"
                              className="gap-0.5 text-[9px] font-normal"
                            >
                              <Brain size={8} />
                              Mem
                            </Badge>
                          )}
                          {team.reasoning?.reasoning && (
                            <Badge
                              variant="outline"
                              className="gap-0.5 text-[9px] font-normal"
                            >
                              <Lightbulb size={8} />
                              CoT
                            </Badge>
                          )}
                          {team.model && (
                            <Badge
                              variant="outline"
                              className="gap-0.5 text-[9px] font-normal"
                            >
                              <Cpu size={8} />
                              {team.model.provider ||
                                team.model.model ||
                                'model'}
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
          <TeamDetailPanel team={selected} />
        ) : (
          <div className="text-muted-foreground flex flex-1 items-center justify-center text-xs">
            Select a team to view details
          </div>
        )}
      </div>

      <Separator orientation="vertical" className="hidden lg:block" />
    </div>
  )
}

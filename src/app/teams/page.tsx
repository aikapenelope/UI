'use client'

import { useCallback, useEffect, useState } from 'react'
import { useStore } from '@/store'
import { getTeamsAPI } from '@/api/os'
import TeamDetailPanel from '@/components/teams/TeamDetailPanel'
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
import type { TeamDetails } from '@/types/os'
import {
  BookOpen,
  Brain,
  Cpu,
  Grid3X3,
  LayoutList,
  Lightbulb,
  Users,
  Wrench
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Team card (glassmorphism grid view)
// ---------------------------------------------------------------------------

function TeamCard({
  team,
  isSelected,
  onClick
}: {
  team: TeamDetails
  isSelected: boolean
  onClick: () => void
}) {
  const toolCount = team.tools?.tools?.length ?? 0
  const memberCount = team.members?.length ?? 0

  return (
    <button
      onClick={onClick}
      className={`glass glass-hover group flex flex-col gap-3 rounded-xl p-4 text-left transition-all ${
        isSelected ? 'glass-active glow-blue' : ''
      }`}
    >
      {/* Icon + name */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
          <Users size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-primary">
            {team.name || team.id}
          </p>
          {team.description && (
            <p className="text-muted-foreground mt-0.5 line-clamp-2 text-[11px]">
              {team.description}
            </p>
          )}
        </div>
      </div>

      {/* Mode + members */}
      <div className="text-muted-foreground flex items-center gap-3 text-[11px]">
        {team.mode && (
          <span className="chip-info rounded-full px-2 py-0.5 text-[10px]">
            {team.mode}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Users size={10} />
          {memberCount} member{memberCount !== 1 ? 's' : ''}
        </span>
        {team.model && (
          <span className="flex items-center gap-1">
            <Cpu size={10} />
            {team.model.provider || team.model.model || 'model'}
          </span>
        )}
      </div>

      {/* Capability chips */}
      <div className="flex flex-wrap gap-1.5">
        {toolCount > 0 && (
          <span className="chip-info flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]">
            <Wrench size={9} />
            {toolCount} tools
          </span>
        )}
        {team.knowledge && (
          <span className="chip-brand flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]">
            <BookOpen size={9} />
            Knowledge
          </span>
        )}
        {team.memory && (
          <span className="chip-success flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]">
            <Brain size={9} />
            Memory
          </span>
        )}
        {team.reasoning?.reasoning && (
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
// View toggle
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

export default function TeamsPage() {
  const endpoint = useStore((s) => s.selectedEndpoint)
  const authToken = useStore((s) => s.authToken)

  const [teams, setTeams] = useState<TeamDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<TeamDetails | null>(null)
  const [view, setView] = useState<'grid' | 'table'>('grid')

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
        <PageHeader
          title="Teams"
          subtitle={`${teams.length} team${teams.length !== 1 ? 's' : ''} registered`}
          count={teams.length}
          loading={loading}
          onRefresh={() => void fetchTeams()}
          actions={<ViewToggle view={view} onChange={setView} />}
        />

        <ScrollArea className="flex-1">
          {loading && teams.length === 0 ? (
            <PageSkeleton rows={6} />
          ) : teams.length === 0 ? (
            <EmptyState
              icon={<Users size={20} />}
              title="No teams found"
              description="Make sure your AgentOS endpoint is running and has teams registered."
            />
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
              {teams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  isSelected={selected?.id === team.id}
                  onClick={() => setSelected(team)}
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
                          <span className="chip-info rounded-full px-2 py-0.5 text-[10px]">
                            {team.mode}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">
                            {'\u2014'}
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
                            <span className="chip-info rounded-full px-1.5 py-0.5 text-[9px]">
                              {toolCount} tools
                            </span>
                          )}
                          {team.knowledge && (
                            <span className="chip-brand rounded-full px-1.5 py-0.5 text-[9px]">
                              KB
                            </span>
                          )}
                          {team.memory && (
                            <span className="chip-success rounded-full px-1.5 py-0.5 text-[9px]">
                              Mem
                            </span>
                          )}
                          {team.reasoning?.reasoning && (
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
          <TeamDetailPanel team={selected} />
        ) : (
          <EmptyState
            icon={<Users size={20} />}
            title="Select a team"
            description="Click on a team to view its details."
          />
        )}
      </div>

      <Separator orientation="vertical" className="hidden lg:block" />
    </div>
  )
}

'use client'

import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { AgentDetails, TeamDetails } from '@/types/os'
import {
  BookOpen,
  Brain,
  ChevronRight,
  Cpu,
  Lightbulb,
  Users,
  Wrench
} from 'lucide-react'
import { useState } from 'react'

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function Section({
  icon,
  title,
  badge,
  children,
  defaultOpen = false
}: {
  icon: React.ReactNode
  title: string
  badge?: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="text-muted-foreground flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium hover:bg-accent hover:text-primary">
        <ChevronRight
          size={12}
          className={`shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
        />
        {icon}
        <span className="flex-1 text-left">{title}</span>
        {badge && (
          <Badge
            variant="secondary"
            className="h-4 px-1.5 text-[10px] font-normal"
          >
            {badge}
          </Badge>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-6 pr-1 pt-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined) return null
  return (
    <div className="flex items-start justify-between gap-2 py-0.5 text-[11px]">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-right text-primary">{String(value)}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Recursive member tree
// ---------------------------------------------------------------------------

function isTeam(m: AgentDetails | TeamDetails): m is TeamDetails {
  return 'mode' in m || 'members' in m
}

function MemberNode({
  member,
  depth = 0
}: {
  member: AgentDetails | TeamDetails
  depth?: number
}) {
  const team = isTeam(member)
  const toolCount = member.tools?.tools?.length ?? 0

  return (
    <div
      className="rounded border border-border px-2 py-1"
      style={{ marginLeft: depth * 8 }}
    >
      <div className="flex items-center gap-1.5">
        {team ? <Users size={10} /> : <Cpu size={10} />}
        <span className="text-[11px] font-medium text-primary">
          {member.name || member.id}
        </span>
        {team && (member as TeamDetails).mode && (
          <Badge
            variant="secondary"
            className="h-3.5 px-1 text-[9px] font-normal"
          >
            {(member as TeamDetails).mode}
          </Badge>
        )}
      </div>
      {member.description && (
        <p className="text-muted-foreground text-[10px]">
          {member.description}
        </p>
      )}
      <div className="mt-0.5 flex flex-wrap gap-1">
        {toolCount > 0 && (
          <Badge variant="outline" className="gap-0.5 text-[9px] font-normal">
            <Wrench size={8} />
            {toolCount}
          </Badge>
        )}
        {member.knowledge && (
          <Badge variant="outline" className="gap-0.5 text-[9px] font-normal">
            <BookOpen size={8} />
            KB
          </Badge>
        )}
        {member.memory && (
          <Badge variant="outline" className="gap-0.5 text-[9px] font-normal">
            <Brain size={8} />
            Mem
          </Badge>
        )}
        {member.reasoning?.reasoning && (
          <Badge variant="outline" className="gap-0.5 text-[9px] font-normal">
            <Lightbulb size={8} />
            CoT
          </Badge>
        )}
      </div>
      {/* Recursive children for nested teams */}
      {team &&
        (member as TeamDetails).members &&
        (member as TeamDetails).members!.length > 0 && (
          <div className="mt-1 flex flex-col gap-1">
            {(member as TeamDetails).members!.map((child, i) => (
              <MemberNode
                key={`${child.id}-${String(i)}`}
                member={child}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// TeamDetailPanel
// ---------------------------------------------------------------------------

export default function TeamDetailPanel({ team }: { team: TeamDetails }) {
  const toolsList = team.tools?.tools ?? []
  const memberCount = team.members?.length ?? 0
  const hasKnowledge = !!team.knowledge
  const hasMemory = !!team.memory
  const hasReasoning = team.reasoning?.reasoning === true

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-1 p-2">
        {/* Header */}
        <div className="px-2 pb-1">
          <h3 className="text-sm font-semibold text-primary">
            {team.name || team.id}
          </h3>
          {team.description && (
            <p className="text-muted-foreground mt-0.5 text-[11px]">
              {team.description}
            </p>
          )}
          <div className="mt-1 flex items-center gap-2">
            {team.mode && (
              <Badge variant="secondary" className="text-[10px] font-normal">
                {team.mode}
              </Badge>
            )}
            {team.role && (
              <span className="text-muted-foreground text-[10px] italic">
                {team.role}
              </span>
            )}
          </div>
        </div>

        {/* Capability badges */}
        <div className="flex flex-wrap gap-1 px-2 pb-1">
          <Badge variant="outline" className="gap-1 text-[10px] font-normal">
            <Users size={10} />
            {memberCount} member{memberCount !== 1 ? 's' : ''}
          </Badge>
          {toolsList.length > 0 && (
            <Badge variant="outline" className="gap-1 text-[10px] font-normal">
              <Wrench size={10} />
              {toolsList.length} tool{toolsList.length !== 1 ? 's' : ''}
            </Badge>
          )}
          {hasKnowledge && (
            <Badge variant="outline" className="gap-1 text-[10px] font-normal">
              <BookOpen size={10} />
              Knowledge
            </Badge>
          )}
          {hasMemory && (
            <Badge variant="outline" className="gap-1 text-[10px] font-normal">
              <Brain size={10} />
              Memory
            </Badge>
          )}
          {hasReasoning && (
            <Badge variant="outline" className="gap-1 text-[10px] font-normal">
              <Lightbulb size={10} />
              Reasoning
            </Badge>
          )}
        </div>

        <Separator className="my-1" />

        {/* Model */}
        {team.model && (
          <Section icon={<Cpu size={12} />} title="Model" defaultOpen>
            <KV label="Provider" value={team.model.provider} />
            <KV label="Model" value={team.model.model} />
            <KV label="Name" value={team.model.name} />
          </Section>
        )}

        {/* Members tree */}
        {memberCount > 0 && (
          <Section
            icon={<Users size={12} />}
            title="Members"
            badge={String(memberCount)}
            defaultOpen
          >
            <div className="flex flex-col gap-1">
              {team.members!.map((m, i) => (
                <MemberNode key={`${m.id}-${String(i)}`} member={m} />
              ))}
            </div>
          </Section>
        )}

        {/* Tools */}
        {toolsList.length > 0 && (
          <Section
            icon={<Wrench size={12} />}
            title="Tools"
            badge={String(toolsList.length)}
          >
            <div className="flex flex-col gap-1">
              {toolsList.map((t) => (
                <div
                  key={t.name}
                  className="rounded border border-border px-2 py-1"
                >
                  <span className="text-[11px] font-medium text-primary">
                    {t.name}
                  </span>
                  {t.description && (
                    <p className="text-muted-foreground text-[10px]">
                      {t.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Knowledge */}
        {hasKnowledge && (
          <Section icon={<BookOpen size={12} />} title="Knowledge">
            <KV label="DB ID" value={team.knowledge?.db_id} />
            <KV label="Table" value={team.knowledge?.knowledge_table} />
            <KV
              label="Agentic filters"
              value={String(
                team.knowledge?.enable_agentic_knowledge_filters ?? false
              )}
            />
          </Section>
        )}

        {/* Memory */}
        {hasMemory && (
          <Section icon={<Brain size={12} />} title="Memory">
            <KV
              label="Agentic memory"
              value={String(team.memory?.enable_agentic_memory ?? false)}
            />
            <KV
              label="Update on run"
              value={String(team.memory?.update_memory_on_run ?? false)}
            />
          </Section>
        )}

        {/* Reasoning */}
        {hasReasoning && (
          <Section icon={<Lightbulb size={12} />} title="Reasoning">
            <KV
              label="Reasoning agent"
              value={team.reasoning?.reasoning_agent_id}
            />
          </Section>
        )}

        {/* Metadata */}
        {team.metadata && Object.keys(team.metadata).length > 0 && (
          <Section icon={<Cpu size={12} />} title="Metadata">
            <pre className="text-muted-foreground overflow-x-auto rounded bg-accent/50 p-2 text-[10px]">
              {JSON.stringify(team.metadata, null, 2)}
            </pre>
          </Section>
        )}
      </div>
    </ScrollArea>
  )
}

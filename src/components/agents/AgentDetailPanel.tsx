'use client'

import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { AgentDetails } from '@/types/os'
import {
  Brain,
  BookOpen,
  ChevronRight,
  Cpu,
  Lightbulb,
  Settings2,
  ShieldCheck,
  Wrench
} from 'lucide-react'
import { useState } from 'react'

// ---------------------------------------------------------------------------
// Collapsible section wrapper
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

// ---------------------------------------------------------------------------
// Key-value row
// ---------------------------------------------------------------------------

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
// Tool tile (glassmorphism grid)
// ---------------------------------------------------------------------------

function ToolTile({
  name,
  description,
  requiresConfirmation
}: {
  name: string
  description?: string
  requiresConfirmation?: boolean
}) {
  return (
    <div className="glass glass-hover flex flex-col gap-1 rounded-lg p-2.5">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-info/10 text-info">
          <Wrench size={13} />
        </div>
        <span className="truncate text-[11px] font-medium text-primary">
          {name}
        </span>
      </div>
      {description && (
        <p className="text-muted-foreground line-clamp-2 text-[10px]">
          {description}
        </p>
      )}
      {requiresConfirmation && (
        <span className="chip-warning mt-0.5 flex w-fit items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px]">
          <ShieldCheck size={8} />
          confirmation
        </span>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// AgentDetailPanel
// ---------------------------------------------------------------------------

export default function AgentDetailPanel({ agent }: { agent: AgentDetails }) {
  const toolsList = agent.tools?.tools ?? []
  const hasKnowledge = !!agent.knowledge
  const hasMemory = !!agent.memory
  const hasReasoning = agent.reasoning?.reasoning === true

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-1 p-2">
        {/* Header */}
        <div className="px-2 pb-1">
          <h3 className="text-sm font-semibold text-primary">
            {agent.name || agent.id}
          </h3>
          {agent.description && (
            <p className="text-muted-foreground mt-0.5 text-[11px]">
              {agent.description}
            </p>
          )}
          {agent.role && (
            <p className="text-muted-foreground mt-0.5 text-[11px] italic">
              Role: {agent.role}
            </p>
          )}
        </div>

        {/* Capability chips */}
        <div className="flex flex-wrap gap-1.5 px-2 pb-1">
          {toolsList.length > 0 && (
            <span className="chip-info flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]">
              <Wrench size={10} />
              {toolsList.length} tool{toolsList.length !== 1 ? 's' : ''}
            </span>
          )}
          {hasKnowledge && (
            <span className="chip-brand flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]">
              <BookOpen size={10} />
              Knowledge
            </span>
          )}
          {hasMemory && (
            <span className="chip-success flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]">
              <Brain size={10} />
              Memory
            </span>
          )}
          {hasReasoning && (
            <span className="chip-warning flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]">
              <Lightbulb size={10} />
              Reasoning
            </span>
          )}
        </div>

        <Separator className="my-1" />

        {/* Model */}
        {agent.model && (
          <Section icon={<Cpu size={12} />} title="Model" defaultOpen>
            <KV label="Provider" value={agent.model.provider} />
            <KV label="Model" value={agent.model.model} />
            <KV label="Name" value={agent.model.name} />
          </Section>
        )}

        {/* Tools -- grid tiles */}
        {toolsList.length > 0 && (
          <Section
            icon={<Wrench size={12} />}
            title="Tools"
            badge={String(toolsList.length)}
            defaultOpen
          >
            <div className="grid grid-cols-1 gap-2">
              {toolsList.map((t) => (
                <ToolTile
                  key={t.name}
                  name={t.name}
                  description={t.description ?? undefined}
                  requiresConfirmation={t.requires_confirmation ?? undefined}
                />
              ))}
            </div>
            <div className="mt-2">
              <KV label="Call limit" value={agent.tools?.tool_call_limit} />
              <KV label="Tool choice" value={agent.tools?.tool_choice} />
            </div>
          </Section>
        )}

        {/* Knowledge */}
        {hasKnowledge && (
          <Section icon={<BookOpen size={12} />} title="Knowledge">
            <KV label="DB ID" value={agent.knowledge?.db_id} />
            <KV label="Table" value={agent.knowledge?.knowledge_table} />
            <KV
              label="Agentic filters"
              value={String(
                agent.knowledge?.enable_agentic_knowledge_filters ?? false
              )}
            />
            <KV
              label="References format"
              value={agent.knowledge?.references_format}
            />
          </Section>
        )}

        {/* Memory */}
        {hasMemory && (
          <Section icon={<Brain size={12} />} title="Memory">
            <KV
              label="Agentic memory"
              value={String(agent.memory?.enable_agentic_memory ?? false)}
            />
            <KV
              label="Update on run"
              value={String(agent.memory?.update_memory_on_run ?? false)}
            />
            <KV label="Table" value={agent.memory?.memory_table} />
            {agent.memory?.model && (
              <KV
                label="Memory model"
                value={`${agent.memory.model.provider ?? ''} / ${agent.memory.model.model ?? ''}`}
              />
            )}
          </Section>
        )}

        {/* Reasoning */}
        {hasReasoning && (
          <Section icon={<Lightbulb size={12} />} title="Reasoning">
            <KV
              label="Min steps"
              value={agent.reasoning?.reasoning_min_steps}
            />
            <KV
              label="Max steps"
              value={agent.reasoning?.reasoning_max_steps}
            />
            <KV
              label="Reasoning agent"
              value={agent.reasoning?.reasoning_agent_id}
            />
          </Section>
        )}

        {/* Sessions */}
        {agent.sessions && (
          <Section icon={<Settings2 size={12} />} title="Sessions">
            <KV label="Table" value={agent.sessions.session_table} />
            <KV
              label="History in context"
              value={String(agent.sessions.add_history_to_context ?? false)}
            />
            <KV
              label="Summaries"
              value={String(agent.sessions.enable_session_summaries ?? false)}
            />
            <KV label="History runs" value={agent.sessions.num_history_runs} />
          </Section>
        )}

        {/* Default tools */}
        {agent.default_tools && (
          <Section icon={<Settings2 size={12} />} title="Default Tools">
            <KV
              label="Read chat history"
              value={String(agent.default_tools.read_chat_history ?? false)}
            />
            <KV
              label="Search knowledge"
              value={String(agent.default_tools.search_knowledge ?? false)}
            />
            <KV
              label="Update knowledge"
              value={String(agent.default_tools.update_knowledge ?? false)}
            />
            <KV
              label="Read tool call history"
              value={String(
                agent.default_tools.read_tool_call_history ?? false
              )}
            />
          </Section>
        )}

        {/* Metadata */}
        {agent.metadata && Object.keys(agent.metadata).length > 0 && (
          <Section icon={<Settings2 size={12} />} title="Metadata">
            <pre className="text-muted-foreground overflow-x-auto rounded bg-accent/50 p-2 text-[10px]">
              {JSON.stringify(agent.metadata, null, 2)}
            </pre>
          </Section>
        )}
      </div>
    </ScrollArea>
  )
}

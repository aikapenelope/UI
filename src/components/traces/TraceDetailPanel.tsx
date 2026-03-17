'use client'

import { memo, useState, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChevronRight,
  ChevronDown,
  X,
  Bot,
  Users,
  GitBranch,
  Cpu,
  Wrench,
  HelpCircle
} from 'lucide-react'
import type { TraceDetail, TraceNode } from '@/types/agentOS'

// ---------------------------------------------------------------------------
// Span type icon mapping
// ---------------------------------------------------------------------------

const SPAN_TYPE_ICONS: Record<string, React.ReactNode> = {
  AGENT: <Bot size={14} className="text-blue-400" />,
  TEAM: <Users size={14} className="text-purple-400" />,
  WORKFLOW: <GitBranch size={14} className="text-cyan-400" />,
  LLM: <Cpu size={14} className="text-green-400" />,
  TOOL: <Wrench size={14} className="text-orange-400" />
}

function spanIcon(type: string) {
  return (
    SPAN_TYPE_ICONS[type] ?? <HelpCircle size={14} className="text-muted" />
  )
}

function statusColor(status: string) {
  if (status === 'ERROR') return 'text-destructive'
  if (status === 'OK') return 'text-positive'
  return 'text-muted'
}

// ---------------------------------------------------------------------------
// Recursive span tree node
// ---------------------------------------------------------------------------

interface SpanTreeNodeProps {
  node: TraceNode
  depth: number
  selectedSpanId: string | null
  onSelectSpan: (span: TraceNode) => void
}

function SpanTreeNode({
  node,
  depth,
  selectedSpanId,
  onSelectSpan
}: SpanTreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2)
  const hasChildren = node.spans && node.spans.length > 0
  const isSelected = selectedSpanId === node.id

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (hasChildren) setExpanded((prev) => !prev)
    },
    [hasChildren]
  )

  const handleSelect = useCallback(() => {
    onSelectSpan(node)
  }, [node, onSelectSpan])

  return (
    <div>
      <div
        onClick={handleSelect}
        className={`flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors ${
          isSelected ? 'bg-accent/80 text-primary' : 'hover:bg-accent/40'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {/* Expand/collapse toggle */}
        <button
          onClick={handleToggle}
          className="flex h-4 w-4 shrink-0 items-center justify-center"
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown size={12} />
            ) : (
              <ChevronRight size={12} />
            )
          ) : (
            <span className="h-4 w-4" />
          )}
        </button>

        {/* Icon */}
        {spanIcon(node.type)}

        {/* Name */}
        <span className="truncate font-medium">{node.name}</span>

        {/* Step type badge (workflow steps) */}
        {node.step_type && (
          <span className="shrink-0 rounded bg-cyan-900/40 px-1 text-[10px] text-cyan-300">
            {node.step_type}
          </span>
        )}

        {/* Spacer */}
        <span className="flex-1" />

        {/* Duration */}
        <span className="shrink-0 font-dmmono text-muted">{node.duration}</span>

        {/* Status dot */}
        <span className={`shrink-0 ${statusColor(node.status)}`}>
          {node.status === 'ERROR' ? '!' : '\u2022'}
        </span>
      </div>

      {/* Children */}
      {expanded &&
        hasChildren &&
        node.spans!.map((child) => (
          <SpanTreeNode
            key={child.id}
            node={child}
            depth={depth + 1}
            selectedSpanId={selectedSpanId}
            onSelectSpan={onSelectSpan}
          />
        ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Metadata row helper
// ---------------------------------------------------------------------------

function MetaRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex items-baseline gap-2 text-xs">
      <span className="shrink-0 text-muted">{label}</span>
      <span className="truncate font-dmmono text-primary">{value}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface TraceDetailPanelProps {
  trace: TraceDetail | null
  isLoading: boolean
  selectedSpanId: string | null
  onSelectSpan: (span: TraceNode) => void
  onClose: () => void
}

function TraceDetailPanelInner({
  trace,
  isLoading,
  selectedSpanId,
  onSelectSpan,
  onClose
}: TraceDetailPanelProps) {
  if (isLoading) {
    return (
      <div className="flex h-full flex-col gap-3 p-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
        <Separator />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    )
  }

  if (!trace) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-muted">
        Select a trace to view details
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border px-4 py-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-primary">{trace.name}</h2>
            <Badge
              variant={trace.status === 'ERROR' ? 'destructive' : 'default'}
              className="text-[10px]"
            >
              {trace.status}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="font-dmmono">{trace.duration}</span>
            <span>
              {trace.total_spans} spans
              {trace.error_count > 0 && (
                <span className="ml-1 text-destructive">
                  ({trace.error_count} errors)
                </span>
              )}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-muted hover:bg-accent hover:text-primary"
        >
          <X size={14} />
        </button>
      </div>

      {/* Metadata */}
      <div className="flex flex-col gap-1 border-b border-border px-4 py-2">
        <MetaRow label="Trace ID" value={trace.trace_id} />
        <MetaRow label="Run" value={trace.run_id} />
        <MetaRow label="Session" value={trace.session_id} />
        <MetaRow label="User" value={trace.user_id} />
        <MetaRow label="Agent" value={trace.agent_id} />
        <MetaRow label="Team" value={trace.team_id} />
        <MetaRow label="Workflow" value={trace.workflow_id} />
      </div>

      {/* Span tree */}
      <ScrollArea className="flex-1">
        <div className="py-1">
          {trace.tree.map((rootNode) => (
            <SpanTreeNode
              key={rootNode.id}
              node={rootNode}
              depth={0}
              selectedSpanId={selectedSpanId}
              onSelectSpan={onSelectSpan}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

const TraceDetailPanel = memo(TraceDetailPanelInner)
TraceDetailPanel.displayName = 'TraceDetailPanel'

export default TraceDetailPanel

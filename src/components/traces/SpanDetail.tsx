'use client'

import { memo } from 'react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { X } from 'lucide-react'
import type { TraceNode } from '@/types/agentOS'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  })
}

function MetaItem({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex items-baseline justify-between gap-2 py-0.5 text-xs">
      <span className="shrink-0 text-muted">{label}</span>
      <span className="truncate text-right font-dmmono text-primary">
        {value}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Code block for input/output/error
// ---------------------------------------------------------------------------

function CodeBlock({
  label,
  content,
  variant = 'default'
}: {
  label: string
  content: string
  variant?: 'default' | 'error'
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-medium uppercase text-muted">
        {label}
      </span>
      <pre
        className={`max-h-[200px] overflow-auto whitespace-pre-wrap rounded-md p-3 font-dmmono text-xs ${
          variant === 'error'
            ? 'border border-destructive/30 bg-destructive/10 text-destructive'
            : 'bg-accent/50 text-primary'
        }`}
      >
        {content}
      </pre>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Metadata section (model, tokens, tool params, etc.)
// ---------------------------------------------------------------------------

function MetadataSection({
  metadata
}: {
  metadata: Record<string, unknown> | null | undefined
}) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return (
      <p className="py-4 text-center text-xs text-muted">
        No metadata available
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {Object.entries(metadata).map(([key, value]) => (
        <MetaItem key={key} label={key} value={String(value)} />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface SpanDetailProps {
  span: TraceNode | null
  onClose: () => void
}

function SpanDetailInner({ span, onClose }: SpanDetailProps) {
  if (!span) return null

  const hasInput = !!span.input
  const hasOutput = !!span.output
  const hasError = !!span.error
  const hasIO = hasInput || hasOutput || hasError

  return (
    <div className="flex h-full flex-col border-l border-border">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border px-4 py-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-primary">{span.name}</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-dmmono text-[10px]">
              {span.type}
            </Badge>
            <Badge
              variant={span.status === 'ERROR' ? 'destructive' : 'default'}
              className="text-[10px]"
            >
              {span.status}
            </Badge>
            {span.step_type && (
              <Badge variant="secondary" className="text-[10px]">
                {span.step_type}
              </Badge>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-muted hover:bg-accent hover:text-primary"
        >
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <Tabs defaultValue={hasIO ? 'io' : 'meta'} className="flex flex-col">
          <TabsList className="mx-4 mt-2 w-fit">
            {hasIO && <TabsTrigger value="io">I/O</TabsTrigger>}
            <TabsTrigger value="meta">Metadata</TabsTrigger>
            <TabsTrigger value="timing">Timing</TabsTrigger>
          </TabsList>

          {/* I/O tab */}
          {hasIO && (
            <TabsContent value="io" className="flex flex-col gap-3 px-4 py-3">
              {hasInput && <CodeBlock label="Input" content={span.input!} />}
              {hasOutput && <CodeBlock label="Output" content={span.output!} />}
              {hasError && (
                <CodeBlock
                  label="Error"
                  content={span.error!}
                  variant="error"
                />
              )}
            </TabsContent>
          )}

          {/* Metadata tab */}
          <TabsContent value="meta" className="px-4 py-3">
            <MetadataSection metadata={span.metadata} />
            {span.extra_data && Object.keys(span.extra_data).length > 0 && (
              <>
                <Separator className="my-3" />
                <span className="mb-1 text-[10px] font-medium uppercase text-muted">
                  Extra Data
                </span>
                <MetadataSection metadata={span.extra_data} />
              </>
            )}
          </TabsContent>

          {/* Timing tab */}
          <TabsContent value="timing" className="px-4 py-3">
            <div className="flex flex-col gap-1">
              <MetaItem label="Duration" value={span.duration} />
              <MetaItem
                label="Start"
                value={formatTimestamp(span.start_time)}
              />
              <MetaItem label="End" value={formatTimestamp(span.end_time)} />
              <MetaItem label="Span ID" value={span.id} />
            </div>
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  )
}

const SpanDetail = memo(SpanDetailInner)
SpanDetail.displayName = 'SpanDetail'

export default SpanDetail

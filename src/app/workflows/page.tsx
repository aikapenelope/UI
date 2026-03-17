'use client'

import { useEffect, useCallback, useState } from 'react'
import { useStore } from '@/store'
import { useWorkflowsStore } from '@/stores/workflowsStore'
import { getWorkflowsAPI, runWorkflowAPI } from '@/api/workflows'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { ArrowLeft, Play, GitBranch } from 'lucide-react'
import { toast } from 'sonner'
import type { WorkflowDetailResponse } from '@/types/agentOS'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stageVariant(
  stage?: string | null
): 'default' | 'secondary' | 'outline' {
  switch (stage) {
    case 'published':
      return 'default'
    case 'draft':
      return 'secondary'
    default:
      return 'outline'
  }
}

// ---------------------------------------------------------------------------
// Run dialog
// ---------------------------------------------------------------------------

function WorkflowRunDialog({
  open,
  onOpenChange,
  workflow,
  isRunning,
  onRun
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  workflow: WorkflowDetailResponse
  isRunning: boolean
  onRun: (input: Record<string, unknown>) => void
}) {
  const [inputJson, setInputJson] = useState('{}')
  const [parseError, setParseError] = useState<string | null>(null)

  const handleRun = () => {
    try {
      const parsed = JSON.parse(inputJson) as Record<string, unknown>
      setParseError(null)
      onRun(parsed)
    } catch {
      setParseError('Invalid JSON')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-[#111113] sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-primary">
            Run: {workflow.name}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          {workflow.input_schema && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted">
                Input Schema
              </label>
              <pre className="max-h-32 overflow-auto rounded border border-border bg-background p-2 font-dmmono text-[10px] text-muted">
                {JSON.stringify(workflow.input_schema, null, 2)}
              </pre>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">
              Input (JSON)
            </label>
            <textarea
              value={inputJson}
              onChange={(e) => {
                setInputJson(e.target.value)
                setParseError(null)
              }}
              rows={6}
              className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 font-dmmono text-xs text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            {parseError && (
              <span className="text-[10px] text-red-400">{parseError}</span>
            )}
          </div>
        </div>
        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded border border-border px-4 py-1.5 text-xs text-muted hover:bg-accent hover:text-primary"
          >
            Cancel
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 rounded bg-primary px-4 py-1.5 text-xs font-medium text-primaryAccent hover:opacity-90 disabled:opacity-40"
          >
            <Play size={11} />
            {isRunning ? 'Running...' : 'Run'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Detail panel
// ---------------------------------------------------------------------------

function WorkflowDetail({
  workflow,
  onBack,
  onRun
}: {
  workflow: WorkflowDetailResponse
  onBack: () => void
  onRun: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded p-1 text-muted hover:bg-accent hover:text-primary"
          >
            <ArrowLeft size={14} />
          </button>
          <span className="text-xs font-semibold text-primary">
            {workflow.name}
          </span>
          {workflow.stage && (
            <Badge
              variant={stageVariant(workflow.stage)}
              className="text-[10px]"
            >
              {workflow.stage}
            </Badge>
          )}
        </div>
        <button
          onClick={onRun}
          className="flex items-center gap-1.5 rounded bg-primary px-3 py-1 text-xs font-medium text-primaryAccent hover:opacity-90"
        >
          <Play size={11} />
          Run
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 p-4">
          {/* Description */}
          {workflow.description && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase text-muted">
                Description
              </span>
              <p className="text-xs text-primary">{workflow.description}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'ID', value: workflow.id },
              {
                label: 'Version',
                value:
                  workflow.current_version != null
                    ? `v${workflow.current_version}`
                    : '-'
              },
              {
                label: 'Component',
                value: workflow.is_component ? 'Yes' : 'No'
              }
            ].map((m) => (
              <div key={m.label} className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium uppercase text-muted">
                  {m.label}
                </span>
                <span className="font-dmmono text-xs text-primary">
                  {m.value}
                </span>
              </div>
            ))}
          </div>

          {/* Input schema */}
          {workflow.input_schema && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase text-muted">
                Input Schema
              </span>
              <pre className="overflow-auto rounded border border-border bg-background p-3 font-dmmono text-[10px] text-muted">
                {JSON.stringify(workflow.input_schema, null, 2)}
              </pre>
            </div>
          )}

          {/* Steps */}
          {workflow.steps && workflow.steps.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-medium uppercase text-muted">
                Steps ({workflow.steps.length})
              </span>
              {workflow.steps.map((step, i) => {
                const name =
                  (step as Record<string, unknown>).name ?? `Step ${i + 1}`
                const agent = (step as Record<string, unknown>).agent as
                  | Record<string, unknown>
                  | undefined
                const team = (step as Record<string, unknown>).team as
                  | Record<string, unknown>
                  | undefined
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded border border-border p-3"
                  >
                    <div className="mt-0.5 rounded bg-accent p-1">
                      <GitBranch size={12} className="text-muted" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-medium text-primary">
                        {String(name)}
                      </span>
                      {agent && (
                        <span className="text-[10px] text-muted">
                          Agent: {String(agent.name ?? agent.id ?? '-')}
                        </span>
                      )}
                      {team && (
                        <span className="text-[10px] text-muted">
                          Team: {String(team.name ?? team.id ?? '-')}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function WorkflowsPage() {
  const endpoint = useStore((s) => s.selectedEndpoint)
  const authToken = useStore((s) => s.authToken)

  const {
    workflows,
    selectedWorkflow,
    isLoading,
    isRunning,
    setWorkflows,
    setSelectedWorkflow,
    setIsLoading,
    setIsRunning,
    setError
  } = useWorkflowsStore()

  const [runDialogOpen, setRunDialogOpen] = useState(false)

  const fetchWorkflows = useCallback(async () => {
    if (!endpoint) return
    setIsLoading(true)
    try {
      const res = await getWorkflowsAPI(endpoint, authToken || undefined)
      if (res) setWorkflows(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch')
    } finally {
      setIsLoading(false)
    }
  }, [endpoint, authToken, setWorkflows, setIsLoading, setError])

  useEffect(() => {
    fetchWorkflows()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, authToken])

  const handleRun = useCallback(
    async (input: Record<string, unknown>) => {
      if (!endpoint || !selectedWorkflow) return
      setIsRunning(true)
      try {
        const res = await runWorkflowAPI(
          endpoint,
          selectedWorkflow.id ?? '',
          { input },
          authToken || undefined
        )
        if (res) {
          toast.success(`Run started: ${res.run_id}`)
          setRunDialogOpen(false)
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Run failed')
      } finally {
        setIsRunning(false)
      }
    },
    [endpoint, authToken, selectedWorkflow, setIsRunning]
  )

  // Detail view
  if (selectedWorkflow) {
    return (
      <>
        <WorkflowDetail
          workflow={selectedWorkflow}
          onBack={() => setSelectedWorkflow(null)}
          onRun={() => setRunDialogOpen(true)}
        />
        <WorkflowRunDialog
          open={runDialogOpen}
          onOpenChange={setRunDialogOpen}
          workflow={selectedWorkflow}
          isRunning={isRunning}
          onRun={handleRun}
        />
      </>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <h1 className="text-sm font-semibold text-primary">Workflows</h1>
        <span className="text-[10px] text-muted">
          {workflows.length} workflow{workflows.length !== 1 ? 's' : ''}
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded" />
          ))}
        </div>
      ) : workflows.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-xs text-muted">
          No workflows registered
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <Table>
            <TableHeader>
              <TableRow className="border-border text-xs hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead className="w-[100px]">Stage</TableHead>
                <TableHead className="w-[80px]">Version</TableHead>
                <TableHead className="w-[80px]">Steps</TableHead>
                <TableHead className="w-[100px]">Component</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflows.map((w) => (
                <TableRow key={w.id} className="border-border text-xs">
                  <TableCell>
                    <button
                      onClick={() => setSelectedWorkflow(w)}
                      className="font-medium text-primary hover:underline"
                    >
                      {w.name || w.id}
                    </button>
                    {w.description && (
                      <p className="text-[10px] text-muted">{w.description}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    {w.stage ? (
                      <Badge
                        variant={stageVariant(w.stage)}
                        className="text-[10px]"
                      >
                        {w.stage}
                      </Badge>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-dmmono text-muted">
                    {w.current_version != null ? `v${w.current_version}` : '-'}
                  </TableCell>
                  <TableCell className="font-dmmono text-muted">
                    {w.steps?.length ?? 0}
                  </TableCell>
                  <TableCell>
                    {w.is_component ? (
                      <Badge variant="secondary" className="text-[10px]">
                        Yes
                      </Badge>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      )}
    </div>
  )
}

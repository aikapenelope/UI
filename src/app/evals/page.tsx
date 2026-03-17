'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { useStore } from '@/store'
import { useEvalsStore } from '@/stores/evalsStore'
import { getEvalRunsAPI, deleteEvalRunsAPI, runEvalAPI } from '@/api/evals'
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
import {
  Plus,
  Trash2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play
} from 'lucide-react'
import { toast } from 'sonner'
import type { EvalSchema, EvalType, PaginationInfo } from '@/types/agentOS'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTs(val?: string | null): string {
  if (!val) return '-'
  return new Date(val).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function evalTypeVariant(
  t: EvalType
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (t) {
    case 'accuracy':
      return 'default'
    case 'performance':
      return 'secondary'
    case 'reliability':
      return 'outline'
    case 'agent_as_judge':
      return 'destructive'
    default:
      return 'outline'
  }
}

function extractResult(data: Record<string, unknown>): string {
  // Try common result fields
  if (typeof data.result === 'string') return data.result
  if (typeof data.passed === 'boolean') return data.passed ? 'PASS' : 'FAIL'
  if (typeof data.score === 'number') return `Score: ${data.score}`
  if (typeof data.avg_response_time === 'number')
    return `${(data.avg_response_time as number).toFixed(0)}ms avg`
  return '-'
}

const EVAL_TYPES: { value: EvalType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'accuracy', label: 'Accuracy' },
  { value: 'performance', label: 'Performance' },
  { value: 'reliability', label: 'Reliability' },
  { value: 'agent_as_judge', label: 'Agent Judge' }
]

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

function PaginationControls({
  pagination,
  onPageChange
}: {
  pagination: PaginationInfo | null
  onPageChange: (page: number) => void
}) {
  if (!pagination || pagination.total_pages <= 1) return null
  const page = pagination.page ?? 1
  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-2">
      <span className="text-[10px] text-muted">
        Page {page} of {pagination.total_pages}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded p-1 text-muted hover:bg-accent disabled:opacity-30"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pagination.total_pages}
          className="rounded p-1 text-muted hover:bg-accent disabled:opacity-30"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Run eval dialog
// ---------------------------------------------------------------------------

function RunEvalDialog({
  open,
  onOpenChange,
  isRunning,
  onRun
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  isRunning: boolean
  onRun: (data: {
    eval_type: EvalType
    input: string
    name?: string
    expected_output?: string
    criteria?: string
    scoring_strategy?: 'numeric' | 'binary'
    num_iterations?: number
    expected_tool_calls?: string[]
  }) => void
}) {
  const [evalType, setEvalType] = useState<EvalType>('accuracy')
  const [input, setInput] = useState('')
  const [name, setName] = useState('')
  const [expectedOutput, setExpectedOutput] = useState('')
  const [criteria, setCriteria] = useState('')
  const [scoringStrategy, setScoringStrategy] = useState<'numeric' | 'binary'>(
    'binary'
  )
  const [numIterations, setNumIterations] = useState(1)
  const [expectedToolCalls, setExpectedToolCalls] = useState('')

  const handleSubmit = () => {
    if (!input.trim()) return
    onRun({
      eval_type: evalType,
      input: input.trim(),
      name: name.trim() || undefined,
      expected_output:
        evalType === 'accuracy'
          ? expectedOutput.trim() || undefined
          : undefined,
      criteria:
        evalType === 'agent_as_judge'
          ? criteria.trim() || undefined
          : undefined,
      scoring_strategy:
        evalType === 'agent_as_judge' ? scoringStrategy : undefined,
      num_iterations: numIterations > 1 ? numIterations : undefined,
      expected_tool_calls:
        evalType === 'reliability' && expectedToolCalls.trim()
          ? expectedToolCalls
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-[#111113] sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-primary">
            Run Evaluation
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          {/* Eval type */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">Type</label>
            <select
              value={evalType}
              onChange={(e) => setEvalType(e.target.value as EvalType)}
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            >
              <option value="accuracy">Accuracy</option>
              <option value="performance">Performance</option>
              <option value="reliability">Reliability</option>
              <option value="agent_as_judge">Agent as Judge</option>
            </select>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">
              Name (optional)
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Eval run name"
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>

          {/* Input */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">Input</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Input text or query for evaluation"
              rows={3}
              className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-xs text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>

          {/* Accuracy: expected output */}
          {evalType === 'accuracy' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted">
                Expected Output
              </label>
              <textarea
                value={expectedOutput}
                onChange={(e) => setExpectedOutput(e.target.value)}
                placeholder="Expected response"
                rows={2}
                className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-xs text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          )}

          {/* Agent as judge: criteria + scoring */}
          {evalType === 'agent_as_judge' && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted">
                  Criteria
                </label>
                <textarea
                  value={criteria}
                  onChange={(e) => setCriteria(e.target.value)}
                  placeholder="Evaluation criteria"
                  rows={2}
                  className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-xs text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted">
                  Scoring Strategy
                </label>
                <select
                  value={scoringStrategy}
                  onChange={(e) =>
                    setScoringStrategy(e.target.value as 'numeric' | 'binary')
                  }
                  className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                >
                  <option value="binary">Binary (PASS/FAIL)</option>
                  <option value="numeric">Numeric (1-10)</option>
                </select>
              </div>
            </>
          )}

          {/* Reliability: expected tool calls */}
          {evalType === 'reliability' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted">
                Expected Tool Calls (comma-separated)
              </label>
              <input
                value={expectedToolCalls}
                onChange={(e) => setExpectedToolCalls(e.target.value)}
                placeholder="search, calculate, format"
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          )}

          {/* Iterations */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">Iterations</label>
            <input
              type="number"
              min={1}
              max={100}
              value={numIterations}
              onChange={(e) => setNumIterations(Number(e.target.value) || 1)}
              className="w-24 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
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
            onClick={handleSubmit}
            disabled={!input.trim() || isRunning}
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

function EvalDetail({
  evalItem,
  onBack,
  onDelete
}: {
  evalItem: EvalSchema
  onBack: () => void
  onDelete: () => void
}) {
  const fields: { label: string; value: string }[] = [
    { label: 'ID', value: evalItem.id },
    { label: 'Type', value: evalItem.eval_type },
    { label: 'Name', value: evalItem.name || '-' },
    { label: 'Agent ID', value: evalItem.agent_id || '-' },
    { label: 'Team ID', value: evalItem.team_id || '-' },
    { label: 'Workflow ID', value: evalItem.workflow_id || '-' },
    { label: 'Model', value: evalItem.model_id || '-' },
    { label: 'Provider', value: evalItem.model_provider || '-' },
    { label: 'Component', value: evalItem.evaluated_component_name || '-' },
    { label: 'Created', value: formatTs(evalItem.created_at) }
  ]

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
            Eval Detail
          </span>
          <Badge
            variant={evalTypeVariant(evalItem.eval_type)}
            className="text-[10px]"
          >
            {evalItem.eval_type}
          </Badge>
        </div>
        <button
          onClick={onDelete}
          className="rounded p-1 text-muted hover:bg-red-900/20 hover:text-red-400"
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 p-4">
          <div className="grid grid-cols-3 gap-3">
            {fields.map((f) => (
              <div key={f.label} className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium uppercase text-muted">
                  {f.label}
                </span>
                <span className="font-dmmono text-xs text-primary">
                  {f.value}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-medium uppercase text-muted">
              Eval Data
            </span>
            <pre className="overflow-auto rounded border border-border bg-background p-3 font-dmmono text-[10px] text-muted">
              {JSON.stringify(evalItem.eval_data, null, 2)}
            </pre>
          </div>

          {evalItem.eval_input && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase text-muted">
                Eval Input
              </span>
              <pre className="overflow-auto rounded border border-border bg-background p-3 font-dmmono text-[10px] text-muted">
                {JSON.stringify(evalItem.eval_input, null, 2)}
              </pre>
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

export default function EvalsPage() {
  const endpoint = useStore((s) => s.selectedEndpoint)
  const authToken = useStore((s) => s.authToken)

  const {
    evals,
    pagination,
    selectedEval,
    filterType,
    isLoading,
    isRunning,
    isRunDialogOpen,
    setEvals,
    setPagination,
    setSelectedEval,
    setFilterType,
    setIsLoading,
    setIsRunning,
    setIsRunDialogOpen,
    setError
  } = useEvalsStore()

  const pageRef = useRef(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const fetchEvals = useCallback(
    async (page = 1, evalType?: string) => {
      if (!endpoint) return
      setIsLoading(true)
      try {
        const params: {
          page: number
          limit: number
          eval_type?: string
        } = { page, limit: 20 }
        if (evalType && evalType !== 'all') params.eval_type = evalType
        const res = await getEvalRunsAPI(
          endpoint,
          params,
          authToken || undefined
        )
        if (res) {
          setEvals(res.data)
          setPagination(res.meta)
          pageRef.current = page
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch')
      } finally {
        setIsLoading(false)
      }
    },
    [endpoint, authToken, setEvals, setPagination, setIsLoading, setError]
  )

  useEffect(() => {
    fetchEvals(1, filterType)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, authToken])

  const handleFilterChange = useCallback(
    (t: EvalType | 'all') => {
      setFilterType(t)
      setSelected(new Set())
      fetchEvals(1, t)
    },
    [setFilterType, fetchEvals]
  )

  const handleDelete = useCallback(
    async (ids: string[]) => {
      if (!endpoint || ids.length === 0) return
      const ok = await deleteEvalRunsAPI(
        endpoint,
        { eval_run_ids: ids },
        undefined,
        authToken || undefined
      )
      if (ok !== null) {
        toast.success(`Deleted ${ids.length} eval(s)`)
        setSelected(new Set())
        setSelectedEval(null)
        fetchEvals(pageRef.current, filterType)
      }
    },
    [endpoint, authToken, filterType, setSelectedEval, fetchEvals]
  )

  const handleRun = useCallback(
    async (data: {
      eval_type: EvalType
      input: string
      name?: string
      expected_output?: string
      criteria?: string
      scoring_strategy?: 'numeric' | 'binary'
      num_iterations?: number
      expected_tool_calls?: string[]
    }) => {
      if (!endpoint) return
      setIsRunning(true)
      try {
        const res = await runEvalAPI(
          endpoint,
          data,
          undefined,
          authToken || undefined
        )
        if (res) {
          toast.success('Eval completed')
          setIsRunDialogOpen(false)
          fetchEvals(1, filterType)
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Eval failed')
      } finally {
        setIsRunning(false)
      }
    },
    [
      endpoint,
      authToken,
      filterType,
      setIsRunning,
      setIsRunDialogOpen,
      fetchEvals
    ]
  )

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Detail view
  if (selectedEval) {
    return (
      <EvalDetail
        evalItem={selectedEval}
        onBack={() => setSelectedEval(null)}
        onDelete={() => handleDelete([selectedEval.id])}
      />
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-semibold text-primary">Evals</h1>
          <div className="flex items-center gap-1">
            {EVAL_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => handleFilterChange(t.value)}
                className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                  filterType === t.value
                    ? 'bg-primary text-primaryAccent'
                    : 'text-muted hover:bg-accent hover:text-primary'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button
              onClick={() => handleDelete(Array.from(selected))}
              className="flex items-center gap-1.5 rounded border border-red-800 px-3 py-1 text-xs text-red-400 hover:bg-red-900/20"
            >
              <Trash2 size={11} />
              Delete ({selected.size})
            </button>
          )}
          <button
            onClick={() => setIsRunDialogOpen(true)}
            className="flex items-center gap-1.5 rounded bg-primary px-3 py-1 text-xs font-medium text-primaryAccent hover:opacity-90"
          >
            <Plus size={12} />
            Run Eval
          </button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex flex-col gap-2 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded" />
          ))}
        </div>
      ) : evals.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-xs text-muted">
          No evaluation runs found
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <Table>
            <TableHeader>
              <TableRow className="border-border text-xs hover:bg-transparent">
                <TableHead className="w-[40px]" />
                <TableHead>Name</TableHead>
                <TableHead className="w-[120px]">Type</TableHead>
                <TableHead className="w-[100px]">Result</TableHead>
                <TableHead>Model</TableHead>
                <TableHead className="w-[130px]">Created</TableHead>
                <TableHead className="w-[60px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evals.map((ev) => (
                <TableRow key={ev.id} className="border-border text-xs">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selected.has(ev.id)}
                      onChange={() => toggleSelect(ev.id)}
                      className="h-3 w-3 rounded border-border"
                    />
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => setSelectedEval(ev)}
                      className="font-medium text-primary hover:underline"
                    >
                      {ev.name || ev.id.slice(0, 12)}
                    </button>
                    {ev.evaluated_component_name && (
                      <p className="text-[10px] text-muted">
                        {ev.evaluated_component_name}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={evalTypeVariant(ev.eval_type)}
                      className="text-[10px]"
                    >
                      {ev.eval_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-dmmono text-muted">
                    {extractResult(ev.eval_data)}
                  </TableCell>
                  <TableCell className="text-muted">
                    {ev.model_id || '-'}
                  </TableCell>
                  <TableCell className="text-muted">
                    {formatTs(ev.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => handleDelete([ev.id])}
                      className="rounded p-1 text-muted hover:bg-red-900/20 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationControls
            pagination={pagination}
            onPageChange={(p) => fetchEvals(p, filterType)}
          />
        </ScrollArea>
      )}

      <RunEvalDialog
        open={isRunDialogOpen}
        onOpenChange={setIsRunDialogOpen}
        isRunning={isRunning}
        onRun={handleRun}
      />
    </div>
  )
}

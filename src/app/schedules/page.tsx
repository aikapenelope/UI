'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useStore } from '@/store'
import { useSchedulesStore } from '@/stores/schedulesStore'
import {
  getSchedulesAPI,
  deleteScheduleAPI,
  enableScheduleAPI,
  disableScheduleAPI,
  triggerScheduleAPI,
  getScheduleRunsAPI,
  createScheduleAPI
} from '@/api/schedules'
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
  Play,
  Pause,
  Trash2,
  Zap,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import type {
  ScheduleResponse,
  ScheduleRunResponse,
  PaginationInfo
} from '@/types/agentOS'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTs(epoch?: number | null): string {
  if (!epoch) return '-'
  return new Date(epoch * 1000).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function runStatusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'completed':
      return 'default'
    case 'running':
    case 'pending':
      return 'secondary'
    case 'failed':
    case 'error':
      return 'destructive'
    default:
      return 'outline'
  }
}

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
// Create dialog
// ---------------------------------------------------------------------------

function ScheduleCreateDialog({
  open,
  onOpenChange,
  onSave,
  isSaving
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onSave: (data: {
    name: string
    cron_expr: string
    endpoint: string
    method: string
    description?: string
  }) => void
  isSaving: boolean
}) {
  const [name, setName] = useState('')
  const [cron, setCron] = useState('')
  const [endpoint, setEndpoint] = useState('')
  const [method, setMethod] = useState('POST')
  const [desc, setDesc] = useState('')

  const handleSubmit = () => {
    if (!name.trim() || !cron.trim() || !endpoint.trim()) return
    onSave({
      name: name.trim(),
      cron_expr: cron.trim(),
      endpoint: endpoint.trim(),
      method,
      description: desc.trim() || undefined
    })
    setName('')
    setCron('')
    setEndpoint('')
    setMethod('POST')
    setDesc('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-[#111113] sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-primary">
            Create Schedule
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          {[
            { label: 'Name', value: name, set: setName, ph: 'my-schedule' },
            {
              label: 'Cron Expression',
              value: cron,
              set: setCron,
              ph: '0 */6 * * *'
            },
            {
              label: 'Endpoint',
              value: endpoint,
              set: setEndpoint,
              ph: '/api/v1/run'
            }
          ].map((f) => (
            <div key={f.label} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted">
                {f.label}
              </label>
              <input
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                placeholder={f.ph}
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            >
              {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">
              Description (optional)
            </label>
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Brief description"
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
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
            disabled={
              !name.trim() || !cron.trim() || !endpoint.trim() || isSaving
            }
            className="rounded bg-primary px-4 py-1.5 text-xs font-medium text-primaryAccent hover:opacity-90 disabled:opacity-40"
          >
            {isSaving ? 'Creating...' : 'Create'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Runs panel
// ---------------------------------------------------------------------------

function RunsPanel({
  schedule,
  runs,
  pagination,
  isLoading,
  onBack,
  onPageChange
}: {
  schedule: ScheduleResponse
  runs: ScheduleRunResponse[]
  pagination: PaginationInfo | null
  isLoading: boolean
  onBack: () => void
  onPageChange: (page: number) => void
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-4 py-2">
        <button
          onClick={onBack}
          className="rounded p-1 text-muted hover:bg-accent hover:text-primary"
        >
          <ArrowLeft size={14} />
        </button>
        <span className="text-xs font-semibold text-primary">
          Runs: {schedule.name}
        </span>
        <Badge variant="secondary" className="text-[10px]">
          {schedule.cron_expr}
        </Badge>
      </div>
      {isLoading ? (
        <div className="flex flex-col gap-2 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 rounded" />
          ))}
        </div>
      ) : runs.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-xs text-muted">
          No runs yet
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <Table>
            <TableHeader>
              <TableRow className="border-border text-xs hover:bg-transparent">
                <TableHead>Status</TableHead>
                <TableHead>Attempt</TableHead>
                <TableHead>Triggered</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((r) => (
                <TableRow key={r.id} className="border-border text-xs">
                  <TableCell>
                    <Badge
                      variant={runStatusVariant(r.status)}
                      className="text-[10px]"
                    >
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-dmmono">{r.attempt}</TableCell>
                  <TableCell className="text-muted">
                    {formatTs(r.triggered_at)}
                  </TableCell>
                  <TableCell className="text-muted">
                    {formatTs(r.completed_at)}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted">
                    {r.error || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationControls
            pagination={pagination}
            onPageChange={onPageChange}
          />
        </ScrollArea>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SchedulesPage() {
  const endpoint = useStore((s) => s.selectedEndpoint)
  const authToken = useStore((s) => s.authToken)

  const {
    schedules,
    pagination,
    selectedSchedule,
    runs,
    runsPagination,
    isCreateDialogOpen,
    isLoading,
    isLoadingRuns,
    setSchedules,
    setPagination,
    setSelectedSchedule,
    setRuns,
    setRunsPagination,
    setIsCreateDialogOpen,
    setIsLoading,
    setIsLoadingRuns,
    setError
  } = useSchedulesStore()

  const pageRef = useRef(1)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch schedules
  const fetchSchedules = useCallback(
    async (page = 1) => {
      if (!endpoint) return
      setIsLoading(true)
      try {
        const res = await getSchedulesAPI(
          endpoint,
          { page, limit: 20 },
          authToken || undefined
        )
        if (res) {
          setSchedules(res.data)
          setPagination(res.meta)
          pageRef.current = page
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch')
      } finally {
        setIsLoading(false)
      }
    },
    [endpoint, authToken, setSchedules, setPagination, setIsLoading, setError]
  )

  // Fetch runs for selected schedule
  const fetchRuns = useCallback(
    async (scheduleId: string, page = 1) => {
      if (!endpoint) return
      setIsLoadingRuns(true)
      try {
        const res = await getScheduleRunsAPI(
          endpoint,
          scheduleId,
          { page, limit: 20 },
          authToken || undefined
        )
        if (res) {
          setRuns(res.data)
          setRunsPagination(res.meta)
        }
      } catch {
        // Non-critical
      } finally {
        setIsLoadingRuns(false)
      }
    },
    [endpoint, authToken, setRuns, setRunsPagination, setIsLoadingRuns]
  )

  useEffect(() => {
    fetchSchedules(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, authToken])

  // Actions
  const handleToggle = useCallback(
    async (s: ScheduleResponse) => {
      if (!endpoint) return
      const fn = s.enabled ? disableScheduleAPI : enableScheduleAPI
      const res = await fn(endpoint, s.id, authToken || undefined)
      if (res) {
        toast.success(s.enabled ? 'Disabled' : 'Enabled')
        fetchSchedules(pageRef.current)
      }
    },
    [endpoint, authToken, fetchSchedules]
  )

  const handleTrigger = useCallback(
    async (id: string) => {
      if (!endpoint) return
      const res = await triggerScheduleAPI(endpoint, id, authToken || undefined)
      if (res) toast.success('Triggered')
    },
    [endpoint, authToken]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      if (!endpoint) return
      const ok = await deleteScheduleAPI(endpoint, id, authToken || undefined)
      if (ok) {
        toast.success('Deleted')
        fetchSchedules(pageRef.current)
      }
    },
    [endpoint, authToken, fetchSchedules]
  )

  const handleCreate = useCallback(
    async (data: {
      name: string
      cron_expr: string
      endpoint: string
      method: string
      description?: string
    }) => {
      if (!endpoint) return
      setIsSaving(true)
      try {
        const res = await createScheduleAPI(
          endpoint,
          data,
          authToken || undefined
        )
        if (res) {
          toast.success('Schedule created')
          setIsCreateDialogOpen(false)
          fetchSchedules(1)
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Create failed')
      } finally {
        setIsSaving(false)
      }
    },
    [endpoint, authToken, fetchSchedules, setIsCreateDialogOpen]
  )

  const handleViewRuns = useCallback(
    (s: ScheduleResponse) => {
      setSelectedSchedule(s)
      fetchRuns(s.id, 1)
    },
    [setSelectedSchedule, fetchRuns]
  )

  // Runs view
  if (selectedSchedule) {
    return (
      <RunsPanel
        schedule={selectedSchedule}
        runs={runs}
        pagination={runsPagination}
        isLoading={isLoadingRuns}
        onBack={() => setSelectedSchedule(null)}
        onPageChange={(p) => fetchRuns(selectedSchedule.id, p)}
      />
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <h1 className="text-sm font-semibold text-primary">Schedules</h1>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-1.5 rounded bg-primary px-3 py-1 text-xs font-medium text-primaryAccent hover:opacity-90"
        >
          <Plus size={12} />
          Create
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded" />
          ))}
        </div>
      ) : schedules.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-xs text-muted">
          No schedules configured
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <Table>
            <TableHeader>
              <TableRow className="border-border text-xs hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead className="w-[120px]">Cron</TableHead>
                <TableHead className="w-[80px]">Method</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead className="w-[80px]">Status</TableHead>
                <TableHead className="w-[130px]">Next Run</TableHead>
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((s) => (
                <TableRow key={s.id} className="border-border text-xs">
                  <TableCell>
                    <button
                      onClick={() => handleViewRuns(s)}
                      className="font-medium text-primary hover:underline"
                    >
                      {s.name}
                    </button>
                    {s.description && (
                      <p className="text-[10px] text-muted">{s.description}</p>
                    )}
                  </TableCell>
                  <TableCell className="font-dmmono text-muted">
                    {s.cron_expr}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {s.method}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-dmmono text-muted">
                    {s.endpoint}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={s.enabled ? 'default' : 'secondary'}
                      className="text-[10px]"
                    >
                      {s.enabled ? 'Active' : 'Paused'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted">
                    {formatTs(s.next_run_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleToggle(s)}
                        className="rounded p-1 text-muted hover:bg-accent hover:text-primary"
                        title={s.enabled ? 'Disable' : 'Enable'}
                      >
                        {s.enabled ? <Pause size={13} /> : <Play size={13} />}
                      </button>
                      <button
                        onClick={() => handleTrigger(s.id)}
                        className="rounded p-1 text-muted hover:bg-accent hover:text-primary"
                        title="Trigger now"
                      >
                        <Zap size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="rounded p-1 text-muted hover:bg-red-900/20 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationControls
            pagination={pagination}
            onPageChange={(p) => fetchSchedules(p)}
          />
        </ScrollArea>
      )}

      <ScheduleCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={handleCreate}
        isSaving={isSaving}
      />
    </div>
  )
}

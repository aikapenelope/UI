'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { useStore } from '@/store'
import { useApprovalsStore, type ApprovalFilter } from '@/stores/approvalsStore'
import {
  getApprovalsAPI,
  getApprovalCountAPI,
  resolveApprovalAPI,
  deleteApprovalAPI
} from '@/api/approvals'
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
  Check,
  X,
  Trash2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'
import type { ApprovalResponse, PaginationInfo } from '@/types/agentOS'

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

function statusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'approved':
      return 'default'
    case 'pending':
      return 'secondary'
    case 'rejected':
      return 'destructive'
    default:
      return 'outline'
  }
}

const FILTERS: { value: ApprovalFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
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
// Resolve dialog
// ---------------------------------------------------------------------------

function ResolveDialog({
  open,
  onOpenChange,
  approval,
  isResolving,
  onResolve
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  approval: ApprovalResponse
  isResolving: boolean
  onResolve: (status: 'approved' | 'rejected', resolvedBy?: string) => void
}) {
  const [resolvedBy, setResolvedBy] = useState('')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-[#111113] sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-primary">
            Resolve Approval
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-muted">Source</span>
              <span className="text-primary">
                {approval.source_name || approval.source_type}
              </span>
            </div>
            {approval.tool_name && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-muted">Tool</span>
                <span className="font-dmmono text-primary">
                  {approval.tool_name}
                </span>
              </div>
            )}
          </div>
          {approval.tool_args && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-muted">Tool Args</span>
              <pre className="max-h-24 overflow-auto rounded border border-border bg-background p-2 font-dmmono text-[10px] text-muted">
                {JSON.stringify(approval.tool_args, null, 2)}
              </pre>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">
              Resolved By (optional)
            </label>
            <input
              value={resolvedBy}
              onChange={(e) => setResolvedBy(e.target.value)}
              placeholder="Your name or ID"
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="rounded border border-border px-4 py-1.5 text-xs text-muted hover:bg-accent hover:text-primary"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onResolve('rejected', resolvedBy.trim() || undefined)
            }
            disabled={isResolving}
            className="flex items-center gap-1.5 rounded border border-red-800 px-4 py-1.5 text-xs font-medium text-red-400 hover:bg-red-900/20 disabled:opacity-40"
          >
            <X size={11} />
            Reject
          </button>
          <button
            onClick={() =>
              onResolve('approved', resolvedBy.trim() || undefined)
            }
            disabled={isResolving}
            className="flex items-center gap-1.5 rounded bg-primary px-4 py-1.5 text-xs font-medium text-primaryAccent hover:opacity-90 disabled:opacity-40"
          >
            <Check size={11} />
            Approve
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Detail panel
// ---------------------------------------------------------------------------

function ApprovalDetail({
  approval,
  onBack,
  onResolve,
  onDelete
}: {
  approval: ApprovalResponse
  onBack: () => void
  onResolve: () => void
  onDelete: () => void
}) {
  const fields: { label: string; value: string }[] = [
    { label: 'ID', value: approval.id },
    { label: 'Run ID', value: approval.run_id },
    { label: 'Session ID', value: approval.session_id },
    { label: 'Source Type', value: approval.source_type },
    { label: 'Source Name', value: approval.source_name || '-' },
    { label: 'Approval Type', value: approval.approval_type || '-' },
    { label: 'Pause Type', value: approval.pause_type || '-' },
    { label: 'Tool', value: approval.tool_name || '-' },
    { label: 'Agent ID', value: approval.agent_id || '-' },
    { label: 'Team ID', value: approval.team_id || '-' },
    { label: 'Workflow ID', value: approval.workflow_id || '-' },
    { label: 'Created', value: formatTs(approval.created_at) },
    { label: 'Expires', value: formatTs(approval.expires_at) },
    { label: 'Resolved By', value: approval.resolved_by || '-' },
    { label: 'Resolved At', value: formatTs(approval.resolved_at) }
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
            Approval Detail
          </span>
          <Badge
            variant={statusVariant(approval.status)}
            className="text-[10px]"
          >
            {approval.status}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {approval.status === 'pending' && (
            <button
              onClick={onResolve}
              className="flex items-center gap-1.5 rounded bg-primary px-3 py-1 text-xs font-medium text-primaryAccent hover:opacity-90"
            >
              Resolve
            </button>
          )}
          <button
            onClick={onDelete}
            className="rounded p-1 text-muted hover:bg-red-900/20 hover:text-red-400"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
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

          {approval.tool_args && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase text-muted">
                Tool Args
              </span>
              <pre className="overflow-auto rounded border border-border bg-background p-3 font-dmmono text-[10px] text-muted">
                {JSON.stringify(approval.tool_args, null, 2)}
              </pre>
            </div>
          )}

          {approval.context && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase text-muted">
                Context
              </span>
              <pre className="overflow-auto rounded border border-border bg-background p-3 font-dmmono text-[10px] text-muted">
                {JSON.stringify(approval.context, null, 2)}
              </pre>
            </div>
          )}

          {approval.resolution_data && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase text-muted">
                Resolution Data
              </span>
              <pre className="overflow-auto rounded border border-border bg-background p-3 font-dmmono text-[10px] text-muted">
                {JSON.stringify(approval.resolution_data, null, 2)}
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

export default function ApprovalsPage() {
  const endpoint = useStore((s) => s.selectedEndpoint)
  const authToken = useStore((s) => s.authToken)

  const {
    approvals,
    pagination,
    filter,
    selectedApproval,
    pendingCount,
    isLoading,
    isResolving,
    setApprovals,
    setPagination,
    setFilter,
    setSelectedApproval,
    setPendingCount,
    setIsLoading,
    setIsResolving,
    setError
  } = useApprovalsStore()

  const pageRef = useRef(1)
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false)

  // Fetch approvals
  const fetchApprovals = useCallback(
    async (page = 1, statusFilter?: string) => {
      if (!endpoint) return
      setIsLoading(true)
      try {
        const params: { page: number; limit: number; status?: string } = {
          page,
          limit: 20
        }
        if (statusFilter && statusFilter !== 'all') {
          params.status = statusFilter
        }
        const res = await getApprovalsAPI(
          endpoint,
          params,
          authToken || undefined
        )
        if (res) {
          setApprovals(res.data)
          setPagination(res.meta)
          pageRef.current = page
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch')
      } finally {
        setIsLoading(false)
      }
    },
    [endpoint, authToken, setApprovals, setPagination, setIsLoading, setError]
  )

  // Fetch pending count
  const fetchCount = useCallback(async () => {
    if (!endpoint) return
    try {
      const res = await getApprovalCountAPI(endpoint, authToken || undefined)
      if (res) setPendingCount(res.count)
    } catch {
      // Non-critical
    }
  }, [endpoint, authToken, setPendingCount])

  useEffect(() => {
    fetchApprovals(1, filter)
    fetchCount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, authToken])

  const handleFilterChange = useCallback(
    (f: ApprovalFilter) => {
      setFilter(f)
      fetchApprovals(1, f)
    },
    [setFilter, fetchApprovals]
  )

  const handleResolve = useCallback(
    async (status: 'approved' | 'rejected', resolvedBy?: string) => {
      if (!endpoint || !selectedApproval) return
      setIsResolving(true)
      try {
        const res = await resolveApprovalAPI(
          endpoint,
          selectedApproval.id,
          { status, resolved_by: resolvedBy },
          authToken || undefined
        )
        if (res) {
          toast.success(status === 'approved' ? 'Approved' : 'Rejected')
          setResolveDialogOpen(false)
          setSelectedApproval(null)
          fetchApprovals(pageRef.current, filter)
          fetchCount()
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Resolve failed')
      } finally {
        setIsResolving(false)
      }
    },
    [
      endpoint,
      authToken,
      selectedApproval,
      filter,
      setIsResolving,
      setSelectedApproval,
      fetchApprovals,
      fetchCount
    ]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      if (!endpoint) return
      const ok = await deleteApprovalAPI(endpoint, id, authToken || undefined)
      if (ok) {
        toast.success('Deleted')
        setSelectedApproval(null)
        fetchApprovals(pageRef.current, filter)
        fetchCount()
      }
    },
    [
      endpoint,
      authToken,
      filter,
      setSelectedApproval,
      fetchApprovals,
      fetchCount
    ]
  )

  // Detail view
  if (selectedApproval) {
    return (
      <>
        <ApprovalDetail
          approval={selectedApproval}
          onBack={() => setSelectedApproval(null)}
          onResolve={() => setResolveDialogOpen(true)}
          onDelete={() => handleDelete(selectedApproval.id)}
        />
        {selectedApproval.status === 'pending' && (
          <ResolveDialog
            open={resolveDialogOpen}
            onOpenChange={setResolveDialogOpen}
            approval={selectedApproval}
            isResolving={isResolving}
            onResolve={handleResolve}
          />
        )}
      </>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-semibold text-primary">Approvals</h1>
          {pendingCount > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              {pendingCount} pending
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleFilterChange(f.value)}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                filter === f.value
                  ? 'bg-primary text-primaryAccent'
                  : 'text-muted hover:bg-accent hover:text-primary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex flex-col gap-2 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded" />
          ))}
        </div>
      ) : approvals.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-xs text-muted">
          No approvals found
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <Table>
            <TableHeader>
              <TableRow className="border-border text-xs hover:bg-transparent">
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Tool</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvals.map((a) => (
                <TableRow key={a.id} className="border-border text-xs">
                  <TableCell>
                    <Badge
                      variant={statusVariant(a.status)}
                      className="text-[10px]"
                    >
                      {a.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => setSelectedApproval(a)}
                      className="font-medium text-primary hover:underline"
                    >
                      {a.source_name || a.source_type}
                    </button>
                  </TableCell>
                  <TableCell className="font-dmmono text-muted">
                    {a.tool_name || '-'}
                  </TableCell>
                  <TableCell className="text-muted">
                    {a.approval_type || '-'}
                  </TableCell>
                  <TableCell className="text-muted">
                    {formatTs(a.created_at)}
                  </TableCell>
                  <TableCell className="text-muted">
                    {formatTs(a.expires_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {a.status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedApproval(a)
                              setResolveDialogOpen(true)
                            }}
                            className="rounded p-1 text-muted hover:bg-accent hover:text-primary"
                            title="Resolve"
                          >
                            <Check size={13} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(a.id)}
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
            onPageChange={(p) => fetchApprovals(p, filter)}
          />
        </ScrollArea>
      )}
    </div>
  )
}

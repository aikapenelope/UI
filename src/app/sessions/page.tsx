'use client'

import { useCallback, useEffect, useState } from 'react'
import { useStore } from '@/store'
import { useSessionsStore } from '@/stores/sessionsStore'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import dayjs from 'dayjs'
import type { SessionType, SessionSchema } from '@/types/agentOS'
import {
  ChevronLeft,
  ChevronRight,
  Edit2,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  Trash2
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Session detail panel
// ---------------------------------------------------------------------------

function SessionDetailPanel({
  session,
  onRename,
  onDelete
}: {
  session: SessionSchema
  onRename: (id: string) => void
  onDelete: (id: string) => void
}) {
  const store = useSessionsStore()
  const detail = store.selectedSession
  const runs = store.selectedSessionRuns
  const loading = store.detailLoading

  if (loading) {
    return (
      <div className="text-muted-foreground flex flex-1 items-center justify-center text-xs">
        <Loader2 size={14} className="mr-2 animate-spin" />
        Loading...
      </div>
    )
  }

  // Extract common fields from the union type
  const chatHistory =
    detail && 'chat_history' in detail ? detail.chat_history : null
  const totalTokens =
    detail && 'total_tokens' in detail
      ? (detail.total_tokens as number | null)
      : null
  const metrics =
    detail && 'metrics' in detail
      ? (detail.metrics as Record<string, unknown> | null)
      : null

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-3 p-3">
        {/* Header */}
        <div>
          <h3 className="text-sm font-semibold text-primary">
            {session.session_name}
          </h3>
          <p className="text-muted-foreground mt-0.5 font-mono text-[10px]">
            {session.session_id}
          </p>
          <div className="text-muted-foreground mt-1 flex items-center gap-2 text-[10px]">
            {session.created_at && (
              <span>
                Created {dayjs(session.created_at).format('MMM D, HH:mm')}
              </span>
            )}
            {session.updated_at && (
              <span>
                Updated {dayjs(session.updated_at).format('MMM D, HH:mm')}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onRename(session.session_id)}
            className="text-muted-foreground flex items-center gap-1 rounded border border-border px-2 py-1 text-[10px] hover:bg-accent hover:text-primary"
          >
            <Edit2 size={10} />
            Rename
          </button>
          <button
            onClick={() => onDelete(session.session_id)}
            className="flex items-center gap-1 rounded border border-[#E53935]/30 px-2 py-1 text-[10px] text-[#E53935] hover:bg-[#E53935]/10"
          >
            <Trash2 size={10} />
            Delete
          </button>
        </div>

        <Separator />

        {/* Metrics */}
        {(totalTokens || metrics) && (
          <>
            <div>
              <h4 className="text-muted-foreground mb-1 text-[11px] font-medium">
                Metrics
              </h4>
              <div className="flex flex-wrap gap-2">
                {totalTokens != null && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-normal"
                  >
                    {totalTokens.toLocaleString()} tokens
                  </Badge>
                )}
                {metrics &&
                  Object.entries(metrics).map(([k, v]) =>
                    k !== 'total_tokens' && v != null ? (
                      <Badge
                        key={k}
                        variant="outline"
                        className="text-[10px] font-normal"
                      >
                        {k}: {String(v)}
                      </Badge>
                    ) : null
                  )}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Runs */}
        {runs.length > 0 && (
          <>
            <div>
              <h4 className="text-muted-foreground mb-1 text-[11px] font-medium">
                Runs ({runs.length})
              </h4>
              <div className="flex flex-col gap-1">
                {runs.map((run) => (
                  <div
                    key={run.run_id}
                    className="rounded border border-border px-2 py-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-primary">
                        {run.run_id.slice(0, 12)}...
                      </span>
                      <Badge
                        variant={
                          run.status === 'completed' ? 'secondary' : 'outline'
                        }
                        className="text-[9px] font-normal"
                      >
                        {run.status || 'unknown'}
                      </Badge>
                    </div>
                    {run.created_at && (
                      <span className="text-muted-foreground text-[9px]">
                        {dayjs(run.created_at).format('MMM D, HH:mm:ss')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Chat history */}
        {chatHistory && chatHistory.length > 0 && (
          <div>
            <h4 className="text-muted-foreground mb-1 text-[11px] font-medium">
              Chat History ({chatHistory.length} messages)
            </h4>
            <div className="flex flex-col gap-1">
              {chatHistory.slice(0, 50).map((msg, i) => {
                const role = String(msg.role ?? 'unknown')
                const content = String(msg.content ?? '')
                return (
                  <div
                    key={String(i)}
                    className="rounded border border-border px-2 py-1"
                  >
                    <Badge
                      variant={role === 'user' ? 'secondary' : 'outline'}
                      className="mb-0.5 text-[9px] font-normal"
                    >
                      {role}
                    </Badge>
                    <p className="text-muted-foreground line-clamp-3 text-[10px]">
                      {content || '(empty)'}
                    </p>
                  </div>
                )
              })}
              {chatHistory.length > 50 && (
                <p className="text-muted-foreground text-center text-[10px]">
                  ... and {chatHistory.length - 50} more messages
                </p>
              )}
            </div>
          </div>
        )}

        {/* State */}
        {detail?.session_state &&
          Object.keys(detail.session_state).length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-muted-foreground mb-1 text-[11px] font-medium">
                  Session State
                </h4>
                <pre className="text-muted-foreground overflow-x-auto rounded bg-accent/50 p-2 text-[10px]">
                  {JSON.stringify(detail.session_state, null, 2)}
                </pre>
              </div>
            </>
          )}
      </div>
    </ScrollArea>
  )
}

// ---------------------------------------------------------------------------
// Sessions page
// ---------------------------------------------------------------------------

export default function SessionsPage() {
  const endpoint = useStore((s) => s.selectedEndpoint)
  const authToken = useStore((s) => s.authToken)

  const store = useSessionsStore()
  const {
    sessions,
    meta,
    loading,
    typeFilter,
    nameFilter,
    page,
    fetchSessions,
    fetchSessionDetail,
    setTypeFilter,
    setNameFilter,
    setPage,
    clearSelection
  } = store

  const [selected, setSelected] = useState<SessionSchema | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState('')
  const [renameName, setRenameName] = useState('')

  const load = useCallback(() => {
    void fetchSessions(endpoint, authToken || undefined)
  }, [endpoint, authToken, fetchSessions])

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, authToken, typeFilter, nameFilter, page])

  const handleSelect = (s: SessionSchema) => {
    setSelected(s)
    void fetchSessionDetail(
      endpoint,
      s.session_id,
      typeFilter,
      undefined,
      authToken || undefined
    )
  }

  const handleSearch = () => {
    setNameFilter(searchInput)
  }

  const handleRename = (id: string) => {
    setRenameTarget(id)
    setRenameName(selected?.session_name ?? '')
    setRenameDialogOpen(true)
  }

  const handleRenameConfirm = async () => {
    const ok = await store.renameSession(
      endpoint,
      renameTarget,
      renameName,
      typeFilter,
      undefined,
      authToken || undefined
    )
    if (ok) {
      toast.success('Session renamed')
      setRenameDialogOpen(false)
      load()
    }
  }

  const handleDelete = async (id: string) => {
    const ok = await store.deleteSession(
      endpoint,
      id,
      typeFilter,
      undefined,
      authToken || undefined
    )
    if (ok) {
      toast.success('Session deleted')
      setSelected(null)
      clearSelection()
      load()
    }
  }

  const totalPages = meta?.total_pages ?? 1

  return (
    <div className="flex h-full">
      {/* Left: session list */}
      <div className="flex flex-1 flex-col overflow-hidden border-r border-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h1 className="text-sm font-semibold text-primary">Sessions</h1>
            <p className="text-muted-foreground text-xs">
              {meta?.total_count ?? sessions.length} session
              {(meta?.total_count ?? sessions.length) !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={load}
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

        {/* Type filter tabs */}
        <div className="border-b border-border px-4 py-2">
          <Tabs
            value={typeFilter}
            onValueChange={(v) => setTypeFilter(v as SessionType)}
          >
            <TabsList className="h-7 bg-transparent p-0">
              {(['agent', 'team', 'workflow'] as SessionType[]).map((t) => (
                <TabsTrigger
                  key={t}
                  value={t}
                  className="h-7 rounded-md px-3 text-[11px] capitalize data-[state=active]:bg-accent"
                >
                  {t}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-2">
          <div className="relative flex-1">
            <Search
              size={12}
              className="text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2"
            />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by name..."
              className="w-full rounded-md border border-border bg-background py-1 pl-7 pr-2 text-xs text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Table */}
        <ScrollArea className="flex-1">
          {loading && sessions.length === 0 ? (
            <div className="text-muted-foreground flex items-center justify-center py-20 text-xs">
              <Loader2 size={16} className="mr-2 animate-spin" />
              Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-muted-foreground py-20 text-center text-xs">
              No sessions found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-[11px] font-medium">
                    Name
                  </TableHead>
                  <TableHead className="text-muted-foreground text-[11px] font-medium">
                    Created
                  </TableHead>
                  <TableHead className="text-muted-foreground text-[11px] font-medium">
                    Updated
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((s) => {
                  const isSelected = selected?.session_id === s.session_id
                  return (
                    <TableRow
                      key={s.session_id}
                      onClick={() => handleSelect(s)}
                      className={`cursor-pointer border-border ${
                        isSelected ? 'bg-accent/50' : 'hover:bg-accent/30'
                      }`}
                    >
                      <TableCell className="py-2">
                        <div className="flex items-center gap-1.5">
                          <MessageSquare
                            size={12}
                            className="text-muted-foreground shrink-0"
                          />
                          <span className="max-w-[250px] truncate text-xs font-medium text-primary">
                            {s.session_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground py-2 text-[11px]">
                        {s.created_at
                          ? dayjs(s.created_at).format('MMM D, HH:mm')
                          : '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground py-2 text-[11px]">
                        {s.updated_at
                          ? dayjs(s.updated_at).format('MMM D, HH:mm')
                          : '—'}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </ScrollArea>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-2">
            <span className="text-muted-foreground text-[11px]">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="text-muted-foreground rounded border border-border p-1 hover:bg-accent disabled:opacity-30"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="text-muted-foreground rounded border border-border p-1 hover:bg-accent disabled:opacity-30"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right: detail panel */}
      <div className="hidden w-[360px] shrink-0 flex-col overflow-hidden lg:flex">
        {selected ? (
          <SessionDetailPanel
            session={selected}
            onRename={handleRename}
            onDelete={(id) => void handleDelete(id)}
          />
        ) : (
          <div className="text-muted-foreground flex flex-1 items-center justify-center text-xs">
            Select a session to view details
          </div>
        )}
      </div>

      {/* Rename dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="border-border bg-[#111113] sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold text-primary">
              Rename Session
            </DialogTitle>
          </DialogHeader>
          <input
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
            onKeyDown={(e) => e.key === 'Enter' && void handleRenameConfirm()}
          />
          <DialogFooter>
            <button
              onClick={() => setRenameDialogOpen(false)}
              className="rounded border border-border px-4 py-1.5 text-xs text-muted hover:bg-accent hover:text-primary"
            >
              Cancel
            </button>
            <button
              onClick={() => void handleRenameConfirm()}
              className="rounded bg-primary px-4 py-1.5 text-xs font-medium text-primaryAccent hover:opacity-90"
            >
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

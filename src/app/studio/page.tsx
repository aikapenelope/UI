'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { useStore } from '@/store'
import { useStudioStore, type StudioTab } from '@/stores/studioStore'
import {
  listComponentsAPI,
  createComponentAPI,
  deleteComponentAPI,
  listConfigsAPI,
  setCurrentConfigAPI,
  deleteConfigVersionAPI
} from '@/api/components'
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
  Star
} from 'lucide-react'
import { toast } from 'sonner'
import type {
  ComponentResponse,
  ComponentConfigResponse,
  ComponentType,
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

function typeVariant(t: ComponentType): 'default' | 'secondary' | 'outline' {
  switch (t) {
    case 'agent':
      return 'default'
    case 'team':
      return 'secondary'
    case 'workflow':
      return 'outline'
    default:
      return 'outline'
  }
}

const TABS: { value: StudioTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'agent', label: 'Agents' },
  { value: 'team', label: 'Teams' },
  { value: 'workflow', label: 'Workflows' }
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
// Create dialog
// ---------------------------------------------------------------------------

function CreateComponentDialog({
  open,
  onOpenChange,
  isSaving,
  onSave
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  isSaving: boolean
  onSave: (data: {
    name: string
    component_type: ComponentType
    description?: string
  }) => void
}) {
  const [name, setName] = useState('')
  const [compType, setCompType] = useState<ComponentType>('agent')
  const [desc, setDesc] = useState('')

  const handleSubmit = () => {
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      component_type: compType,
      description: desc.trim() || undefined
    })
    setName('')
    setDesc('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-[#111113] sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-primary">
            Create Component
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my-agent"
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">Type</label>
            <select
              value={compType}
              onChange={(e) => setCompType(e.target.value as ComponentType)}
              className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs text-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            >
              <option value="agent">Agent</option>
              <option value="team">Team</option>
              <option value="workflow">Workflow</option>
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
            disabled={!name.trim() || isSaving}
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
// Config detail panel
// ---------------------------------------------------------------------------

function ComponentDetail({
  component,
  configs,
  isLoadingConfigs,
  onBack,
  onDelete,
  onSetCurrent,
  onDeleteConfig
}: {
  component: ComponentResponse
  configs: ComponentConfigResponse[]
  isLoadingConfigs: boolean
  onBack: () => void
  onDelete: () => void
  onSetCurrent: (version: number) => void
  onDeleteConfig: (version: number) => void
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
            {component.name || component.component_id}
          </span>
          <Badge
            variant={typeVariant(component.component_type)}
            className="text-[10px]"
          >
            {component.component_type}
          </Badge>
        </div>
        <button
          onClick={onDelete}
          className="rounded p-1 text-muted hover:bg-red-900/20 hover:text-red-400"
          title="Delete component"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 p-4">
          {/* Metadata */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'ID', value: component.component_id },
              {
                label: 'Current Version',
                value:
                  component.current_version != null
                    ? `v${component.current_version}`
                    : '-'
              },
              { label: 'Created', value: formatTs(component.created_at) }
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

          {component.description && (
            <p className="text-xs text-muted">{component.description}</p>
          )}

          {/* Configs */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-medium uppercase text-muted">
              Config Versions
            </span>
            {isLoadingConfigs ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded" />
                ))}
              </div>
            ) : configs.length === 0 ? (
              <p className="text-xs text-muted">No configs</p>
            ) : (
              configs.map((cfg) => {
                const isCurrent = component.current_version === cfg.version
                return (
                  <div
                    key={cfg.version}
                    className="flex items-start justify-between rounded border border-border p-3"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-dmmono text-xs font-medium text-primary">
                          v{cfg.version}
                        </span>
                        <Badge
                          variant={
                            cfg.stage === 'published' ? 'default' : 'secondary'
                          }
                          className="text-[10px]"
                        >
                          {cfg.stage}
                        </Badge>
                        {isCurrent && (
                          <Badge variant="outline" className="text-[10px]">
                            Current
                          </Badge>
                        )}
                      </div>
                      {cfg.label && (
                        <span className="text-[10px] text-muted">
                          {cfg.label}
                        </span>
                      )}
                      {cfg.notes && (
                        <span className="text-[10px] text-muted">
                          {cfg.notes}
                        </span>
                      )}
                      <span className="text-[10px] text-muted">
                        {formatTs(cfg.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {!isCurrent && (
                        <button
                          onClick={() => onSetCurrent(cfg.version)}
                          className="rounded p-1 text-muted hover:bg-accent hover:text-primary"
                          title="Set as current"
                        >
                          <Star size={13} />
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteConfig(cfg.version)}
                        className="rounded p-1 text-muted hover:bg-red-900/20 hover:text-red-400"
                        title="Delete version"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function StudioPage() {
  const endpoint = useStore((s) => s.selectedEndpoint)
  const authToken = useStore((s) => s.authToken)

  const {
    components,
    pagination,
    selectedComponent,
    configs,
    activeTab,
    isLoading,
    isLoadingConfigs,
    isCreateDialogOpen,
    isSaving,
    setComponents,
    setPagination,
    setSelectedComponent,
    setConfigs,
    setActiveTab,
    setIsLoading,
    setIsLoadingConfigs,
    setIsCreateDialogOpen,
    setIsSaving,
    setError
  } = useStudioStore()

  const pageRef = useRef(1)

  const fetchComponents = useCallback(
    async (page = 1, compType?: string) => {
      if (!endpoint) return
      setIsLoading(true)
      try {
        const params: {
          page: number
          limit: number
          component_type?: string
        } = { page, limit: 20 }
        if (compType && compType !== 'all') params.component_type = compType
        const res = await listComponentsAPI(
          endpoint,
          params,
          authToken || undefined
        )
        if (res) {
          setComponents(res.data)
          setPagination(res.meta)
          pageRef.current = page
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch')
      } finally {
        setIsLoading(false)
      }
    },
    [endpoint, authToken, setComponents, setPagination, setIsLoading, setError]
  )

  const fetchConfigs = useCallback(
    async (componentId: string) => {
      if (!endpoint) return
      setIsLoadingConfigs(true)
      try {
        const res = await listConfigsAPI(
          endpoint,
          componentId,
          authToken || undefined
        )
        if (res) setConfigs(res)
      } catch {
        // Non-critical
      } finally {
        setIsLoadingConfigs(false)
      }
    },
    [endpoint, authToken, setConfigs, setIsLoadingConfigs]
  )

  useEffect(() => {
    fetchComponents(1, activeTab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, authToken])

  const handleTabChange = useCallback(
    (tab: StudioTab) => {
      setActiveTab(tab)
      fetchComponents(1, tab)
    },
    [setActiveTab, fetchComponents]
  )

  const handleCreate = useCallback(
    async (data: {
      name: string
      component_type: ComponentType
      description?: string
    }) => {
      if (!endpoint) return
      setIsSaving(true)
      try {
        const res = await createComponentAPI(
          endpoint,
          data,
          authToken || undefined
        )
        if (res) {
          toast.success('Component created')
          setIsCreateDialogOpen(false)
          fetchComponents(1, activeTab)
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Create failed')
      } finally {
        setIsSaving(false)
      }
    },
    [
      endpoint,
      authToken,
      activeTab,
      setIsSaving,
      setIsCreateDialogOpen,
      fetchComponents
    ]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      if (!endpoint) return
      const ok = await deleteComponentAPI(endpoint, id, authToken || undefined)
      if (ok) {
        toast.success('Deleted')
        setSelectedComponent(null)
        fetchComponents(pageRef.current, activeTab)
      }
    },
    [endpoint, authToken, activeTab, setSelectedComponent, fetchComponents]
  )

  const handleSetCurrent = useCallback(
    async (version: number) => {
      if (!endpoint || !selectedComponent) return
      const res = await setCurrentConfigAPI(
        endpoint,
        selectedComponent.component_id,
        version,
        authToken || undefined
      )
      if (res) {
        toast.success(`Set v${version} as current`)
        fetchConfigs(selectedComponent.component_id)
        fetchComponents(pageRef.current, activeTab)
      }
    },
    [
      endpoint,
      authToken,
      selectedComponent,
      activeTab,
      fetchConfigs,
      fetchComponents
    ]
  )

  const handleDeleteConfig = useCallback(
    async (version: number) => {
      if (!endpoint || !selectedComponent) return
      const ok = await deleteConfigVersionAPI(
        endpoint,
        selectedComponent.component_id,
        version,
        authToken || undefined
      )
      if (ok) {
        toast.success(`Deleted v${version}`)
        fetchConfigs(selectedComponent.component_id)
      }
    },
    [endpoint, authToken, selectedComponent, fetchConfigs]
  )

  const handleSelectComponent = useCallback(
    (c: ComponentResponse) => {
      setSelectedComponent(c)
      fetchConfigs(c.component_id)
    },
    [setSelectedComponent, fetchConfigs]
  )

  // Detail view
  if (selectedComponent) {
    return (
      <ComponentDetail
        component={selectedComponent}
        configs={configs}
        isLoadingConfigs={isLoadingConfigs}
        onBack={() => setSelectedComponent(null)}
        onDelete={() => handleDelete(selectedComponent.component_id)}
        onSetCurrent={handleSetCurrent}
        onDeleteConfig={handleDeleteConfig}
      />
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-semibold text-primary">Studio</h1>
          <div className="flex items-center gap-1">
            {TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => handleTabChange(t.value)}
                className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                  activeTab === t.value
                    ? 'bg-primary text-primaryAccent'
                    : 'text-muted hover:bg-accent hover:text-primary'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
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
      ) : components.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-xs text-muted">
          No components found
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <Table>
            <TableHeader>
              <TableRow className="border-border text-xs hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead className="w-[80px]">Version</TableHead>
                <TableHead className="w-[130px]">Created</TableHead>
                <TableHead className="w-[60px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {components.map((c) => (
                <TableRow
                  key={c.component_id}
                  className="border-border text-xs"
                >
                  <TableCell>
                    <button
                      onClick={() => handleSelectComponent(c)}
                      className="font-medium text-primary hover:underline"
                    >
                      {c.name || c.component_id}
                    </button>
                    {c.description && (
                      <p className="text-[10px] text-muted">{c.description}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={typeVariant(c.component_type)}
                      className="text-[10px]"
                    >
                      {c.component_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-dmmono text-muted">
                    {c.current_version != null ? `v${c.current_version}` : '-'}
                  </TableCell>
                  <TableCell className="text-muted">
                    {formatTs(c.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => handleDelete(c.component_id)}
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
            onPageChange={(p) => fetchComponents(p, activeTab)}
          />
        </ScrollArea>
      )}

      <CreateComponentDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        isSaving={isSaving}
        onSave={handleCreate}
      />
    </div>
  )
}

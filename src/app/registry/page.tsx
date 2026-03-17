'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useStore } from '@/store'
import { useRegistryStore, type RegistryFilter } from '@/stores/registryStore'
import { listRegistryAPI } from '@/api/registry'
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
import { ArrowLeft, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import type {
  RegistryContentResponse,
  RegistryResourceType,
  PaginationInfo
} from '@/types/agentOS'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function typeVariant(
  t: RegistryResourceType
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (t) {
    case 'tool':
      return 'default'
    case 'model':
      return 'secondary'
    case 'agent':
    case 'team':
      return 'outline'
    case 'db':
    case 'vector_db':
      return 'destructive'
    default:
      return 'outline'
  }
}

const FILTERS: { value: RegistryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'tool', label: 'Tools' },
  { value: 'model', label: 'Models' },
  { value: 'db', label: 'DBs' },
  { value: 'vector_db', label: 'Vector DBs' },
  { value: 'schema', label: 'Schemas' },
  { value: 'function', label: 'Functions' },
  { value: 'agent', label: 'Agents' },
  { value: 'team', label: 'Teams' }
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
        Page {page} of {pagination.total_pages} ({pagination.total_count} total)
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
// Detail panel
// ---------------------------------------------------------------------------

function ResourceDetail({
  resource,
  onBack
}: {
  resource: RegistryContentResponse
  onBack: () => void
}) {
  const meta = resource.metadata as Record<string, unknown> | null

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
          {resource.name}
        </span>
        <Badge variant={typeVariant(resource.type)} className="text-[10px]">
          {resource.type}
        </Badge>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 p-4">
          {resource.description && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase text-muted">
                Description
              </span>
              <p className="text-xs text-primary">{resource.description}</p>
            </div>
          )}

          {resource.id && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-medium uppercase text-muted">
                ID
              </span>
              <span className="font-dmmono text-xs text-primary">
                {resource.id}
              </span>
            </div>
          )}

          {meta && Object.keys(meta).length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-medium uppercase text-muted">
                Metadata
              </span>

              {/* Render known fields inline */}
              {typeof meta.class_path === 'string' && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-muted">Class Path</span>
                  <span className="font-dmmono text-xs text-primary">
                    {String(meta.class_path)}
                  </span>
                </div>
              )}
              {typeof meta.provider === 'string' && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-muted">Provider</span>
                  <span className="text-xs text-primary">
                    {String(meta.provider)}
                  </span>
                </div>
              )}
              {typeof meta.model_id === 'string' && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-muted">Model ID</span>
                  <span className="font-dmmono text-xs text-primary">
                    {String(meta.model_id)}
                  </span>
                </div>
              )}

              {/* Functions list for toolkits */}
              {Array.isArray(meta.functions) &&
              (meta.functions as Record<string, unknown>[]).length > 0 ? (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted">
                    Functions (
                    {(meta.functions as Record<string, unknown>[]).length})
                  </span>
                  {(meta.functions as Record<string, unknown>[]).map(
                    (fn, i) => (
                      <div key={i} className="rounded border border-border p-2">
                        <span className="font-dmmono text-xs text-primary">
                          {String(fn.name ?? `fn_${i}`)}
                        </span>
                        {fn.description != null ? (
                          <p className="text-[10px] text-muted">
                            {String(fn.description)}
                          </p>
                        ) : null}
                      </div>
                    )
                  )}
                </div>
              ) : null}

              {/* Schema */}
              {meta.schema != null ? (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted">Schema</span>
                  <pre className="overflow-auto rounded border border-border bg-background p-3 font-dmmono text-[10px] text-muted">
                    {JSON.stringify(meta.schema, null, 2)}
                  </pre>
                </div>
              ) : null}

              {/* Parameters */}
              {meta.parameters != null ? (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted">Parameters</span>
                  <pre className="overflow-auto rounded border border-border bg-background p-3 font-dmmono text-[10px] text-muted">
                    {JSON.stringify(meta.parameters, null, 2)}
                  </pre>
                </div>
              ) : null}

              {/* Full raw metadata */}
              <details className="mt-2">
                <summary className="cursor-pointer text-[10px] text-muted hover:text-primary">
                  Raw metadata
                </summary>
                <pre className="mt-1 overflow-auto rounded border border-border bg-background p-3 font-dmmono text-[10px] text-muted">
                  {JSON.stringify(meta, null, 2)}
                </pre>
              </details>
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

export default function RegistryPage() {
  const endpoint = useStore((s) => s.selectedEndpoint)
  const authToken = useStore((s) => s.authToken)

  const {
    resources,
    pagination,
    selectedResource,
    filter,
    searchQuery,
    isLoading,
    setResources,
    setPagination,
    setSelectedResource,
    setFilter,
    setSearchQuery,
    setIsLoading,
    setError
  } = useRegistryStore()

  const pageRef = useRef(1)

  const fetchResources = useCallback(
    async (page = 1, typeFilter?: string, nameFilter?: string) => {
      if (!endpoint) return
      setIsLoading(true)
      try {
        const params: {
          page: number
          limit: number
          type?: string
          name?: string
        } = { page, limit: 20 }
        if (typeFilter && typeFilter !== 'all') params.type = typeFilter
        if (nameFilter?.trim()) params.name = nameFilter.trim()
        const res = await listRegistryAPI(
          endpoint,
          params,
          authToken || undefined
        )
        if (res) {
          setResources(res.data)
          setPagination(res.meta)
          pageRef.current = page
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch')
      } finally {
        setIsLoading(false)
      }
    },
    [endpoint, authToken, setResources, setPagination, setIsLoading, setError]
  )

  useEffect(() => {
    fetchResources(1, filter, searchQuery)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, authToken])

  const handleFilterChange = useCallback(
    (f: RegistryFilter) => {
      setFilter(f)
      fetchResources(1, f, searchQuery)
    },
    [setFilter, searchQuery, fetchResources]
  )

  const handleSearch = useCallback(() => {
    fetchResources(1, filter, searchQuery)
  }, [filter, searchQuery, fetchResources])

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  // Detail view
  if (selectedResource) {
    return (
      <ResourceDetail
        resource={selectedResource}
        onBack={() => setSelectedResource(null)}
      />
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-semibold text-primary">Registry</h1>
          <div className="flex flex-wrap items-center gap-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => handleFilterChange(f.value)}
                className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
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
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded border border-border px-2 py-1">
            <Search size={12} className="text-muted" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search by name..."
              className="w-32 bg-transparent text-xs text-primary placeholder:text-muted focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex flex-col gap-2 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-xs text-muted">
          No resources found
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <Table>
            <TableHeader>
              <TableRow className="border-border text-xs hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((r, i) => (
                <TableRow
                  key={`${r.type}-${r.name}-${i}`}
                  className="border-border text-xs"
                >
                  <TableCell>
                    <button
                      onClick={() => setSelectedResource(r)}
                      className="font-medium text-primary hover:underline"
                    >
                      {r.name}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={typeVariant(r.type)}
                      className="text-[10px]"
                    >
                      {r.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate text-muted">
                    {r.description || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationControls
            pagination={pagination}
            onPageChange={(p) => fetchResources(p, filter, searchQuery)}
          />
        </ScrollArea>
      )}
    </div>
  )
}

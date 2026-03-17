'use client'

import { useEffect, useCallback } from 'react'
import { useStore } from '@/store'
import { useTracesStore } from '@/stores/tracesStore'
import type { FilterClause } from '@/stores/tracesStore'
import {
  getTracesAPI,
  getTraceAPI,
  getTracesFilterSchemaAPI,
  searchTracesAPI
} from '@/api/traces'
import type { TraceNode, TraceSummary } from '@/types/agentOS'
import TraceListTable from '@/components/traces/TraceListTable'
import TraceFilterBar from '@/components/traces/TraceFilterBar'
import TraceDetailPanel from '@/components/traces/TraceDetailPanel'
import SpanDetail from '@/components/traces/SpanDetail'
import { toast } from 'sonner'

// ---------------------------------------------------------------------------
// Build FilterExpr DSL from UI clauses
// ---------------------------------------------------------------------------

function buildFilterExpr(
  clauses: FilterClause[]
): Record<string, unknown> | null {
  const valid = clauses.filter((c) => c.value.trim() !== '')
  if (valid.length === 0) return null
  if (valid.length === 1) {
    const c = valid[0]
    return { op: c.operator, key: c.key, value: c.value }
  }
  return {
    op: 'AND',
    conditions: valid.map((c) => ({
      op: c.operator,
      key: c.key,
      value: c.value
    }))
  }
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function TracesPage() {
  const endpoint = useStore((s) => s.selectedEndpoint)
  const authToken = useStore((s) => s.authToken)

  const {
    traces,
    selectedTrace,
    selectedSpan,
    filterSchema,
    pagination,
    filterClauses,
    isLoadingList,
    isLoadingDetail,
    isLoadingSchema,
    setTraces,
    setSelectedTrace,
    setSelectedSpan,
    setFilterSchema,
    setPagination,
    addFilterClause,
    updateFilterClause,
    removeFilterClause,
    clearFilters,
    setIsLoadingList,
    setIsLoadingDetail,
    setIsLoadingSchema,
    setError
  } = useTracesStore()

  // -----------------------------------------------------------------------
  // Fetch trace list (initial load + pagination)
  // -----------------------------------------------------------------------

  const fetchTraces = useCallback(
    async (page = 1) => {
      if (!endpoint) return
      setIsLoadingList(true)
      setError(null)
      try {
        const res = await getTracesAPI(
          endpoint,
          { page, limit: 20 },
          authToken || undefined
        )
        if (res) {
          setTraces(res.data)
          setPagination(res.meta)
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Failed to fetch traces'
        setError(msg)
        toast.error(msg)
      } finally {
        setIsLoadingList(false)
      }
    },
    [endpoint, authToken, setTraces, setPagination, setIsLoadingList, setError]
  )

  // -----------------------------------------------------------------------
  // Fetch filter schema
  // -----------------------------------------------------------------------

  const fetchFilterSchema = useCallback(async () => {
    if (!endpoint) return
    setIsLoadingSchema(true)
    try {
      const schema = await getTracesFilterSchemaAPI(
        endpoint,
        authToken || undefined
      )
      if (schema) setFilterSchema(schema)
    } catch {
      // Non-critical: filter bar just won't render
    } finally {
      setIsLoadingSchema(false)
    }
  }, [endpoint, authToken, setFilterSchema, setIsLoadingSchema])

  // -----------------------------------------------------------------------
  // Fetch single trace detail
  // -----------------------------------------------------------------------

  const fetchTraceDetail = useCallback(
    async (traceId: string) => {
      if (!endpoint) return
      setIsLoadingDetail(true)
      setSelectedSpan(null)
      try {
        const detail = await getTraceAPI(
          endpoint,
          traceId,
          undefined,
          authToken || undefined
        )
        if (detail) setSelectedTrace(detail)
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Failed to fetch trace detail'
        toast.error(msg)
      } finally {
        setIsLoadingDetail(false)
      }
    },
    [endpoint, authToken, setSelectedTrace, setSelectedSpan, setIsLoadingDetail]
  )

  // -----------------------------------------------------------------------
  // Apply filters (search API)
  // -----------------------------------------------------------------------

  const applyFilters = useCallback(async () => {
    if (!endpoint) return
    const filterExpr = buildFilterExpr(filterClauses)
    if (!filterExpr) {
      // No active filters -- fall back to regular list
      fetchTraces(1)
      return
    }
    setIsLoadingList(true)
    setError(null)
    try {
      const res = await searchTracesAPI(
        endpoint,
        { filter: filterExpr, group_by: 'run', page: 1, limit: 20 },
        undefined,
        authToken || undefined
      )
      if (res) {
        // Search returns TraceSummary[] or TraceSessionStats[] depending on group_by.
        // We use group_by=run so data is TraceSummary[].
        setTraces(res.data as TraceSummary[])
        setPagination(res.meta)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to search traces'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoadingList(false)
    }
  }, [
    endpoint,
    authToken,
    filterClauses,
    fetchTraces,
    setTraces,
    setPagination,
    setIsLoadingList,
    setError
  ])

  // -----------------------------------------------------------------------
  // Initial load
  // -----------------------------------------------------------------------

  useEffect(() => {
    fetchTraces()
    fetchFilterSchema()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, authToken])

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  const handleSelectTrace = useCallback(
    (traceId: string) => {
      fetchTraceDetail(traceId)
    },
    [fetchTraceDetail]
  )

  const handleSelectSpan = useCallback(
    (span: TraceNode) => {
      setSelectedSpan(span)
    },
    [setSelectedSpan]
  )

  const handleCloseDetail = useCallback(() => {
    setSelectedTrace(null)
    setSelectedSpan(null)
  }, [setSelectedTrace, setSelectedSpan])

  const handleCloseSpan = useCallback(() => {
    setSelectedSpan(null)
  }, [setSelectedSpan])

  const handlePageChange = useCallback(
    (page: number) => {
      if (filterClauses.length > 0) {
        // Re-run search with new page -- for now refetch from page 1
        // (full pagination on search would need storing current page in store)
        fetchTraces(page)
      } else {
        fetchTraces(page)
      }
    },
    [filterClauses, fetchTraces]
  )

  const handleClearFilters = useCallback(() => {
    clearFilters()
    fetchTraces(1)
  }, [clearFilters, fetchTraces])

  // -----------------------------------------------------------------------
  // Layout
  // -----------------------------------------------------------------------

  return (
    <div className="flex h-full flex-col">
      {/* Filter bar */}
      {!isLoadingSchema && (
        <TraceFilterBar
          schema={filterSchema}
          clauses={filterClauses}
          onAdd={addFilterClause}
          onUpdate={updateFilterClause}
          onRemove={removeFilterClause}
          onClear={handleClearFilters}
          onApply={applyFilters}
          isLoading={isLoadingList}
        />
      )}

      {/* Main content: list + detail + span */}
      <div className="flex flex-1 overflow-hidden">
        {/* Trace list (left panel) */}
        <div
          className={`shrink-0 overflow-hidden border-r border-border transition-all ${
            selectedTrace ? 'w-[380px]' : 'w-full'
          }`}
        >
          <TraceListTable
            traces={traces}
            pagination={pagination}
            isLoading={isLoadingList}
            selectedTraceId={selectedTrace?.trace_id ?? null}
            onSelectTrace={handleSelectTrace}
            onPageChange={handlePageChange}
          />
        </div>

        {/* Trace detail (middle panel) */}
        {selectedTrace !== null && (
          <div
            className={`shrink-0 overflow-hidden transition-all ${
              selectedSpan ? 'w-[320px]' : 'flex-1'
            }`}
          >
            <TraceDetailPanel
              trace={selectedTrace}
              isLoading={isLoadingDetail}
              selectedSpanId={selectedSpan?.id ?? null}
              onSelectSpan={handleSelectSpan}
              onClose={handleCloseDetail}
            />
          </div>
        )}

        {/* Span detail (right panel) */}
        {selectedSpan !== null && (
          <div className="min-w-[300px] flex-1 overflow-hidden">
            <SpanDetail span={selectedSpan} onClose={handleCloseSpan} />
          </div>
        )}
      </div>
    </div>
  )
}

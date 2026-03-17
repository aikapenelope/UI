'use client'

import { useEffect, useCallback } from 'react'
import { useStore } from '@/store'
import {
  useMetricsStore,
  presetToDates,
  type DateRangePreset
} from '@/stores/metricsStore'
import { getMetricsAPI, refreshMetricsAPI } from '@/api/metrics'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import MetricsSummaryCards from '@/components/metrics/MetricsSummaryCards'
import MetricsCharts from '@/components/metrics/MetricsCharts'
import ModelUsageTable from '@/components/metrics/ModelUsageTable'

// ---------------------------------------------------------------------------
// Date range selector
// ---------------------------------------------------------------------------

const PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '14d', label: '14 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' }
]

interface DateRangeSelectorProps {
  selected: DateRangePreset
  onChange: (preset: DateRangePreset) => void
}

function DateRangeSelector({ selected, onChange }: DateRangeSelectorProps) {
  return (
    <div className="flex items-center gap-1">
      {PRESETS.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
            selected === p.value
              ? 'bg-primary text-primaryAccent'
              : 'text-muted hover:bg-accent hover:text-primary'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function MetricsPage() {
  const endpoint = useStore((s) => s.selectedEndpoint)
  const authToken = useStore((s) => s.authToken)

  const {
    metrics,
    dateRange,
    isLoading,
    isRefreshing,
    updatedAt,
    setMetrics,
    setDateRange,
    setIsLoading,
    setIsRefreshing,
    setError,
    setUpdatedAt
  } = useMetricsStore()

  // -----------------------------------------------------------------------
  // Fetch metrics
  // -----------------------------------------------------------------------

  const fetchMetrics = useCallback(
    async (range: DateRangePreset) => {
      if (!endpoint) return
      setIsLoading(true)
      setError(null)
      try {
        const dates = presetToDates(range)
        const res = await getMetricsAPI(endpoint, dates, authToken || undefined)
        if (res) {
          setMetrics(res.metrics)
          setUpdatedAt(res.updated_at ?? null)
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Failed to fetch metrics'
        setError(msg)
        toast.error(msg)
      } finally {
        setIsLoading(false)
      }
    },
    [endpoint, authToken, setMetrics, setUpdatedAt, setIsLoading, setError]
  )

  // -----------------------------------------------------------------------
  // Refresh metrics
  // -----------------------------------------------------------------------

  const handleRefresh = useCallback(async () => {
    if (!endpoint) return
    setIsRefreshing(true)
    try {
      await refreshMetricsAPI(endpoint, undefined, authToken || undefined)
      toast.success('Metrics refreshed')
      // Re-fetch after refresh
      await fetchMetrics(dateRange)
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Failed to refresh metrics'
      toast.error(msg)
    } finally {
      setIsRefreshing(false)
    }
  }, [endpoint, authToken, dateRange, fetchMetrics, setIsRefreshing])

  // -----------------------------------------------------------------------
  // Date range change
  // -----------------------------------------------------------------------

  const handleDateRangeChange = useCallback(
    (preset: DateRangePreset) => {
      setDateRange(preset)
      fetchMetrics(preset)
    },
    [setDateRange, fetchMetrics]
  )

  // -----------------------------------------------------------------------
  // Initial load
  // -----------------------------------------------------------------------

  useEffect(() => {
    fetchMetrics(dateRange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, authToken])

  // -----------------------------------------------------------------------
  // Layout
  // -----------------------------------------------------------------------

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-semibold text-primary">Metrics</h1>
          <DateRangeSelector
            selected={dateRange}
            onChange={handleDateRangeChange}
          />
        </div>
        <div className="flex items-center gap-3">
          {updatedAt && (
            <span className="text-[10px] text-muted">
              Updated {new Date(updatedAt).toLocaleString()}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded border border-border px-3 py-1 text-xs text-muted transition-colors hover:bg-accent hover:text-primary disabled:opacity-50"
          >
            <RefreshCw
              size={12}
              className={isRefreshing ? 'animate-spin' : ''}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col gap-4 p-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
          <Skeleton className="h-40 rounded-lg" />
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-4 p-6">
            <MetricsSummaryCards metrics={metrics} />
            <MetricsCharts metrics={metrics} />
            <ModelUsageTable metrics={metrics} />
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

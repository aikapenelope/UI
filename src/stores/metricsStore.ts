import { create } from 'zustand'
import type { DayAggregatedMetrics } from '@/types/agentOS'

// ---------------------------------------------------------------------------
// Date range presets
// ---------------------------------------------------------------------------

export type DateRangePreset = '7d' | '14d' | '30d' | '90d'

export function presetToDates(preset: DateRangePreset): {
  starting_date: string
  ending_date: string
} {
  const end = new Date()
  const start = new Date()
  const days = parseInt(preset, 10)
  start.setDate(end.getDate() - days)
  return {
    starting_date: start.toISOString().slice(0, 10),
    ending_date: end.toISOString().slice(0, 10)
  }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface MetricsState {
  metrics: DayAggregatedMetrics[]
  dateRange: DateRangePreset
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  updatedAt: string | null

  setMetrics: (metrics: DayAggregatedMetrics[]) => void
  setDateRange: (range: DateRangePreset) => void
  setIsLoading: (loading: boolean) => void
  setIsRefreshing: (refreshing: boolean) => void
  setError: (error: string | null) => void
  setUpdatedAt: (updatedAt: string | null) => void
  reset: () => void
}

const initialState = {
  metrics: [] as DayAggregatedMetrics[],
  dateRange: '30d' as DateRangePreset,
  isLoading: false,
  isRefreshing: false,
  error: null as string | null,
  updatedAt: null as string | null
}

export const useMetricsStore = create<MetricsState>()((set) => ({
  ...initialState,

  setMetrics: (metrics) => set({ metrics }),
  setDateRange: (dateRange) => set({ dateRange }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsRefreshing: (isRefreshing) => set({ isRefreshing }),
  setError: (error) => set({ error }),
  setUpdatedAt: (updatedAt) => set({ updatedAt }),
  reset: () => set(initialState)
}))

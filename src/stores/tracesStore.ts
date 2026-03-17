import { create } from 'zustand'
import type {
  TraceSummary,
  TraceDetail,
  TraceNode,
  FilterSchemaResponse,
  PaginationInfo
} from '@/types/agentOS'

// ---------------------------------------------------------------------------
// Filter clause model (used by the filter bar)
// ---------------------------------------------------------------------------

export interface FilterClause {
  id: string
  key: string
  operator: string
  value: string
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface TracesState {
  // Data
  traces: TraceSummary[]
  selectedTrace: TraceDetail | null
  selectedSpan: TraceNode | null
  filterSchema: FilterSchemaResponse | null
  pagination: PaginationInfo | null

  // Filters
  filterClauses: FilterClause[]
  searchText: string

  // UI state
  isLoadingList: boolean
  isLoadingDetail: boolean
  isLoadingSchema: boolean
  error: string | null

  // Actions
  setTraces: (traces: TraceSummary[]) => void
  setSelectedTrace: (trace: TraceDetail | null) => void
  setSelectedSpan: (span: TraceNode | null) => void
  setFilterSchema: (schema: FilterSchemaResponse | null) => void
  setPagination: (pagination: PaginationInfo | null) => void
  setFilterClauses: (clauses: FilterClause[]) => void
  addFilterClause: (clause: FilterClause) => void
  removeFilterClause: (id: string) => void
  updateFilterClause: (id: string, updates: Partial<FilterClause>) => void
  clearFilters: () => void
  setSearchText: (text: string) => void
  setIsLoadingList: (loading: boolean) => void
  setIsLoadingDetail: (loading: boolean) => void
  setIsLoadingSchema: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  traces: [] as TraceSummary[],
  selectedTrace: null as TraceDetail | null,
  selectedSpan: null as TraceNode | null,
  filterSchema: null as FilterSchemaResponse | null,
  pagination: null as PaginationInfo | null,
  filterClauses: [] as FilterClause[],
  searchText: '',
  isLoadingList: false,
  isLoadingDetail: false,
  isLoadingSchema: false,
  error: null as string | null
}

export const useTracesStore = create<TracesState>()((set) => ({
  ...initialState,

  setTraces: (traces) => set({ traces }),
  setSelectedTrace: (trace) => set({ selectedTrace: trace }),
  setSelectedSpan: (span) => set({ selectedSpan: span }),
  setFilterSchema: (schema) => set({ filterSchema: schema }),
  setPagination: (pagination) => set({ pagination }),

  setFilterClauses: (clauses) => set({ filterClauses: clauses }),
  addFilterClause: (clause) =>
    set((s) => ({ filterClauses: [...s.filterClauses, clause] })),
  removeFilterClause: (id) =>
    set((s) => ({
      filterClauses: s.filterClauses.filter((c) => c.id !== id)
    })),
  updateFilterClause: (id, updates) =>
    set((s) => ({
      filterClauses: s.filterClauses.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      )
    })),
  clearFilters: () => set({ filterClauses: [], searchText: '' }),
  setSearchText: (text) => set({ searchText: text }),

  setIsLoadingList: (loading) => set({ isLoadingList: loading }),
  setIsLoadingDetail: (loading) => set({ isLoadingDetail: loading }),
  setIsLoadingSchema: (loading) => set({ isLoadingSchema: loading }),
  setError: (error) => set({ error }),

  reset: () => set(initialState)
}))

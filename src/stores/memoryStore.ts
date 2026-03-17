import { create } from 'zustand'
import type {
  UserMemory,
  UserStats,
  PaginationInfo,
  OptimizeMemoriesResponse
} from '@/types/agentOS'

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface MemoryState {
  // Data
  memories: UserMemory[]
  topics: string[]
  userStats: UserStats[]
  pagination: PaginationInfo | null

  // Filters
  searchText: string
  selectedTopic: string | null
  sortBy: string
  sortOrder: 'asc' | 'desc'

  // Selection (for bulk operations)
  selectedIds: Set<string>

  // Editing
  editingMemory: UserMemory | null
  isCreateDialogOpen: boolean

  // Optimization
  optimizeResult: OptimizeMemoriesResponse | null
  isOptimizeDialogOpen: boolean

  // UI state
  isLoading: boolean
  isLoadingTopics: boolean
  isLoadingStats: boolean
  isSaving: boolean
  isOptimizing: boolean
  error: string | null

  // Actions
  setMemories: (memories: UserMemory[]) => void
  setTopics: (topics: string[]) => void
  setUserStats: (stats: UserStats[]) => void
  setPagination: (pagination: PaginationInfo | null) => void

  setSearchText: (text: string) => void
  setSelectedTopic: (topic: string | null) => void
  setSortBy: (field: string) => void
  setSortOrder: (order: 'asc' | 'desc') => void

  toggleSelected: (id: string) => void
  selectAll: (ids: string[]) => void
  clearSelection: () => void

  setEditingMemory: (memory: UserMemory | null) => void
  setIsCreateDialogOpen: (open: boolean) => void

  setOptimizeResult: (result: OptimizeMemoriesResponse | null) => void
  setIsOptimizeDialogOpen: (open: boolean) => void

  setIsLoading: (loading: boolean) => void
  setIsLoadingTopics: (loading: boolean) => void
  setIsLoadingStats: (loading: boolean) => void
  setIsSaving: (saving: boolean) => void
  setIsOptimizing: (optimizing: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  memories: [] as UserMemory[],
  topics: [] as string[],
  userStats: [] as UserStats[],
  pagination: null as PaginationInfo | null,

  searchText: '',
  selectedTopic: null as string | null,
  sortBy: 'updated_at',
  sortOrder: 'desc' as const,

  selectedIds: new Set<string>(),

  editingMemory: null as UserMemory | null,
  isCreateDialogOpen: false,

  optimizeResult: null as OptimizeMemoriesResponse | null,
  isOptimizeDialogOpen: false,

  isLoading: false,
  isLoadingTopics: false,
  isLoadingStats: false,
  isSaving: false,
  isOptimizing: false,
  error: null as string | null
}

export const useMemoryStore = create<MemoryState>()((set) => ({
  ...initialState,

  setMemories: (memories) => set({ memories }),
  setTopics: (topics) => set({ topics }),
  setUserStats: (stats) => set({ userStats: stats }),
  setPagination: (pagination) => set({ pagination }),

  setSearchText: (searchText) => set({ searchText }),
  setSelectedTopic: (selectedTopic) => set({ selectedTopic }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder }),

  toggleSelected: (id) =>
    set((s) => {
      const next = new Set(s.selectedIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { selectedIds: next }
    }),
  selectAll: (ids) => set({ selectedIds: new Set(ids) }),
  clearSelection: () => set({ selectedIds: new Set<string>() }),

  setEditingMemory: (editingMemory) => set({ editingMemory }),
  setIsCreateDialogOpen: (isCreateDialogOpen) => set({ isCreateDialogOpen }),

  setOptimizeResult: (optimizeResult) => set({ optimizeResult }),
  setIsOptimizeDialogOpen: (isOptimizeDialogOpen) =>
    set({ isOptimizeDialogOpen }),

  setIsLoading: (isLoading) => set({ isLoading }),
  setIsLoadingTopics: (isLoadingTopics) => set({ isLoadingTopics }),
  setIsLoadingStats: (isLoadingStats) => set({ isLoadingStats }),
  setIsSaving: (isSaving) => set({ isSaving }),
  setIsOptimizing: (isOptimizing) => set({ isOptimizing }),
  setError: (error) => set({ error }),
  reset: () => set({ ...initialState, selectedIds: new Set<string>() })
}))

import { create } from 'zustand'
import type {
  ContentResponse,
  KnowledgeConfigResponse,
  VectorSearchResult,
  PaginationInfo
} from '@/types/agentOS'

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export type KnowledgeTab = 'content' | 'search'

interface KnowledgeState {
  // Tab
  activeTab: KnowledgeTab

  // Content list
  contents: ContentResponse[]
  contentPagination: PaginationInfo | null
  config: KnowledgeConfigResponse | null

  // Search
  searchQuery: string
  searchResults: VectorSearchResult[]
  searchPagination: PaginationInfo | null

  // Upload dialog
  isUploadDialogOpen: boolean

  // UI state
  isLoadingContent: boolean
  isLoadingConfig: boolean
  isSearching: boolean
  isUploading: boolean
  error: string | null

  // Actions
  setActiveTab: (tab: KnowledgeTab) => void

  setContents: (contents: ContentResponse[]) => void
  setContentPagination: (pagination: PaginationInfo | null) => void
  setConfig: (config: KnowledgeConfigResponse | null) => void

  setSearchQuery: (query: string) => void
  setSearchResults: (results: VectorSearchResult[]) => void
  setSearchPagination: (pagination: PaginationInfo | null) => void

  setIsUploadDialogOpen: (open: boolean) => void

  setIsLoadingContent: (loading: boolean) => void
  setIsLoadingConfig: (loading: boolean) => void
  setIsSearching: (searching: boolean) => void
  setIsUploading: (uploading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  activeTab: 'content' as KnowledgeTab,

  contents: [] as ContentResponse[],
  contentPagination: null as PaginationInfo | null,
  config: null as KnowledgeConfigResponse | null,

  searchQuery: '',
  searchResults: [] as VectorSearchResult[],
  searchPagination: null as PaginationInfo | null,

  isUploadDialogOpen: false,

  isLoadingContent: false,
  isLoadingConfig: false,
  isSearching: false,
  isUploading: false,
  error: null as string | null
}

export const useKnowledgeStore = create<KnowledgeState>()((set) => ({
  ...initialState,

  setActiveTab: (activeTab) => set({ activeTab }),

  setContents: (contents) => set({ contents }),
  setContentPagination: (contentPagination) => set({ contentPagination }),
  setConfig: (config) => set({ config }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setSearchPagination: (searchPagination) => set({ searchPagination }),

  setIsUploadDialogOpen: (isUploadDialogOpen) => set({ isUploadDialogOpen }),

  setIsLoadingContent: (isLoadingContent) => set({ isLoadingContent }),
  setIsLoadingConfig: (isLoadingConfig) => set({ isLoadingConfig }),
  setIsSearching: (isSearching) => set({ isSearching }),
  setIsUploading: (isUploading) => set({ isUploading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState)
}))

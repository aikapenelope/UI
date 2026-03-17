import { create } from 'zustand'
import type {
  RegistryContentResponse,
  RegistryResourceType,
  PaginationInfo
} from '@/types/agentOS'

export type RegistryFilter = 'all' | RegistryResourceType

interface RegistryState {
  resources: RegistryContentResponse[]
  pagination: PaginationInfo | null
  selectedResource: RegistryContentResponse | null
  filter: RegistryFilter
  searchQuery: string

  isLoading: boolean
  error: string | null

  setResources: (resources: RegistryContentResponse[]) => void
  setPagination: (pagination: PaginationInfo | null) => void
  setSelectedResource: (resource: RegistryContentResponse | null) => void
  setFilter: (filter: RegistryFilter) => void
  setSearchQuery: (query: string) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  resources: [] as RegistryContentResponse[],
  pagination: null as PaginationInfo | null,
  selectedResource: null as RegistryContentResponse | null,
  filter: 'all' as RegistryFilter,
  searchQuery: '',
  isLoading: false,
  error: null as string | null
}

export const useRegistryStore = create<RegistryState>()((set) => ({
  ...initialState,
  setResources: (resources) => set({ resources }),
  setPagination: (pagination) => set({ pagination }),
  setSelectedResource: (selectedResource) => set({ selectedResource }),
  setFilter: (filter) => set({ filter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState)
}))

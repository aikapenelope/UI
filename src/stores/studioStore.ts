import { create } from 'zustand'
import type {
  ComponentResponse,
  ComponentConfigResponse,
  ComponentType,
  PaginationInfo
} from '@/types/agentOS'

export type StudioTab = 'all' | ComponentType

interface StudioState {
  components: ComponentResponse[]
  pagination: PaginationInfo | null
  selectedComponent: ComponentResponse | null
  configs: ComponentConfigResponse[]
  activeTab: StudioTab

  isLoading: boolean
  isLoadingConfigs: boolean
  isCreateDialogOpen: boolean
  isSaving: boolean
  error: string | null

  setComponents: (components: ComponentResponse[]) => void
  setPagination: (pagination: PaginationInfo | null) => void
  setSelectedComponent: (component: ComponentResponse | null) => void
  setConfigs: (configs: ComponentConfigResponse[]) => void
  setActiveTab: (tab: StudioTab) => void
  setIsLoading: (loading: boolean) => void
  setIsLoadingConfigs: (loading: boolean) => void
  setIsCreateDialogOpen: (open: boolean) => void
  setIsSaving: (saving: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  components: [] as ComponentResponse[],
  pagination: null as PaginationInfo | null,
  selectedComponent: null as ComponentResponse | null,
  configs: [] as ComponentConfigResponse[],
  activeTab: 'all' as StudioTab,
  isLoading: false,
  isLoadingConfigs: false,
  isCreateDialogOpen: false,
  isSaving: false,
  error: null as string | null
}

export const useStudioStore = create<StudioState>()((set) => ({
  ...initialState,
  setComponents: (components) => set({ components }),
  setPagination: (pagination) => set({ pagination }),
  setSelectedComponent: (selectedComponent) => set({ selectedComponent }),
  setConfigs: (configs) => set({ configs }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsLoadingConfigs: (isLoadingConfigs) => set({ isLoadingConfigs }),
  setIsCreateDialogOpen: (isCreateDialogOpen) => set({ isCreateDialogOpen }),
  setIsSaving: (isSaving) => set({ isSaving }),
  setError: (error) => set({ error }),
  reset: () => set(initialState)
}))

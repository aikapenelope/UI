import { create } from 'zustand'
import type {
  ScheduleResponse,
  ScheduleRunResponse,
  PaginationInfo
} from '@/types/agentOS'

interface SchedulesState {
  schedules: ScheduleResponse[]
  pagination: PaginationInfo | null
  selectedSchedule: ScheduleResponse | null
  runs: ScheduleRunResponse[]
  runsPagination: PaginationInfo | null

  isCreateDialogOpen: boolean
  isLoading: boolean
  isLoadingRuns: boolean
  error: string | null

  setSchedules: (schedules: ScheduleResponse[]) => void
  setPagination: (pagination: PaginationInfo | null) => void
  setSelectedSchedule: (schedule: ScheduleResponse | null) => void
  setRuns: (runs: ScheduleRunResponse[]) => void
  setRunsPagination: (pagination: PaginationInfo | null) => void
  setIsCreateDialogOpen: (open: boolean) => void
  setIsLoading: (loading: boolean) => void
  setIsLoadingRuns: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  schedules: [] as ScheduleResponse[],
  pagination: null as PaginationInfo | null,
  selectedSchedule: null as ScheduleResponse | null,
  runs: [] as ScheduleRunResponse[],
  runsPagination: null as PaginationInfo | null,
  isCreateDialogOpen: false,
  isLoading: false,
  isLoadingRuns: false,
  error: null as string | null
}

export const useSchedulesStore = create<SchedulesState>()((set) => ({
  ...initialState,
  setSchedules: (schedules) => set({ schedules }),
  setPagination: (pagination) => set({ pagination }),
  setSelectedSchedule: (selectedSchedule) => set({ selectedSchedule }),
  setRuns: (runs) => set({ runs }),
  setRunsPagination: (runsPagination) => set({ runsPagination }),
  setIsCreateDialogOpen: (isCreateDialogOpen) => set({ isCreateDialogOpen }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsLoadingRuns: (isLoadingRuns) => set({ isLoadingRuns }),
  setError: (error) => set({ error }),
  reset: () => set(initialState)
}))

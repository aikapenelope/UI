import { create } from 'zustand'
import type { EvalSchema, PaginationInfo, EvalType } from '@/types/agentOS'

interface EvalsState {
  evals: EvalSchema[]
  pagination: PaginationInfo | null
  selectedEval: EvalSchema | null
  filterType: EvalType | 'all'

  isLoading: boolean
  isRunning: boolean
  isRunDialogOpen: boolean
  error: string | null

  setEvals: (evals: EvalSchema[]) => void
  setPagination: (pagination: PaginationInfo | null) => void
  setSelectedEval: (evalItem: EvalSchema | null) => void
  setFilterType: (filterType: EvalType | 'all') => void
  setIsLoading: (loading: boolean) => void
  setIsRunning: (running: boolean) => void
  setIsRunDialogOpen: (open: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  evals: [] as EvalSchema[],
  pagination: null as PaginationInfo | null,
  selectedEval: null as EvalSchema | null,
  filterType: 'all' as EvalType | 'all',
  isLoading: false,
  isRunning: false,
  isRunDialogOpen: false,
  error: null as string | null
}

export const useEvalsStore = create<EvalsState>()((set) => ({
  ...initialState,
  setEvals: (evals) => set({ evals }),
  setPagination: (pagination) => set({ pagination }),
  setSelectedEval: (selectedEval) => set({ selectedEval }),
  setFilterType: (filterType) => set({ filterType }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsRunning: (isRunning) => set({ isRunning }),
  setIsRunDialogOpen: (isRunDialogOpen) => set({ isRunDialogOpen }),
  setError: (error) => set({ error }),
  reset: () => set(initialState)
}))

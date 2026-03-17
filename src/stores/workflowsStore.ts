import { create } from 'zustand'
import type { WorkflowDetailResponse } from '@/types/agentOS'

interface WorkflowsState {
  workflows: WorkflowDetailResponse[]
  selectedWorkflow: WorkflowDetailResponse | null

  isLoading: boolean
  isRunning: boolean
  error: string | null

  setWorkflows: (workflows: WorkflowDetailResponse[]) => void
  setSelectedWorkflow: (workflow: WorkflowDetailResponse | null) => void
  setIsLoading: (loading: boolean) => void
  setIsRunning: (running: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  workflows: [] as WorkflowDetailResponse[],
  selectedWorkflow: null as WorkflowDetailResponse | null,
  isLoading: false,
  isRunning: false,
  error: null as string | null
}

export const useWorkflowsStore = create<WorkflowsState>()((set) => ({
  ...initialState,
  setWorkflows: (workflows) => set({ workflows }),
  setSelectedWorkflow: (selectedWorkflow) => set({ selectedWorkflow }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsRunning: (isRunning) => set({ isRunning }),
  setError: (error) => set({ error }),
  reset: () => set(initialState)
}))

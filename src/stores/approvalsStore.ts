import { create } from 'zustand'
import type { ApprovalResponse, PaginationInfo } from '@/types/agentOS'

export type ApprovalFilter = 'all' | 'pending' | 'approved' | 'rejected'

interface ApprovalsState {
  approvals: ApprovalResponse[]
  pagination: PaginationInfo | null
  filter: ApprovalFilter
  selectedApproval: ApprovalResponse | null
  pendingCount: number

  isLoading: boolean
  isResolving: boolean
  error: string | null

  setApprovals: (approvals: ApprovalResponse[]) => void
  setPagination: (pagination: PaginationInfo | null) => void
  setFilter: (filter: ApprovalFilter) => void
  setSelectedApproval: (approval: ApprovalResponse | null) => void
  setPendingCount: (count: number) => void
  setIsLoading: (loading: boolean) => void
  setIsResolving: (resolving: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

const initialState = {
  approvals: [] as ApprovalResponse[],
  pagination: null as PaginationInfo | null,
  filter: 'all' as ApprovalFilter,
  selectedApproval: null as ApprovalResponse | null,
  pendingCount: 0,
  isLoading: false,
  isResolving: false,
  error: null as string | null
}

export const useApprovalsStore = create<ApprovalsState>()((set) => ({
  ...initialState,
  setApprovals: (approvals) => set({ approvals }),
  setPagination: (pagination) => set({ pagination }),
  setFilter: (filter) => set({ filter }),
  setSelectedApproval: (selectedApproval) => set({ selectedApproval }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsResolving: (isResolving) => set({ isResolving }),
  setError: (error) => set({ error }),
  reset: () => set(initialState)
}))

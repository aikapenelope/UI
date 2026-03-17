import { create } from 'zustand'
import {
  getSessionsAPI,
  getSessionByIdAPI,
  getSessionRunsAPI,
  renameSessionAPI,
  deleteSessionByIdAPI
} from '@/api/sessions'
import type {
  PaginationInfo,
  SessionSchema,
  SessionDetailSchema,
  RunSchema,
  TeamRunSchema,
  WorkflowRunSchema,
  SessionType
} from '@/types/agentOS'

interface SessionsState {
  sessions: SessionSchema[]
  meta: PaginationInfo | null
  loading: boolean
  selectedSession: SessionDetailSchema | null
  selectedSessionRuns: (RunSchema | TeamRunSchema | WorkflowRunSchema)[]
  detailLoading: boolean
  typeFilter: SessionType
  nameFilter: string
  page: number

  fetchSessions: (base: string, authToken?: string) => Promise<void>
  fetchSessionDetail: (
    base: string,
    sessionId: string,
    type: SessionType,
    dbId?: string,
    authToken?: string
  ) => Promise<void>
  renameSession: (
    base: string,
    sessionId: string,
    name: string,
    type: SessionType,
    dbId?: string,
    authToken?: string
  ) => Promise<boolean>
  deleteSession: (
    base: string,
    sessionId: string,
    type: SessionType,
    dbId?: string,
    authToken?: string
  ) => Promise<boolean>
  setTypeFilter: (t: SessionType) => void
  setNameFilter: (n: string) => void
  setPage: (p: number) => void
  clearSelection: () => void
}

export const useSessionsStore = create<SessionsState>((set, get) => ({
  sessions: [],
  meta: null,
  loading: false,
  selectedSession: null,
  selectedSessionRuns: [],
  detailLoading: false,
  typeFilter: 'agent',
  nameFilter: '',
  page: 1,

  fetchSessions: async (base, authToken) => {
    set({ loading: true })
    const { typeFilter, nameFilter, page } = get()
    const res = await getSessionsAPI(
      base,
      {
        type: typeFilter,
        session_name: nameFilter || undefined,
        page,
        limit: 20,
        sort_by: 'created_at',
        sort_order: 'desc'
      },
      authToken
    )
    if (res) {
      set({ sessions: res.data, meta: res.meta })
    }
    set({ loading: false })
  },

  fetchSessionDetail: async (base, sessionId, type, dbId, authToken) => {
    set({ detailLoading: true })
    const [detail, runs] = await Promise.all([
      getSessionByIdAPI(base, sessionId, type, dbId, authToken),
      getSessionRunsAPI(base, sessionId, type, dbId, authToken)
    ])
    set({
      selectedSession: detail,
      selectedSessionRuns: runs?.data ?? [],
      detailLoading: false
    })
  },

  renameSession: async (base, sessionId, name, type, dbId, authToken) => {
    const res = await renameSessionAPI(
      base,
      sessionId,
      name,
      type,
      dbId,
      authToken
    )
    return !!res
  },

  deleteSession: async (base, sessionId, type, dbId, authToken) => {
    return await deleteSessionByIdAPI(base, sessionId, type, dbId, authToken)
  },

  setTypeFilter: (t) => set({ typeFilter: t, page: 1 }),
  setNameFilter: (n) => set({ nameFilter: n, page: 1 }),
  setPage: (p) => set({ page: p }),
  clearSelection: () => set({ selectedSession: null, selectedSessionRuns: [] })
}))

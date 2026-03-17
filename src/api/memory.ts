import { APIRoutes } from './routes'
import { apiGet, apiPost, apiPatch, apiDelete } from './client'
import type {
  DeleteMemoriesRequest,
  OptimizeMemoriesRequest,
  OptimizeMemoriesResponse,
  PaginatedResponse,
  UserMemory,
  UserMemoryCreate,
  UserStats
} from '@/types/agentOS'

export const getMemoriesAPI = (
  base: string,
  params?: {
    user_id?: string
    agent_id?: string
    team_id?: string
    topics?: string
    db_id?: string
    page?: number
    limit?: number
  },
  authToken?: string
) => {
  const url = new URL(APIRoutes.GetMemories(base))
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v))
    })
  }
  return apiGet<PaginatedResponse<UserMemory>>(url.toString(), authToken)
}

export const getMemoryAPI = (
  base: string,
  memoryId: string,
  dbId?: string,
  authToken?: string
) => {
  const url = new URL(APIRoutes.GetMemory(base, memoryId))
  if (dbId) url.searchParams.set('db_id', dbId)
  return apiGet<UserMemory>(url.toString(), authToken)
}

export const createMemoryAPI = (
  base: string,
  body: UserMemoryCreate,
  dbId?: string,
  authToken?: string
) => {
  const url = new URL(APIRoutes.CreateMemory(base))
  if (dbId) url.searchParams.set('db_id', dbId)
  return apiPost<UserMemory>(url.toString(), body, authToken)
}

export const updateMemoryAPI = (
  base: string,
  memoryId: string,
  body: Partial<UserMemoryCreate>,
  dbId?: string,
  authToken?: string
) => {
  const url = new URL(APIRoutes.UpdateMemory(base, memoryId))
  if (dbId) url.searchParams.set('db_id', dbId)
  return apiPatch<UserMemory>(url.toString(), body, authToken)
}

export const deleteMemoryAPI = (
  base: string,
  memoryId: string,
  dbId?: string,
  authToken?: string
) => {
  const url = new URL(APIRoutes.DeleteMemory(base, memoryId))
  if (dbId) url.searchParams.set('db_id', dbId)
  return apiDelete(url.toString(), authToken)
}

export const deleteMemoriesAPI = (
  base: string,
  body: DeleteMemoriesRequest,
  dbId?: string,
  authToken?: string
) => {
  const url = new URL(APIRoutes.DeleteMemories(base))
  if (dbId) url.searchParams.set('db_id', dbId)
  return apiDelete(url.toString(), authToken, body)
}

export const getMemoryTopicsAPI = (
  base: string,
  params?: { user_id?: string; db_id?: string },
  authToken?: string
) => {
  const url = new URL(APIRoutes.GetMemoryTopics(base))
  if (params?.user_id) url.searchParams.set('user_id', params.user_id)
  if (params?.db_id) url.searchParams.set('db_id', params.db_id)
  return apiGet<string[]>(url.toString(), authToken)
}

export const getUserMemoryStatsAPI = (
  base: string,
  params?: { db_id?: string },
  authToken?: string
) => {
  const url = new URL(APIRoutes.GetUserMemoryStats(base))
  if (params?.db_id) url.searchParams.set('db_id', params.db_id)
  return apiGet<PaginatedResponse<UserStats>>(url.toString(), authToken)
}

export const optimizeMemoriesAPI = (
  base: string,
  body: OptimizeMemoriesRequest,
  dbId?: string,
  authToken?: string
) => {
  const url = new URL(APIRoutes.OptimizeMemories(base))
  if (dbId) url.searchParams.set('db_id', dbId)
  return apiPost<OptimizeMemoriesResponse>(url.toString(), body, authToken)
}

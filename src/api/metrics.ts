import { APIRoutes } from './routes'
import { apiGet, apiPost } from './client'
import type { MetricsResponse } from '@/types/agentOS'

export const getMetricsAPI = (
  base: string,
  params?: { days?: number; db_id?: string },
  authToken?: string
) => {
  const url = new URL(APIRoutes.GetMetrics(base))
  if (params?.days) url.searchParams.set('days', String(params.days))
  if (params?.db_id) url.searchParams.set('db_id', params.db_id)
  return apiGet<MetricsResponse>(url.toString(), authToken)
}

export const refreshMetricsAPI = (
  base: string,
  dbId?: string,
  authToken?: string
) => {
  const url = new URL(APIRoutes.RefreshMetrics(base))
  if (dbId) url.searchParams.set('db_id', dbId)
  return apiPost<MetricsResponse>(url.toString(), {}, authToken)
}

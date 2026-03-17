import { APIRoutes } from './routes'
import { apiGet, apiPost } from './client'
import type { DayAggregatedMetrics, MetricsResponse } from '@/types/agentOS'

export const getMetricsAPI = (
  base: string,
  params?: {
    starting_date?: string // YYYY-MM-DD
    ending_date?: string // YYYY-MM-DD
    db_id?: string
    table?: string
  },
  authToken?: string
) => {
  const url = new URL(APIRoutes.GetMetrics(base))
  if (params?.starting_date)
    url.searchParams.set('starting_date', params.starting_date)
  if (params?.ending_date)
    url.searchParams.set('ending_date', params.ending_date)
  if (params?.db_id) url.searchParams.set('db_id', params.db_id)
  if (params?.table) url.searchParams.set('table', params.table)
  return apiGet<MetricsResponse>(url.toString(), authToken)
}

export const refreshMetricsAPI = (
  base: string,
  params?: { db_id?: string; table?: string },
  authToken?: string
) => {
  const url = new URL(APIRoutes.RefreshMetrics(base))
  if (params?.db_id) url.searchParams.set('db_id', params.db_id)
  if (params?.table) url.searchParams.set('table', params.table)
  return apiPost<DayAggregatedMetrics[]>(url.toString(), {}, authToken)
}

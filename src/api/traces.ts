import { APIRoutes } from './routes'
import { apiGet, apiPost } from './client'
import type {
  FilterSchemaResponse,
  PaginatedResponse,
  TraceDetail,
  TraceSearchRequest,
  TraceSessionStats,
  TraceSummary
} from '@/types/agentOS'

export const getTracesAPI = (
  base: string,
  params?: { page?: number; limit?: number; db_id?: string },
  authToken?: string
) => {
  const url = new URL(APIRoutes.GetTraces(base))
  if (params?.page) url.searchParams.set('page', String(params.page))
  if (params?.limit) url.searchParams.set('limit', String(params.limit))
  if (params?.db_id) url.searchParams.set('db_id', params.db_id)
  return apiGet<PaginatedResponse<TraceSummary>>(url.toString(), authToken)
}

export const getTraceAPI = (
  base: string,
  traceId: string,
  dbId?: string,
  authToken?: string
) => {
  const url = new URL(APIRoutes.GetTrace(base, traceId))
  if (dbId) url.searchParams.set('db_id', dbId)
  return apiGet<TraceDetail>(url.toString(), authToken)
}

export const getTracesFilterSchemaAPI = (base: string, authToken?: string) =>
  apiGet<FilterSchemaResponse>(APIRoutes.GetTracesFilterSchema(base), authToken)

export const getTraceStatsAPI = (
  base: string,
  params?: { db_id?: string },
  authToken?: string
) => {
  const url = new URL(APIRoutes.GetTraceStats(base))
  if (params?.db_id) url.searchParams.set('db_id', params.db_id)
  return apiGet<PaginatedResponse<TraceSessionStats>>(url.toString(), authToken)
}

export const searchTracesAPI = (
  base: string,
  body: TraceSearchRequest,
  dbId?: string,
  authToken?: string
) => {
  const url = new URL(APIRoutes.SearchTraces(base))
  if (dbId) url.searchParams.set('db_id', dbId)
  return apiPost<PaginatedResponse<TraceSummary | TraceSessionStats>>(
    url.toString(),
    body,
    authToken
  )
}

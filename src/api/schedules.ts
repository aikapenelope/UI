import { APIRoutes } from './routes'
import { apiGet, apiPost, apiPatch, apiDelete } from './client'
import type {
  PaginatedResponse,
  ScheduleCreate,
  ScheduleResponse,
  ScheduleRunResponse,
  ScheduleStateResponse,
  ScheduleUpdate
} from '@/types/agentOS'

export const getSchedulesAPI = (
  base: string,
  params?: { page?: number; limit?: number },
  authToken?: string
) => {
  const url = new URL(APIRoutes.GetSchedules(base))
  if (params?.page) url.searchParams.set('page', String(params.page))
  if (params?.limit) url.searchParams.set('limit', String(params.limit))
  return apiGet<PaginatedResponse<ScheduleResponse>>(url.toString(), authToken)
}

export const createScheduleAPI = (
  base: string,
  body: ScheduleCreate,
  authToken?: string
) => apiPost<ScheduleResponse>(APIRoutes.CreateSchedule(base), body, authToken)

export const getScheduleAPI = (
  base: string,
  scheduleId: string,
  authToken?: string
) =>
  apiGet<ScheduleResponse>(APIRoutes.GetSchedule(base, scheduleId), authToken)

export const updateScheduleAPI = (
  base: string,
  scheduleId: string,
  body: ScheduleUpdate,
  authToken?: string
) =>
  apiPatch<ScheduleResponse>(
    APIRoutes.UpdateSchedule(base, scheduleId),
    body,
    authToken
  )

export const deleteScheduleAPI = (
  base: string,
  scheduleId: string,
  authToken?: string
) => apiDelete(APIRoutes.DeleteSchedule(base, scheduleId), authToken)

export const enableScheduleAPI = (
  base: string,
  scheduleId: string,
  authToken?: string
) =>
  apiPost<ScheduleStateResponse>(
    APIRoutes.EnableSchedule(base, scheduleId),
    {},
    authToken
  )

export const disableScheduleAPI = (
  base: string,
  scheduleId: string,
  authToken?: string
) =>
  apiPost<ScheduleStateResponse>(
    APIRoutes.DisableSchedule(base, scheduleId),
    {},
    authToken
  )

export const triggerScheduleAPI = (
  base: string,
  scheduleId: string,
  authToken?: string
) =>
  apiPost<ScheduleRunResponse>(
    APIRoutes.TriggerSchedule(base, scheduleId),
    {},
    authToken
  )

export const getScheduleRunsAPI = (
  base: string,
  scheduleId: string,
  params?: { page?: number; limit?: number },
  authToken?: string
) => {
  const url = new URL(APIRoutes.GetScheduleRuns(base, scheduleId))
  if (params?.page) url.searchParams.set('page', String(params.page))
  if (params?.limit) url.searchParams.set('limit', String(params.limit))
  return apiGet<PaginatedResponse<ScheduleRunResponse>>(
    url.toString(),
    authToken
  )
}

export const getScheduleRunAPI = (
  base: string,
  scheduleId: string,
  runId: string,
  authToken?: string
) =>
  apiGet<ScheduleRunResponse>(
    APIRoutes.GetScheduleRun(base, scheduleId, runId),
    authToken
  )

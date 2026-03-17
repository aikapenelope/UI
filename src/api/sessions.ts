import { APIRoutes } from './routes'
import { apiGet, apiPost, apiDelete } from './client'
import type {
  PaginatedResponse,
  SessionSchema,
  SessionDetailSchema,
  RunSchema,
  TeamRunSchema,
  WorkflowRunSchema,
  SessionType
} from '@/types/agentOS'

/** List sessions with pagination and filters. */
export const getSessionsAPI = (
  base: string,
  params: {
    type?: SessionType
    component_id?: string
    user_id?: string
    session_name?: string
    page?: number
    limit?: number
    sort_by?: string
    sort_order?: 'asc' | 'desc'
    db_id?: string
  } = {},
  authToken?: string
) => {
  const url = new URL(APIRoutes.GetSessions(base))
  if (params.type) url.searchParams.set('type', params.type)
  if (params.component_id)
    url.searchParams.set('component_id', params.component_id)
  if (params.user_id) url.searchParams.set('user_id', params.user_id)
  if (params.session_name)
    url.searchParams.set('session_name', params.session_name)
  if (params.page != null) url.searchParams.set('page', String(params.page))
  if (params.limit != null) url.searchParams.set('limit', String(params.limit))
  if (params.sort_by) url.searchParams.set('sort_by', params.sort_by)
  if (params.sort_order) url.searchParams.set('sort_order', params.sort_order)
  if (params.db_id) url.searchParams.set('db_id', params.db_id)
  return apiGet<PaginatedResponse<SessionSchema>>(url.toString(), authToken)
}

/** Get session detail by ID. */
export const getSessionByIdAPI = (
  base: string,
  sessionId: string,
  type: SessionType = 'agent',
  dbId?: string,
  authToken?: string
) => {
  const url = new URL(APIRoutes.GetSession(base, sessionId))
  url.searchParams.set('type', type)
  if (dbId) url.searchParams.set('db_id', dbId)
  return apiGet<SessionDetailSchema>(url.toString(), authToken)
}

/** Get runs for a session. */
export const getSessionRunsAPI = (
  base: string,
  sessionId: string,
  type: SessionType = 'agent',
  dbId?: string,
  authToken?: string
) => {
  const url = new URL(APIRoutes.GetSessionRuns(base, sessionId))
  url.searchParams.set('type', type)
  if (dbId) url.searchParams.set('db_id', dbId)
  return apiGet<
    PaginatedResponse<RunSchema | TeamRunSchema | WorkflowRunSchema>
  >(url.toString(), authToken)
}

/** Rename a session. */
export const renameSessionAPI = (
  base: string,
  sessionId: string,
  name: string,
  type: SessionType = 'agent',
  dbId?: string,
  authToken?: string
) => {
  const url = new URL(APIRoutes.RenameSession(base, sessionId))
  url.searchParams.set('type', type)
  if (dbId) url.searchParams.set('db_id', dbId)
  return apiPost<SessionSchema>(
    url.toString(),
    { session_name: name },
    authToken
  )
}

/** Delete a single session. */
export const deleteSessionByIdAPI = (
  base: string,
  sessionId: string,
  type: SessionType = 'agent',
  dbId?: string,
  authToken?: string
) => {
  const url = new URL(APIRoutes.DeleteSession(base, sessionId))
  url.searchParams.set('type', type)
  if (dbId) url.searchParams.set('db_id', dbId)
  return apiDelete(url.toString(), authToken)
}

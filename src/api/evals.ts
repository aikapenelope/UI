import { APIRoutes } from './routes'
import { apiGet, apiPost, apiPatch, apiDelete } from './client'
import type {
  DeleteEvalRunsRequest,
  EvalRunInput,
  EvalSchema,
  PaginatedResponse,
  UpdateEvalRunRequest
} from '@/types/agentOS'

export const getEvalRunsAPI = (
  base: string,
  params?: {
    agent_id?: string
    team_id?: string
    eval_type?: string
    db_id?: string
    page?: number
    limit?: number
  },
  authToken?: string
) => {
  const url = new URL(APIRoutes.GetEvalRuns(base))
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v))
    })
  }
  return apiGet<PaginatedResponse<EvalSchema>>(url.toString(), authToken)
}

export const getEvalRunAPI = (
  base: string,
  evalRunId: string,
  dbId?: string,
  authToken?: string
) => {
  const url = new URL(APIRoutes.GetEvalRun(base, evalRunId))
  if (dbId) url.searchParams.set('db_id', dbId)
  return apiGet<EvalSchema>(url.toString(), authToken)
}

export const deleteEvalRunsAPI = (
  base: string,
  body: DeleteEvalRunsRequest,
  dbId?: string,
  authToken?: string
) => {
  const url = new URL(APIRoutes.DeleteEvalRuns(base))
  if (dbId) url.searchParams.set('db_id', dbId)
  return apiDelete(url.toString(), authToken, body)
}

export const updateEvalRunAPI = (
  base: string,
  evalRunId: string,
  body: UpdateEvalRunRequest,
  dbId?: string,
  authToken?: string
) => {
  const url = new URL(APIRoutes.UpdateEvalRun(base, evalRunId))
  if (dbId) url.searchParams.set('db_id', dbId)
  return apiPatch<EvalSchema>(url.toString(), body, authToken)
}

export const runEvalAPI = (
  base: string,
  body: EvalRunInput,
  dbId?: string,
  authToken?: string
) => {
  const url = new URL(APIRoutes.RunEval(base))
  if (dbId) url.searchParams.set('db_id', dbId)
  return apiPost<EvalSchema>(url.toString(), body, authToken)
}

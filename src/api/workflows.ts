import { APIRoutes } from './routes'
import { apiGet, apiPost } from './client'
import type {
  WorkflowDetailResponse,
  WorkflowRunRequest,
  WorkflowRunSchema
} from '@/types/agentOS'

export const getWorkflowsAPI = (base: string, authToken?: string) =>
  apiGet<WorkflowDetailResponse[]>(APIRoutes.GetWorkflows(base), authToken)

export const getWorkflowAPI = (
  base: string,
  workflowId: string,
  authToken?: string
) =>
  apiGet<WorkflowDetailResponse>(
    APIRoutes.GetWorkflow(base, workflowId),
    authToken
  )

export const runWorkflowAPI = (
  base: string,
  workflowId: string,
  body: WorkflowRunRequest,
  authToken?: string
) =>
  apiPost<WorkflowRunSchema>(
    APIRoutes.WorkflowRun(base, workflowId),
    body,
    authToken
  )

export const cancelWorkflowRunAPI = (
  base: string,
  workflowId: string,
  runId: string,
  authToken?: string
) =>
  apiPost<void>(
    APIRoutes.CancelWorkflowRun(base, workflowId, runId),
    {},
    authToken
  )

export const getWorkflowRunAPI = (
  base: string,
  workflowId: string,
  runId: string,
  authToken?: string
) =>
  apiGet<WorkflowRunSchema>(
    APIRoutes.GetWorkflowRun(base, workflowId, runId),
    authToken
  )

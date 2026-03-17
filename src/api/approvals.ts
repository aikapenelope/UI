import { APIRoutes } from './routes'
import { apiGet, apiPost, apiDelete } from './client'
import type {
  ApprovalCountResponse,
  ApprovalResolve,
  ApprovalResponse,
  ApprovalStatusResponse,
  PaginatedResponse
} from '@/types/agentOS'

export const getApprovalsAPI = (
  base: string,
  params?: {
    status?: string
    agent_id?: string
    team_id?: string
    page?: number
    limit?: number
  },
  authToken?: string
) => {
  const url = new URL(APIRoutes.GetApprovals(base))
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v))
    })
  }
  return apiGet<PaginatedResponse<ApprovalResponse>>(url.toString(), authToken)
}

export const getApprovalAPI = (
  base: string,
  approvalId: string,
  authToken?: string
) =>
  apiGet<ApprovalResponse>(APIRoutes.GetApproval(base, approvalId), authToken)

export const getApprovalStatusAPI = (
  base: string,
  approvalId: string,
  authToken?: string
) =>
  apiGet<ApprovalStatusResponse>(
    APIRoutes.GetApprovalStatus(base, approvalId),
    authToken
  )

export const getApprovalCountAPI = (base: string, authToken?: string) =>
  apiGet<ApprovalCountResponse>(APIRoutes.GetApprovalCount(base), authToken)

export const resolveApprovalAPI = (
  base: string,
  approvalId: string,
  body: ApprovalResolve,
  authToken?: string
) =>
  apiPost<ApprovalResponse>(
    APIRoutes.ResolveApproval(base, approvalId),
    body,
    authToken
  )

export const deleteApprovalAPI = (
  base: string,
  approvalId: string,
  authToken?: string
) => apiDelete(APIRoutes.DeleteApproval(base, approvalId), authToken)

import { APIRoutes } from './routes'
import { apiGet } from './client'
import type {
  PaginatedResponse,
  RegistryContentResponse
} from '@/types/agentOS'

export const listRegistryAPI = (
  base: string,
  params?: {
    type?: string
    name?: string
    page?: number
    limit?: number
  },
  authToken?: string
) => {
  const url = new URL(APIRoutes.ListRegistry(base))
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v))
    })
  }
  return apiGet<PaginatedResponse<RegistryContentResponse>>(
    url.toString(),
    authToken
  )
}

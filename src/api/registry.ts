import { APIRoutes } from './routes'
import { apiGet } from './client'
import type { RegistryContentResponse } from '@/types/agentOS'

export const listRegistryAPI = (
  base: string,
  params?: { type?: string },
  authToken?: string
) => {
  const url = new URL(APIRoutes.ListRegistry(base))
  if (params?.type) url.searchParams.set('type', params.type)
  return apiGet<RegistryContentResponse[]>(url.toString(), authToken)
}

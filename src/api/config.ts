import { APIRoutes } from './routes'
import { apiGet } from './client'
import type { HealthResponse, OSConfigResponse, OSModel } from '@/types/agentOS'

export const getOSConfigAPI = (base: string, authToken?: string) =>
  apiGet<OSConfigResponse>(APIRoutes.Config(base), authToken)

export const getModelsAPI = (base: string, authToken?: string) =>
  apiGet<OSModel[]>(APIRoutes.Models(base), authToken)

export const getHealthAPI = (base: string, authToken?: string) =>
  apiGet<HealthResponse>(APIRoutes.Health(base), authToken)

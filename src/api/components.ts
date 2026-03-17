import { APIRoutes } from './routes'
import { apiGet, apiPost, apiPatch, apiDelete } from './client'
import type {
  ComponentConfigResponse,
  ComponentCreate,
  ComponentResponse,
  ComponentUpdate,
  ConfigCreate,
  ConfigUpdate,
  PaginatedResponse
} from '@/types/agentOS'

// -- Components CRUD -------------------------------------------------------

export const listComponentsAPI = (
  base: string,
  params?: { component_type?: string; page?: number; limit?: number },
  authToken?: string
) => {
  const url = new URL(APIRoutes.ListComponents(base))
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v))
    })
  }
  return apiGet<PaginatedResponse<ComponentResponse>>(url.toString(), authToken)
}

export const createComponentAPI = (
  base: string,
  body: ComponentCreate,
  authToken?: string
) =>
  apiPost<ComponentResponse>(APIRoutes.CreateComponent(base), body, authToken)

export const getComponentAPI = (
  base: string,
  componentId: string,
  authToken?: string
) =>
  apiGet<ComponentResponse>(
    APIRoutes.GetComponent(base, componentId),
    authToken
  )

export const updateComponentAPI = (
  base: string,
  componentId: string,
  body: ComponentUpdate,
  authToken?: string
) =>
  apiPatch<ComponentResponse>(
    APIRoutes.UpdateComponent(base, componentId),
    body,
    authToken
  )

export const deleteComponentAPI = (
  base: string,
  componentId: string,
  authToken?: string
) => apiDelete(APIRoutes.DeleteComponent(base, componentId), authToken)

// -- Component Configs CRUD ------------------------------------------------

export const listConfigsAPI = (
  base: string,
  componentId: string,
  authToken?: string
) =>
  apiGet<ComponentConfigResponse[]>(
    APIRoutes.ListConfigs(base, componentId),
    authToken
  )

export const createConfigAPI = (
  base: string,
  componentId: string,
  body: ConfigCreate,
  authToken?: string
) =>
  apiPost<ComponentConfigResponse>(
    APIRoutes.CreateConfig(base, componentId),
    body,
    authToken
  )

export const updateConfigAPI = (
  base: string,
  componentId: string,
  version: number,
  body: ConfigUpdate,
  authToken?: string
) =>
  apiPatch<ComponentConfigResponse>(
    APIRoutes.UpdateConfig(base, componentId, version),
    body,
    authToken
  )

export const getCurrentConfigAPI = (
  base: string,
  componentId: string,
  authToken?: string
) =>
  apiGet<ComponentConfigResponse>(
    APIRoutes.GetCurrentConfig(base, componentId),
    authToken
  )

export const getConfigVersionAPI = (
  base: string,
  componentId: string,
  version: number,
  authToken?: string
) =>
  apiGet<ComponentConfigResponse>(
    APIRoutes.GetConfigVersion(base, componentId, version),
    authToken
  )

export const deleteConfigVersionAPI = (
  base: string,
  componentId: string,
  version: number,
  authToken?: string
) =>
  apiDelete(
    APIRoutes.DeleteConfigVersion(base, componentId, version),
    authToken
  )

export const setCurrentConfigAPI = (
  base: string,
  componentId: string,
  version: number,
  authToken?: string
) =>
  apiPost<ComponentConfigResponse>(
    APIRoutes.SetCurrentConfig(base, componentId, version),
    {},
    authToken
  )

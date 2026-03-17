import { APIRoutes } from './routes'
import { apiGet, apiPost, apiPatch, apiDelete } from './client'
import { createHeaders } from './client'
import { toast } from 'sonner'
import type {
  ContentResponse,
  ContentStatusResponse,
  ContentUpdate,
  KnowledgeConfigResponse,
  PaginatedResponse,
  SourceFilesResponse,
  RemoteContentSource,
  VectorSearchRequest,
  VectorSearchResult
} from '@/types/agentOS'

export const getKnowledgeConfigAPI = (
  base: string,
  dbId?: string,
  authToken?: string
) => {
  const url = new URL(APIRoutes.GetKnowledgeConfig(base))
  if (dbId) url.searchParams.set('db_id', dbId)
  return apiGet<KnowledgeConfigResponse>(url.toString(), authToken)
}

/** Upload file content (multipart/form-data). */
export const uploadContentAPI = async (
  base: string,
  formData: FormData,
  authToken?: string
): Promise<ContentResponse | null> => {
  try {
    const headers: HeadersInit = {}
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`
    const response = await fetch(APIRoutes.UploadContent(base), {
      method: 'POST',
      headers,
      body: formData
    })
    if (!response.ok) {
      toast.error(`Upload failed: ${response.statusText}`)
      return null
    }
    return (await response.json()) as ContentResponse
  } catch {
    toast.error('Upload error')
    return null
  }
}

export const uploadRemoteContentAPI = (
  base: string,
  body: {
    source_id: string
    keys: string[]
    knowledge_id?: string
    db_id?: string
  },
  authToken?: string
) =>
  apiPost<ContentResponse>(APIRoutes.UploadRemoteContent(base), body, authToken)

export const getContentAPI = (
  base: string,
  params?: {
    db_id?: string
    knowledge_id?: string
    page?: number
    limit?: number
  },
  authToken?: string
) => {
  const url = new URL(APIRoutes.GetContent(base))
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v))
    })
  }
  return apiGet<PaginatedResponse<ContentResponse>>(url.toString(), authToken)
}

export const getContentByIdAPI = (
  base: string,
  contentId: string,
  authToken?: string
) =>
  apiGet<ContentResponse>(APIRoutes.GetContentById(base, contentId), authToken)

export const updateContentAPI = (
  base: string,
  contentId: string,
  body: ContentUpdate,
  authToken?: string
) =>
  apiPatch<ContentResponse>(
    APIRoutes.UpdateContent(base, contentId),
    body,
    authToken
  )

export const deleteContentByIdAPI = (
  base: string,
  contentId: string,
  authToken?: string
) => apiDelete(APIRoutes.DeleteContentById(base, contentId), authToken)

export const deleteAllContentAPI = (
  base: string,
  params?: { db_id?: string; knowledge_id?: string },
  authToken?: string
) => {
  const url = new URL(APIRoutes.DeleteAllContent(base))
  if (params?.db_id) url.searchParams.set('db_id', params.db_id)
  if (params?.knowledge_id)
    url.searchParams.set('knowledge_id', params.knowledge_id)
  return apiDelete(url.toString(), authToken)
}

export const getContentStatusAPI = (
  base: string,
  contentId: string,
  authToken?: string
) =>
  apiGet<ContentStatusResponse>(
    APIRoutes.GetContentStatus(base, contentId),
    authToken
  )

export const searchKnowledgeAPI = (
  base: string,
  body: VectorSearchRequest,
  authToken?: string
) =>
  apiPost<PaginatedResponse<VectorSearchResult>>(
    APIRoutes.SearchKnowledge(base),
    body,
    authToken
  )

export const listKnowledgeSourcesAPI = (
  base: string,
  knowledgeId: string,
  authToken?: string
) =>
  apiGet<RemoteContentSource[]>(
    APIRoutes.ListKnowledgeSources(base, knowledgeId),
    authToken
  )

export const listSourceFilesAPI = (
  base: string,
  knowledgeId: string,
  sourceId: string,
  params?: { prefix?: string; page?: number; limit?: number },
  authToken?: string
) => {
  const url = new URL(APIRoutes.ListSourceFiles(base, knowledgeId, sourceId))
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v))
    })
  }
  return apiGet<SourceFilesResponse>(url.toString(), authToken)
}

// Re-export createHeaders for backward compatibility
export { createHeaders }

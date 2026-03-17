/**
 * Shared HTTP client utilities for all AgentOS API modules.
 */

import { toast } from 'sonner'

/** Build standard headers with optional Bearer auth. */
export const createHeaders = (authToken?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  }
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }
  return headers
}

/** Generic typed GET request. */
export async function apiGet<T>(
  url: string,
  authToken?: string
): Promise<T | null> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(authToken)
    })
    if (!response.ok) {
      toast.error(`Request failed: ${response.statusText}`)
      return null
    }
    return (await response.json()) as T
  } catch {
    toast.error('Network error')
    return null
  }
}

/** Generic typed POST request. */
export async function apiPost<T>(
  url: string,
  body: unknown,
  authToken?: string
): Promise<T | null> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: createHeaders(authToken),
      body: JSON.stringify(body)
    })
    if (!response.ok) {
      toast.error(`Request failed: ${response.statusText}`)
      return null
    }
    return (await response.json()) as T
  } catch {
    toast.error('Network error')
    return null
  }
}

/** Generic typed PATCH request. */
export async function apiPatch<T>(
  url: string,
  body: unknown,
  authToken?: string
): Promise<T | null> {
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: createHeaders(authToken),
      body: JSON.stringify(body)
    })
    if (!response.ok) {
      toast.error(`Request failed: ${response.statusText}`)
      return null
    }
    return (await response.json()) as T
  } catch {
    toast.error('Network error')
    return null
  }
}

/** Generic DELETE request. Returns true on success. */
export async function apiDelete(
  url: string,
  authToken?: string,
  body?: unknown
): Promise<boolean> {
  try {
    const options: RequestInit = {
      method: 'DELETE',
      headers: createHeaders(authToken)
    }
    if (body !== undefined) {
      options.body = JSON.stringify(body)
    }
    const response = await fetch(url, options)
    if (!response.ok) {
      toast.error(`Delete failed: ${response.statusText}`)
      return false
    }
    return true
  } catch {
    toast.error('Network error')
    return false
  }
}

/**
 * Shared HTTP client with retry, timeout, and structured error handling.
 *
 * Every public helper (apiGet, apiPost, apiPatch, apiDelete) retries on
 * transient failures (network errors, 502/503/504) with exponential backoff,
 * enforces a per-request timeout via AbortController, and surfaces
 * differentiated toast messages for 401/403/404/5xx.
 */

import { toast } from 'sonner'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const DEFAULT_TIMEOUT_MS = 15_000
const MAX_RETRIES = 2
const BASE_DELAY_MS = 500

// ---------------------------------------------------------------------------
// Error classification
// ---------------------------------------------------------------------------

/** Status codes that are safe to retry (server-side transient errors). */
const RETRYABLE_STATUS = new Set([502, 503, 504])

function toastForStatus(status: number, statusText: string, method: string) {
  switch (status) {
    case 401:
      toast.error('Unauthorized -- check your auth token in Settings')
      break
    case 403:
      toast.error('Forbidden -- insufficient permissions')
      break
    case 404:
      // Only toast 404 for mutations; GETs silently return null.
      if (method !== 'GET') {
        toast.error(`Not found: ${statusText}`)
      }
      break
    case 422:
      toast.error(`Validation error: ${statusText}`)
      break
    default:
      if (status >= 500) {
        toast.error(`Server error (${status}): ${statusText}`)
      } else {
        toast.error(`Request failed (${status}): ${statusText}`)
      }
  }
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

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

interface FetchOptions {
  method: string
  url: string
  authToken?: string
  body?: unknown
  timeoutMs?: number
}

/**
 * Low-level fetch with timeout + retry.
 * Returns the Response on success, or null after exhausting retries.
 */
async function fetchWithRetry(opts: FetchOptions): Promise<Response | null> {
  const { method, url, authToken, body, timeoutMs = DEFAULT_TIMEOUT_MS } = opts

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const init: RequestInit = {
        method,
        headers: createHeaders(authToken),
        signal: controller.signal
      }
      if (body !== undefined) {
        init.body = JSON.stringify(body)
      }

      const response = await fetch(url, init)
      clearTimeout(timer)

      // Non-retryable failure -- return immediately so caller can inspect.
      if (!response.ok && !RETRYABLE_STATUS.has(response.status)) {
        toastForStatus(response.status, response.statusText, method)
        return response
      }

      // Success
      if (response.ok) {
        return response
      }

      // Retryable server error -- fall through to retry logic.
    } catch (err: unknown) {
      clearTimeout(timer)

      if (err instanceof DOMException && err.name === 'AbortError') {
        // Timeout -- retryable
        if (attempt === MAX_RETRIES) {
          toast.error('Request timed out -- is the AgentOS endpoint reachable?')
          return null
        }
      } else {
        // Network error -- retryable
        if (attempt === MAX_RETRIES) {
          toast.error('Network error -- check your connection and endpoint URL')
          return null
        }
      }
    }

    // Exponential backoff before next attempt
    if (attempt < MAX_RETRIES) {
      await sleep(BASE_DELAY_MS * 2 ** attempt)
    }
  }

  toast.error('Request failed after retries')
  return null
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/** Generic typed GET request with retry and timeout. */
export async function apiGet<T>(
  url: string,
  authToken?: string
): Promise<T | null> {
  const response = await fetchWithRetry({ method: 'GET', url, authToken })
  if (!response || !response.ok) return null
  try {
    return (await response.json()) as T
  } catch {
    return null
  }
}

/** Generic typed POST request with retry and timeout. */
export async function apiPost<T>(
  url: string,
  body: unknown,
  authToken?: string
): Promise<T | null> {
  const response = await fetchWithRetry({
    method: 'POST',
    url,
    authToken,
    body
  })
  if (!response || !response.ok) return null
  try {
    return (await response.json()) as T
  } catch {
    return null
  }
}

/** Generic typed PATCH request with retry and timeout. */
export async function apiPatch<T>(
  url: string,
  body: unknown,
  authToken?: string
): Promise<T | null> {
  const response = await fetchWithRetry({
    method: 'PATCH',
    url,
    authToken,
    body
  })
  if (!response || !response.ok) return null
  try {
    return (await response.json()) as T
  } catch {
    return null
  }
}

/** Generic DELETE request with retry and timeout. Returns true on success. */
export async function apiDelete(
  url: string,
  authToken?: string,
  body?: unknown
): Promise<boolean> {
  const response = await fetchWithRetry({
    method: 'DELETE',
    url,
    authToken,
    body
  })
  return response !== null && response.ok
}

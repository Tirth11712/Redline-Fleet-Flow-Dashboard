/**
 * Shared API client for the FleetFlow backend.
 * Base URL is read from the NEXT_PUBLIC_API_URL env var,
 * falling back to localhost for local development.
 */
export const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000') + '/api/v1'

export async function apiRequest(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<Response> {
  return fetch(`${API_BASE}/${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  })
}

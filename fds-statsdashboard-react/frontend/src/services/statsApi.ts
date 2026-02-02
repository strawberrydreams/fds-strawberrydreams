import type {
  AdminDashboardResponse,
  SnapshotMetadata,
  SnapshotScope,
  StatsRangeType,
  UserDashboardResponse,
  UserSummaryResponse,
} from '../types/stats'
import { getAuthToken } from '../utils/authStorage'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

const buildUrl = (
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
) => {
  if (!params) {
    return `${API_BASE}${path}`
  }
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) {
      return
    }
    searchParams.set(key, String(value))
  })
  return `${API_BASE}${path}?${searchParams.toString()}`
}

const getJson = async <T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
): Promise<T> => {
  const token = getAuthToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  const response = await fetch(buildUrl(path, params), {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed (${response.status})`)
  }

  return (await response.json()) as T
}

export const fetchUserSummary = (range: StatsRangeType) =>
    getJson<UserSummaryResponse>('/api/stats/user/summary', { range })

export const fetchUserDashboard = (range: StatsRangeType) =>
    getJson<UserDashboardResponse>('/api/stats/user/dashboard', { range })

export const fetchAdminDashboard = (params?: {
  fromDate?: string
  toDate?: string
}) =>
    getJson<AdminDashboardResponse>('/api/stats/admin/dashboard', params)

export const fetchSnapshotList = (scope: SnapshotScope) =>
    getJson<SnapshotMetadata[]>(
        scope === 'BUSINESS' ? '/api/stats/admin/snapshots' : '/api/stats/snapshots',
    )

export const fetchSnapshotDetail = <T = unknown>(
    scope: SnapshotScope,
    snapshotId: string,
) =>
    getJson<T>(
        scope === 'BUSINESS'
            ? `/api/stats/admin/snapshots/${snapshotId}`
            : `/api/stats/snapshots/${snapshotId}`,
    )

export const generateWeeklySnapshots = (payload: {
  fromDate?: string
  toDate?: string
  forceRebuild?: boolean
}) =>
    fetch(`${API_BASE}/api/stats/admin/snapshots`, {
      method: 'POST',
      headers: (() => {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }
        const token = getAuthToken()
        if (token) {
          headers.Authorization = `Bearer ${token}`
        }
        return headers
      })(),
      body: JSON.stringify(payload),
    }).then(async (response) => {
      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || `Snapshot generation failed (${response.status})`)
      }
      return response.json()
    })

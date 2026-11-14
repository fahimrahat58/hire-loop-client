import { authClient } from "@/app/lib/auth-client"

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "")

// ====================================
// TYPES
// ====================================

export type AdminUserRole = "seeker" | "recruiter" | "admin"

export type AdminUserRoleFilter = AdminUserRole | "all"

export type AdminUser = {
  id: string
  name: string
  email: string
  role: AdminUserRole
  emailVerified: boolean
  image: string | null
  createdAt: string | null
  updatedAt: string | null
}

export type AdminUserPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type AdminUserCounts = {
  total: number
  seekers: number
  recruiters: number
  admins: number
}

export type AdminUsersResult = {
  users: AdminUser[]
  pagination: AdminUserPagination
  counts: AdminUserCounts
}

type ApiEnvelope<T> = {
  success?: boolean
  message?: string
  data?: T
}

// ====================================
// ERRORS
// ====================================

export class AdminApiError extends Error {
  status: number

  constructor(message: string, status = 0) {
    super(message)

    this.name = "AdminApiError"
    this.status = status
  }
}

export function getAdminErrorMessage(
  error: unknown,
  fallback = "Something went wrong while contacting the admin service."
) {
  if (error instanceof AdminApiError) {
    return error.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

// ====================================
// REQUEST HELPERS
// ====================================

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text()

  if (!text) return null

  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

async function getAuthToken() {
  const tokenResult = await authClient.token()
  const token = tokenResult.data?.token

  if (!token) {
    throw new AdminApiError(
      "Your session has expired. Please sign in again.",
      401
    )
  }

  return token
}

async function request(
  path: string,
  init: RequestInit = {},
  signal?: AbortSignal
): Promise<unknown> {
  let response: Response

  try {
    const token = await getAuthToken()

    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      cache: "no-store",
      signal: signal ?? init.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error
    }

    if (error instanceof AdminApiError) {
      throw error
    }

    throw new AdminApiError(
      "Unable to reach the admin service. Please check that the API server is running.",
      0
    )
  }

  const body = (await parseBody(response)) as ApiEnvelope<unknown> | null

  if (!response.ok || body?.success === false) {
    throw new AdminApiError(
      body?.message || `The admin service returned ${response.status}.`,
      response.status
    )
  }

  return body
}

// ====================================
// LIST USERS
// ====================================

export async function getAdminUsers(
  params: {
    page?: number
    limit?: number
    search?: string
    role?: AdminUserRoleFilter
    signal?: AbortSignal
  } = {}
): Promise<AdminUsersResult> {
  const query = new URLSearchParams()

  query.set("page", String(params.page ?? 1))
  query.set("limit", String(params.limit ?? 10))

  if (params.search?.trim()) {
    query.set("search", params.search.trim())
  }

  if (params.role && params.role !== "all") {
    query.set("role", params.role)
  }

  const body = (await request(
    `/api/admin/users?${query.toString()}`,
    { method: "GET" },
    params.signal
  )) as ApiEnvelope<AdminUsersResult> | null

  const data = body?.data

  if (
    !data ||
    !Array.isArray(data.users) ||
    !data.pagination ||
    !data.counts
  ) {
    throw new AdminApiError("The admin service returned an invalid response.", 502)
  }

  return data
}

// ====================================
// UPDATE USER ROLE
// ====================================

export async function updateAdminUserRole(
  userId: string,
  role: AdminUserRole,
  signal?: AbortSignal
): Promise<AdminUser> {
  const body = (await request(
    `/api/admin/users/${encodeURIComponent(userId)}/role`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role }),
    },
    signal
  )) as ApiEnvelope<AdminUser> | null

  if (!body?.data?.id) {
    throw new AdminApiError("The admin service returned an invalid response.", 502)
  }

  return body.data
}

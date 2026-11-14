
import { authClient } from "@/app/lib/auth-client"

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "")

// ====================================
// TYPES
// ====================================

export type ApiJob = {
  _id: string
  title: string
  company: string
  location: string
  salary?: string
  category?: string
  description?: string
  closed?: boolean
  closing?: string
  savedAt?: string
  type?: string
  skills?: string[]
  createdAt?: string | Date
  updatedAt?: string | Date
  recruiterId?: string
  createdBy?: string
  ownerId?: string
  userId?: string
  ownerEmail?: string
  status?: string
  deadline?: string
  applicationDeadline?: string
  applicants?: number
  salaryMin?: number
  salaryMax?: number
  currency?: string
  [key: string]: unknown
}

export type JobInput = {
  title: string
  company: string
  location: string
  salary?: string
  category?: string
  description?: string
  status?: "active" | "draft" | "closed"
  closed?: boolean
  deadline?: string
}

export type JobUser = {
  id?: string | null
  email?: string | null
  role?: string | null
}

export type JobRequestOptions = {
  user?: JobUser | null
  cookie?: string
  signal?: AbortSignal
}

export type BillingSummary = {
  role?: "seeker" | "recruiter"
  plan: "free" | "premium"
  planName: string
  subscriptionStatus: string
  cancelAtPeriodEnd?: boolean
  publishedJobsUsed: number
  publishedJobLimit: number | null
  remainingPublishedJobs: number | null
  applicationsUsed?: number
  applicationLimit?: number | null
  remainingApplications?: number | null
  currentPeriodEnd: string | null
}

type ApiEnvelope<T> = {
  success?: boolean
  message?: string
  data?: T
}

// ====================================
// API ERROR
// ====================================

export class JobsApiError extends Error {
  status: number

  constructor(message: string, status = 0) {
    super(message)
    this.name = "JobsApiError"
    this.status = status
  }
}

export function isJobsApiError(
  error: unknown
): error is JobsApiError {
  return error instanceof JobsApiError
}

export function getJobsErrorMessage(
  error: unknown,
  fallback = "Something went wrong while contacting the jobs service."
): string {
  if (error instanceof JobsApiError) return error.message

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

// ====================================
// PARSE RESPONSE
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

// ====================================
// AUTHENTICATION HEADERS
// ====================================

async function buildHeaders(
  options: JobRequestOptions,
  init?: RequestInit
): Promise<Headers> {
  const headers = new Headers(init?.headers)

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json")
  }

  // Get Better Auth JWT in browser
  if (typeof window !== "undefined") {
    try {
      const { data, error } = await authClient.token()

      if (!error && data?.token) {
        headers.set("Authorization", `Bearer ${data.token}`)
      }
    } catch (error) {
      console.error("Failed to get authentication token:", error)
    }
  }

  // User context headers
  // Backend must verify JWT independently.
  if (options.user) {
    if (options.user.id) {
      headers.set("x-user-id", options.user.id)
    }

    if (options.user.email) {
      headers.set("x-user-email", options.user.email)
    }

    if (options.user.role) {
      headers.set("x-user-role", options.user.role)
    }
  }

  // Cookie forwarding for server-side requests
  if (options.cookie) {
    headers.set("cookie", options.cookie)
  }

  return headers
}

// ====================================
// BASE API REQUEST
// ====================================

async function request(
  path: string,
  init: RequestInit,
  options: JobRequestOptions = {}
): Promise<unknown> {
  let response: Response

  try {
    const headers = await buildHeaders(options, init)

    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
      credentials: "include",
      cache: "no-store",
      signal: options.signal ?? init.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error
    }

    if (error instanceof JobsApiError) {
      throw error
    }

    throw new JobsApiError(
      "Unable to reach the jobs service. Please check that the API server is running.",
      0
    )
  }

  const body = await parseBody(response)

  if (
    !response.ok ||
    (body !== null &&
      typeof body === "object" &&
      "success" in body &&
      (body as ApiEnvelope<unknown>).success === false)
  ) {
    throw new JobsApiError(
      (body as ApiEnvelope<unknown> | null)?.message ||
        `The jobs service returned ${response.status}.`,
      response.status
    )
  }

  return body
}

// ====================================
// RESPONSE DATA
// ====================================

function unwrapData<T>(body: unknown): T | null {
  if (
    body !== null &&
    typeof body === "object" &&
    "data" in body
  ) {
    return (body as ApiEnvelope<T>).data ?? null
  }

  return body as T | null
}

// ====================================
// BILLING SUMMARY
// ====================================

export async function getBillingSummary(
  options: JobRequestOptions = {}
): Promise<BillingSummary> {
  const body = await request(
    "/api/billing/summary",
    {
      method: "GET",
    },
    options
  )

  const data = unwrapData<BillingSummary>(body)

  if (!data || typeof data !== "object") {
    throw new JobsApiError(
      "Unable to load billing summary.",
      502
    )
  }

  return data
}

// ====================================
// GET ALL JOBS
// ====================================

export async function getJobs(
  options: JobRequestOptions = {}
): Promise<ApiJob[]> {
  const body = await request(
    "/api/jobs",
    {
      method: "GET",
    },
    options
  )

  const data = unwrapData<ApiJob[]>(body)

  if (!Array.isArray(data)) {
    throw new JobsApiError(
      "The jobs service returned an unexpected response.",
      502
    )
  }

  return data
}

// ====================================
// GET SINGLE JOB
// ====================================

export async function getJob(
  id: string,
  options: JobRequestOptions = {}
): Promise<ApiJob> {
  const body = await request(
    `/api/jobs/${encodeURIComponent(id)}`,
    {
      method: "GET",
    },
    options
  )

  const data = unwrapData<ApiJob>(body)

  if (!data || typeof data !== "object") {
    throw new JobsApiError("Job not found.", 404)
  }

  return data
}

// ====================================
// CREATE JOB
// ====================================

export async function createJob(
  input: JobInput,
  options: JobRequestOptions = {}
): Promise<ApiJob> {
  const body = await request(
    "/api/jobs",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
    options
  )

  const data = unwrapData<ApiJob>(body)

  if (!data || typeof data !== "object") {
    throw new JobsApiError(
      (body as ApiEnvelope<ApiJob> | null)?.message ||
        "The job was created but the server did not return it.",
      502
    )
  }

  return data
}

// ====================================
// UPDATE JOB
// ====================================

export async function updateJob(
  id: string,
  input: Partial<JobInput>,
  options: JobRequestOptions = {}
): Promise<ApiJob> {
  await request(
    `/api/jobs/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
    options
  )

  return getJob(id, options)
}

// ====================================
// DELETE JOB
// ====================================

export async function deleteJob(
  id: string,
  options: JobRequestOptions = {}
): Promise<void> {
  await request(
    `/api/jobs/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
    options
  )
}

// ====================================
// JOB HELPERS
// ====================================

export function getJobStatus(
  job: ApiJob
): "Active" | "Closed" | "Draft" {
  if (job.status?.toLowerCase() === "draft") {
    return "Draft"
  }

  return job.closed || job.status?.toLowerCase() === "closed"
    ? "Closed"
    : "Active"
}

export function getJobType(job: ApiJob): string {
  if (job.type) return job.type

  return job.location?.toLowerCase().includes("remote")
    ? "Remote"
    : "Full-time"
}

export function getJobCategory(job: ApiJob): string {
  return job.category?.trim() || "General"
}

export function getJobDescription(job: ApiJob): string {
  return job.description?.trim() || ""
}

export function getJobSkills(job: ApiJob): string[] {
  return Array.isArray(job.skills)
    ? job.skills.filter(Boolean)
    : []
}

export function getJobClosing(job: ApiJob): string {
  if (job.closing) return job.closing

  return job.closed ? "Job closed by employer" : ""
}

export function getJobDate(job: ApiJob): string {
  const value = job.createdAt ?? job.updatedAt

  if (value) {
    const date = new Date(value)

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    }
  }

  return job.savedAt || "Recently posted"
}

export function getJobRef(job: ApiJob): string {
  return job._id
    ? job._id.slice(-6).toUpperCase()
    : "—"
}

// ====================================
// SALARY HELPERS
// ====================================

export function parseSalaryMin(salary?: string): number {
  if (!salary) return 0

  const match = salary.match(/(\d[\d,.]*)\s*([km])?/i)

  if (!match) return 0

  const amount = Number(match[1].replaceAll(",", ""))

  if (!Number.isFinite(amount)) return 0

  const unit = match[2]?.toLowerCase()

  if (unit === "m") return amount * 1000
  if (unit === "k" || amount < 1000) return amount

  return amount / 1000
}

export function buildSalary(
  min?: string,
  max?: string,
  currency = "USD"
): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    BDT: "৳",
  }

  const symbol = symbols[currency] ?? ""

  const format = (value?: string) => {
    const amount = Number(value)

    if (!Number.isFinite(amount) || amount <= 0) {
      return ""
    }

    return amount >= 1000
      ? `${symbol}${Math.round(amount / 1000)}k`
      : `${symbol}${amount}`
  }

  const lower = format(min)
  const upper = format(max)

  if (lower && upper) {
    return `${lower} - ${upper}`
  }

  return lower || upper
}

// ====================================
// DESCRIPTION HELPER
// ====================================

export function combineDescription(
  responsibilities: string,
  requirements: string,
  benefits: string
): string {
  return [responsibilities, requirements, benefits]
    .map((part) => part.trim())
    .filter(Boolean)
    .join("\n\n")
}

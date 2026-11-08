/**
 * Reusable client for the HireLoop Jobs API.
 *
 * Every request:
 *  - uses NEXT_PUBLIC_API_URL (no hardcoded API host),
 *  - sends Better Auth cookies with `credentials: "include"`,
 *  - can forward the current Better Auth user (as headers for the API) and
 *  - returns strongly typed data / throws a descriptive JobsApiError.
 */

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "")

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
}

export type JobInput = {
  title: string
  company: string
  location: string
  salary?: string
  category?: string
  description?: string
  [key: string]: unknown
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

type ApiEnvelope<T> = {
  success?: boolean
  message?: string
  data?: T
}

export class JobsApiError extends Error {
  status: number

  constructor(message: string, status = 0) {
    super(message)
    this.name = "JobsApiError"
    this.status = status
  }
}

export function isJobsApiError(error: unknown): error is JobsApiError {
  return error instanceof JobsApiError
}

export function getJobsErrorMessage(
  error: unknown,
  fallback = "Something went wrong while contacting the jobs service."
) {
  if (error instanceof JobsApiError) return error.message
  if (error instanceof Error && error.message) return error.message
  return fallback
}

async function parseBody(response: Response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

function buildHeaders(options: JobRequestOptions, init?: RequestInit) {
  const headers = new Headers(init?.headers)

  if (options.user) {
    if (options.user.id) headers.set("x-user-id", options.user.id)
    if (options.user.email) headers.set("x-user-email", options.user.email)
    if (options.user.role) headers.set("x-user-role", options.user.role)
  }

  // Server components forward the incoming Better Auth cookie explicitly.
  if (options.cookie) headers.set("cookie", options.cookie)

  return headers
}

async function request<T>(
  path: string,
  init: RequestInit,
  options: JobRequestOptions = {}
): Promise<T | null> {
  let response: Response

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: buildHeaders(options, init),
      credentials: "include",
      cache: "no-store",
      signal: options.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error
    }
    throw new JobsApiError(
      "Unable to reach the jobs service. Please check that the API server is running.",
      0
    )
  }

  const body = (await parseBody(response)) as ApiEnvelope<T> | null

  if (!response.ok) {
    throw new JobsApiError(
      body?.message || `The jobs service returned ${response.status}.`,
      response.status
    )
  }

  return body
}

/* --------------------------------- requests -------------------------------- */

export async function getJobs(
  options: JobRequestOptions = {}
): Promise<ApiJob[]> {
  const body = await request<ApiJob[]>("/api/jobs", { method: "GET" }, options)

  if (!Array.isArray(body?.data)) {
    throw new JobsApiError(
      "The jobs service returned an unexpected response.",
      502
    )
  }

  return body.data
}

export async function getJob(
  id: string,
  options: JobRequestOptions = {}
): Promise<ApiJob> {
  const body = await request<ApiJob>(
    `/api/jobs/${encodeURIComponent(id)}`,
    { method: "GET" },
    options
  )

  if (!body?.data || typeof body.data !== "object") {
    throw new JobsApiError("Job not found.", 404)
  }

  return body.data
}

export async function createJob(
  input: JobInput,
  options: JobRequestOptions = {}
): Promise<ApiJob> {
  const body = await request<ApiJob>(
    "/api/jobs",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    options
  )

  if (!body?.data) {
    throw new JobsApiError(
      body?.message || "The job was created but the server did not return it.",
      502
    )
  }

  return body.data
}

export async function updateJob(
  id: string,
  input: Partial<JobInput>,
  options: JobRequestOptions = {}
): Promise<ApiJob> {
  await request(
    `/api/jobs/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    options
  )

  // The API answers PATCH with a status message, so read the fresh record.
  return getJob(id, options)
}

export async function deleteJob(
  id: string,
  options: JobRequestOptions = {}
): Promise<void> {
  await request(
    `/api/jobs/${encodeURIComponent(id)}`,
    { method: "DELETE" },
    options
  )
}

/* --------------------------------- helpers --------------------------------- */

export function getJobStatus(job: ApiJob): "Active" | "Closed" {
  return job.closed ? "Closed" : "Active"
}

export function getJobType(job: ApiJob): string {
  if (job.type) return job.type
  return job.location?.toLowerCase().includes("remote") ? "Remote" : "Full-time"
}

export function getJobCategory(job: ApiJob): string {
  return job.category?.trim() || "General"
}

export function getJobDescription(job: ApiJob): string {
  return job.description?.trim() || ""
}

export function getJobSkills(job: ApiJob): string[] {
  return Array.isArray(job.skills) ? job.skills.filter(Boolean) : []
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
  return job._id ? job._id.slice(-6).toUpperCase() : "—"
}

/**
 * Extracts the lower bound of a free-form salary string and returns it in
 * thousands (e.g. "$150k - $190k" -> 150, "$120,000" -> 120).
 */
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
    if (!Number.isFinite(amount) || amount <= 0) return ""
    return amount >= 1000
      ? `${symbol}${Math.round(amount / 1000)}k`
      : `${symbol}${amount}`
  }

  const lower = format(min)
  const upper = format(max)

  if (lower && upper) return `${lower} - ${upper}`
  return lower || upper
}

export function combineDescription(
  responsibilities: string,
  requirements: string,
  benefits: string
) {
  return [responsibilities, requirements, benefits]
    .map((part) => part.trim())
    .filter(Boolean)
    .join("\n\n")
}

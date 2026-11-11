/**
 * Typed client for the Saved Jobs API.
 *
 * Every request is authenticated with the Better Auth JWT. The backend
 * resolves the seeker from the verified token, so no user id, email or role
 * is ever read from client supplied headers here.
 */

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "")

export type SavedJob = {
  _id: string
  jobId: string
  userId?: string
  userEmail?: string
  userName?: string
  savedAt: string
  title: string
  company: string
  location: string
  salary?: string
  category?: string
  description?: string
  status?: string
  closed?: boolean
}

type ApiEnvelope<T> = {
  success?: boolean
  message?: string
  data?: T
  total?: number
}

export class SavedJobsApiError extends Error {
  status: number

  constructor(message: string, status = 0) {
    super(message)
    this.name = "SavedJobsApiError"
    this.status = status
  }
}

export function getSavedJobsErrorMessage(
  error: unknown,
  fallback = "Something went wrong while loading saved jobs."
) {
  if (error instanceof SavedJobsApiError) return error.message
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

async function request(
  path: string,
  init: RequestInit,
  token: string,
  signal?: AbortSignal
): Promise<unknown> {
  let response: Response

  try {
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

    throw new SavedJobsApiError(
      "Unable to reach the saved jobs service. Please try again.",
      0
    )
  }

  const body = await parseBody(response)

  if (
    !response.ok ||
    (body &&
      typeof body === "object" &&
      "success" in body &&
      (body as ApiEnvelope<unknown>).success === false)
  ) {
    throw new SavedJobsApiError(
      (body as ApiEnvelope<unknown> | null)?.message ||
        `The saved jobs service returned ${response.status}.`,
      response.status
    )
  }

  return body
}

export async function getSavedJobs(
  token: string,
  signal?: AbortSignal
): Promise<SavedJob[]> {
  const body = await request("/api/saved-jobs", { method: "GET" }, token, signal)
  const data = (body as ApiEnvelope<SavedJob[]> | null)?.data

  if (!Array.isArray(data)) {
    throw new SavedJobsApiError(
      "The saved jobs service returned an unexpected response.",
      502
    )
  }

  return data
}

export async function checkSavedJob(
  jobId: string,
  token: string,
  signal?: AbortSignal
): Promise<boolean> {
  const body = await request(
    `/api/saved-jobs/check/${encodeURIComponent(jobId)}`,
    { method: "GET" },
    token,
    signal
  )

  return Boolean((body as { saved?: boolean } | null)?.saved)
}

export async function saveJob(jobId: string, token: string): Promise<void> {
  await request(
    "/api/saved-jobs",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    },
    token
  )
}

export async function removeSavedJob(
  jobId: string,
  token: string
): Promise<void> {
  await request(
    `/api/saved-jobs/${encodeURIComponent(jobId)}`,
    { method: "DELETE" },
    token
  )
}

export function getSavedJobStatus(
  job: Pick<SavedJob, "status" | "closed">
): "Active" | "Closed" | "Draft" {
  if (job.status?.toLowerCase() === "draft") return "Draft"

  return job.closed || job.status?.toLowerCase() === "closed"
    ? "Closed"
    : "Active"
}

export function getSavedJobDate(value?: string | Date | null): string {
  if (!value) return "Recently saved"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "Recently saved"

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

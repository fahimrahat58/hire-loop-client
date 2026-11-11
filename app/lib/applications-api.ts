/**
 * Typed client for the HireLoop application endpoints.
 *
 * The backend currently exposes:
 * - GET  /api/applications/check          (does this email have an application?)
 * - POST /api/applications                (submit an application)
 *
 * There is no seeker application-list endpoint, so the dashboard detects
 * submitted applications by checking each published job with the seeker's
 * verified account email. Pipeline status and applied timestamps are not
 * exposed by the API and are therefore not invented in the UI.
 */

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "")

export type ApplicationInput = {
  jobId: string
  name: string
  email: string
  experience?: string
  resumeUrl?: string
  coverLetter?: string
}

export type ApplicationRecord = {
  _id?: string
  jobId: string
  jobTitle?: string
  company?: string
  applicantName?: string
  applicantEmail?: string
  status?: string
  appliedAt?: string
}

type ApiEnvelope<T> = {
  success?: boolean
  message?: string
  data?: T
}

export class ApplicationsApiError extends Error {
  status: number

  constructor(message: string, status = 0) {
    super(message)
    this.name = "ApplicationsApiError"
    this.status = status
  }
}

export function getApplicationsErrorMessage(
  error: unknown,
  fallback = "Something went wrong while contacting the applications service."
) {
  if (error instanceof ApplicationsApiError) return error.message
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
  signal?: AbortSignal
): Promise<unknown> {
  let response: Response

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...init.headers,
      },
      credentials: "include",
      cache: "no-store",
      signal: signal ?? init.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error
    }

    throw new ApplicationsApiError(
      "Unable to reach the applications service. Please try again.",
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
    throw new ApplicationsApiError(
      (body as ApiEnvelope<unknown> | null)?.message ||
        `The applications service returned ${response.status}.`,
      response.status
    )
  }

  return body
}

export async function checkApplication(
  jobId: string,
  email: string,
  signal?: AbortSignal
): Promise<boolean> {
  const params = new URLSearchParams({ jobId, email })
  const body = await request(
    `/api/applications/check?${params.toString()}`,
    { method: "GET" },
    signal
  )

  return Boolean((body as { applied?: boolean } | null)?.applied)
}

export async function applyToJob(
  input: ApplicationInput,
  signal?: AbortSignal
): Promise<ApplicationRecord | null> {
  const body = await request(
    "/api/applications",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    signal
  )

  return (body as ApiEnvelope<ApplicationRecord> | null)?.data ?? null
}

/**
 * Checks a list of jobs in small batches so the browser does not fire an
 * unbounded number of requests at the API.
 */
export async function getAppliedJobIds(
  jobIds: string[],
  email: string,
  signal?: AbortSignal
): Promise<string[]> {
  const applied: string[] = []
  const batchSize = 6

  for (let index = 0; index < jobIds.length; index += batchSize) {
    if (signal?.aborted) {
      throw new DOMException("Request aborted", "AbortError")
    }

    const batch = jobIds.slice(index, index + batchSize)

    const results = await Promise.all(
      batch.map(async (jobId) => ({
        jobId,
        applied: await checkApplication(jobId, email, signal),
      }))
    )

    for (const result of results) {
      if (result.applied) applied.push(result.jobId)
    }
  }

  return applied
}

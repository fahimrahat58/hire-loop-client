import { authClient } from "@/app/lib/auth-client"
import { getHttpErrorMessage } from "@/app/lib/api-errors"

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "")

export type ApplicationInput = {
  jobId: string
  name?: string
  email?: string
  experience?: string
  resumeUrl?: string
  coverLetter?: string
}

export type ApplicationRecord = {
  _id?: string
  jobId: string
  jobTitle?: string
  company?: string
  applicantUserId?: string
  applicantName?: string
  applicantEmail?: string
  status?: string
  appliedAt?: string
}

export const APPLICATION_STATUSES = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Offered",
  "Rejected",
] as const

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export type RecruiterApplication = {
  id: string
  jobId: string
  name: string
  email: string
  role: string
  company?: string
  applied: string
  experience: string
  resumeUrl: string
  coverLetter: string
  status: string
}

export type RecruiterJobInfo = {
  id: string
  title: string
  company: string
}

export type RecruiterJobApplicantsResult = {
  applications: RecruiterApplication[]
  job: RecruiterJobInfo | null
}

type ApiEnvelope<T> = {
  success?: boolean
  message?: string
  code?: string
  limit?: number
  used?: number
  data?: T
}

export class ApplicationsApiError extends Error {
  status: number
  code?: string
  limit?: number
  used?: number

  constructor(
    message: string,
    status = 0,
    details?: {
      code?: string
      limit?: number
      used?: number
    }
  ) {
    super(message)

    this.name = "ApplicationsApiError"
    this.status = status
    this.code = details?.code
    this.limit = details?.limit
    this.used = details?.used
  }
}

export function getApplicationsErrorMessage(
  error: unknown,
  fallback = "Something went wrong while contacting the applications service."
) {
  if (error instanceof ApplicationsApiError) {
    return getHttpErrorMessage(error.status, fallback, error.message)
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

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

async function getAuthToken() {
  const tokenResult = await authClient.token()
  const token = tokenResult.data?.token

  if (!token) {
    throw new ApplicationsApiError(
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
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      throw error
    }

    if (error instanceof ApplicationsApiError) {
      throw error
    }

    throw new ApplicationsApiError(
      "Unable to reach the applications service. Please try again.",
      0
    )
  }

  const body = (await parseBody(response)) as ApiEnvelope<unknown> | null

  if (!response.ok || body?.success === false) {
    throw new ApplicationsApiError(
      body?.message ||
        `The applications service returned ${response.status}.`,
      response.status,
      {
        code: body?.code,
        limit: body?.limit,
        used: body?.used,
      }
    )
  }

  return body
}

// ------------------------------------
// CHECK APPLICATION
// ------------------------------------

export async function checkApplication(
  jobId: string,
  _email?: string,
  signal?: AbortSignal
): Promise<boolean> {
  const params = new URLSearchParams({ jobId })

  const body = await request(
    `/api/applications/check?${params.toString()}`,
    { method: "GET" },
    signal
  )

  return Boolean(
    (body as { applied?: boolean } | null)?.applied
  )
}

// ------------------------------------
// APPLY TO JOB
// ------------------------------------

export async function applyToJob(
  input: ApplicationInput,
  signal?: AbortSignal
): Promise<ApplicationRecord | null> {
  const body = await request(
    "/api/applications",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jobId: input.jobId,
        experience: input.experience,
        resumeUrl: input.resumeUrl,
        coverLetter: input.coverLetter,
      }),
    },
    signal
  )

  return (
    (body as ApiEnvelope<ApplicationRecord> | null)?.data ?? null
  )
}

// ------------------------------------
// RECRUITER APPLICATIONS
// ------------------------------------

export async function getRecruiterApplications(
  signal?: AbortSignal
): Promise<RecruiterApplication[]> {
  const body = await request(
    "/api/applications/recruiter",
    { method: "GET" },
    signal
  )

  const data = (body as ApiEnvelope<RecruiterApplication[]> | null)?.data

  if (!Array.isArray(data)) {
    throw new ApplicationsApiError(
      "The applications service returned an invalid response.",
      502
    )
  }

  return data
}

export async function getRecruiterJobApplicants(
  jobId: string,
  signal?: AbortSignal
): Promise<RecruiterJobApplicantsResult> {
  const body = await request(
    `/api/applications/recruiter/${encodeURIComponent(jobId)}`,
    { method: "GET" },
    signal
  )

  const envelope = body as
    | (ApiEnvelope<RecruiterApplication[]> & { job?: RecruiterJobInfo })
    | null

  if (!Array.isArray(envelope?.data)) {
    throw new ApplicationsApiError(
      "The applications service returned an invalid response.",
      502
    )
  }

  return {
    applications: envelope.data,
    job: envelope.job ?? null,
  }
}

export async function updateRecruiterApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  signal?: AbortSignal
): Promise<void> {
  await request(
    `/api/applications/${encodeURIComponent(applicationId)}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    },
    signal
  )
}

// ------------------------------------
// GET APPLIED JOB IDS
// ------------------------------------

export async function getAppliedJobIds(
  jobIds: string[],
  email?: string,
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
      if (result.applied) {
        applied.push(result.jobId)
      }
    }
  }

  return applied
}
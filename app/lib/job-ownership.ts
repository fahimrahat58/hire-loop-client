import type { ApiJob, JobUser } from "./jobs-api"

const OWNER_KEY = "hireloop:job-owners"

type OwnerRegistry = Record<string, string>

function userKey(user?: JobUser | null) {
  if (!user) return ""
  return user.id || user.email || ""
}

function readRegistry(): OwnerRegistry {
  if (typeof window === "undefined") return {}

  try {
    const raw = window.localStorage.getItem(OWNER_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    return parsed && typeof parsed === "object" ? (parsed as OwnerRegistry) : {}
  } catch {
    return {}
  }
}

function writeRegistry(registry: OwnerRegistry) {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(OWNER_KEY, JSON.stringify(registry))
  } catch {
    // Storage can be unavailable (private mode, quota). Ownership simply
    // falls back to the owner fields returned by the API.
  }
}

function getJobOwnerKey(job: ApiJob) {
  return (
    job.recruiterId ||
    job.createdBy ||
    job.ownerId ||
    job.userId ||
    job.ownerEmail ||
    ""
  )
}

/** Records the creator of a job so it can be managed after a page reload. */
export function rememberJobOwner(job: ApiJob, user?: JobUser | null) {
  const key = userKey(user)
  if (!key || !job._id) return

  const registry = readRegistry()
  registry[job._id] = key
  writeRegistry(registry)
}

export function forgetJobOwner(jobId: string) {
  const registry = readRegistry()
  if (!(jobId in registry)) return
  delete registry[jobId]
  writeRegistry(registry)
}

/**
 * Admin can manage every job, a recruiter can manage jobs they own, and a
 * seeker can never manage jobs. When there is no signed-in user (preview
 * mode) management is allowed so the demo remains usable.
 */
export function isJobOwnedBy(job: ApiJob, user?: JobUser | null): boolean {
  if (!user) return true
  if (user.role === "admin") return true
  if (user.role !== "recruiter") return false

  const apiOwner = getJobOwnerKey(job)
  if (apiOwner) {
    return apiOwner === user.id || apiOwner === user.email
  }

  const key = userKey(user)
  if (!key) return false

  return readRegistry()[job._id] === key
}

export function filterManageableJobs(jobs: ApiJob[], user?: JobUser | null) {
  if (!user || user.role === "admin") return jobs
  if (user.role !== "recruiter") return []
  return jobs.filter((job) => isJobOwnedBy(job, user))
}

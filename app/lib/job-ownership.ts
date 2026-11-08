
import type { ApiJob, JobUser } from "./jobs-api"

const OWNER_KEY = "hireloop:job-owners"

type OwnerRegistry = Record<string, string>

function userKey(user?: JobUser | null) {
  if (!user) return ""

  return user.id || user.email?.trim().toLowerCase() || ""
}

function getRole(user?: JobUser | null) {
  return user?.role?.trim().toLowerCase() || ""
}

function readRegistry(): OwnerRegistry {
  if (typeof window === "undefined") return {}

  try {
    const raw = localStorage.getItem(OWNER_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeRegistry(registry: OwnerRegistry) {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(OWNER_KEY, JSON.stringify(registry))
  } catch {
    // Ignore storage errors
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

export function rememberJobOwner(
  job: ApiJob,
  user?: JobUser | null
) {
  const key = userKey(user)

  if (!key || !job._id) return

  const registry = readRegistry()
  registry[job._id] = key

  writeRegistry(registry)
}

export function forgetJobOwner(jobId: string) {
  const registry = readRegistry()

  delete registry[jobId]
  writeRegistry(registry)
}

export function isJobOwnedBy(
  job: ApiJob,
  user?: JobUser | null
): boolean {
  if (!user) return false

  if (getRole(user) === "admin") return true

  if (getRole(user) !== "recruiter") return false

  const apiOwner = getJobOwnerKey(job)

  if (apiOwner) {
    const owner = String(apiOwner).trim().toLowerCase()

    return (
      owner === user.id?.trim().toLowerCase() ||
      owner === user.email?.trim().toLowerCase()
    )
  }

  const key = userKey(user)

  return key ? readRegistry()[job._id] === key : false
}

export function filterManageableJobs(
  jobs: ApiJob[],
  user?: JobUser | null
) {
  const role = getRole(user)

  if (role === "admin") return jobs

  if (!user || role !== "recruiter") return []

  return jobs.filter((job) => isJobOwnedBy(job, user))
}

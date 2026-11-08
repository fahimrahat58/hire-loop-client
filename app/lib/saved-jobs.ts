/**
 * Client-side bookmarks for jobs returned by the Jobs API.
 *
 * There is no saved-jobs endpoint yet, so the dashboard stores the job IDs in
 * localStorage. The saved page then loads the real jobs from the API and
 * filters them with these IDs.
 */

export type SavedJobEntry = {
  id: string
  savedAt: number
}

const SAVED_KEY = "hireloop:saved-jobs"
const CHANGE_EVENT = "hireloop:saved-jobs-changed"

function readSavedJobs(): SavedJobEntry[] {
  if (typeof window === "undefined") return []

  try {
    const raw = window.localStorage.getItem(SAVED_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((entry) => {
        if (typeof entry === "string") {
          return { id: entry, savedAt: 0 }
        }

        if (
          entry &&
          typeof entry === "object" &&
          "id" in entry &&
          typeof (entry as SavedJobEntry).id === "string"
        ) {
          return {
            id: (entry as SavedJobEntry).id,
            savedAt: Number((entry as SavedJobEntry).savedAt) || 0,
          }
        }

        return null
      })
      .filter((entry): entry is SavedJobEntry => Boolean(entry))
  } catch {
    return []
  }
}

function writeSavedJobs(entries: SavedJobEntry[]) {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(entries))
    window.dispatchEvent(new Event(CHANGE_EVENT))
  } catch {
    // Ignore storage failures; bookmarks remain in component state.
  }
}

export function getSavedJobs(): SavedJobEntry[] {
  return readSavedJobs()
}

export function getSavedJobIds(): string[] {
  return readSavedJobs().map((entry) => entry.id)
}

export function isJobSaved(jobId: string): boolean {
  return readSavedJobs().some((entry) => entry.id === jobId)
}

/** Adds or removes a bookmark and returns the new saved state. */
export function toggleSavedJob(jobId: string): boolean {
  const entries = readSavedJobs()
  const exists = entries.some((entry) => entry.id === jobId)

  if (exists) {
    writeSavedJobs(entries.filter((entry) => entry.id !== jobId))
    return false
  }

  writeSavedJobs([{ id: jobId, savedAt: Date.now() }, ...entries])
  return true
}

export function removeSavedJob(jobId: string) {
  writeSavedJobs(readSavedJobs().filter((entry) => entry.id !== jobId))
}

export function onSavedJobsChange(listener: () => void) {
  if (typeof window === "undefined") return () => {}
  window.addEventListener(CHANGE_EVENT, listener)
  return () => window.removeEventListener(CHANGE_EVENT, listener)
}

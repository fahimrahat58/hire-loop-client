"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { authClient } from "@/app/lib/auth-client"
import { getAuthToken } from "@/app/lib/auth-token"
import {
  getSavedJobs,
  getSavedJobsErrorMessage,
  removeSavedJob,
  saveJob,
  type SavedJob,
} from "@/app/lib/saved-jobs"

export function useSavedJobs() {
  const { data: session, isPending } = authClient.useSession()

  const role = session?.user?.role
  const enabled = !isPending && role === "seeker"

  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingIds, setPendingIds] = useState<string[]>([])

  const requestRef = useRef(0)

  const load = useCallback(
    async (options?: { silent?: boolean; signal?: AbortSignal }) => {
      const requestId = ++requestRef.current

      if (!enabled) {
        if (requestId === requestRef.current) {
          setSavedJobs([])
          setError(null)
          setLoading(false)
        }
        return
      }

      if (!options?.silent) setLoading(true)

      setError(null)

      try {
        const token = await getAuthToken()
        const data = await getSavedJobs(token, options?.signal)

        if (requestId !== requestRef.current) return

        setSavedJobs(data)
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return
        }

        if (requestId !== requestRef.current) return

        setError(getSavedJobsErrorMessage(requestError))
      } finally {
        if (requestId === requestRef.current) {
          setLoading(false)
        }
      }
    },
    [enabled]
  )

  useEffect(() => {
    if (isPending) return

    const controller = new AbortController()

    void load({ signal: controller.signal })

    return () => controller.abort()
  }, [isPending, load])

  const markPending = useCallback((jobId: string, pending: boolean) => {
    setPendingIds((current) =>
      pending
        ? current.includes(jobId)
          ? current
          : [...current, jobId]
        : current.filter((id) => id !== jobId)
    )
  }, [])

  const save = useCallback(
    async (jobId: string) => {
      markPending(jobId, true)

      try {
        const token = await getAuthToken()
        await saveJob(jobId, token)
        await load({ silent: true })
      } finally {
        markPending(jobId, false)
      }
    },
    [load, markPending]
  )

  const remove = useCallback(
    async (jobId: string) => {
      markPending(jobId, true)

      try {
        const token = await getAuthToken()
        await removeSavedJob(jobId, token)
        setSavedJobs((current) => current.filter((job) => job.jobId !== jobId))
        await load({ silent: true })
      } finally {
        markPending(jobId, false)
      }
    },
    [load, markPending]
  )

  const savedIds = useMemo(
    () => new Set(savedJobs.map((job) => job.jobId)),
    [savedJobs]
  )

  const isSaved = useCallback(
    (jobId: string) => savedIds.has(jobId),
    [savedIds]
  )

  return {
    savedJobs,
    savedIds,
    isSaved,
    loading: loading || isPending,
    error,
    reload: load,
    save,
    remove,
    pendingIds,
    session,
    isPending,
    enabled,
  }
}

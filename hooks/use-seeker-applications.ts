"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { authClient } from "@/app/lib/auth-client"
import {
  getApplicationsErrorMessage,
  getAppliedJobIds,
} from "@/app/lib/applications-api"
import type { ApiJob } from "@/app/lib/jobs-api"

function isPublishedJob(job: ApiJob) {
  return job.status?.toLowerCase() !== "draft"
}

export function useSeekerApplications(jobs: ApiJob[]) {
  const { data: session, isPending } = authClient.useSession()

  const email = session?.user?.email
  const role = session?.user?.role

  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const requestRef = useRef(0)

  const load = useCallback(
    async (options?: { silent?: boolean; signal?: AbortSignal }) => {
      const requestId = ++requestRef.current

      if (isPending) return

      if (!email || role !== "seeker") {
        setAppliedJobIds([])
        setError(null)
        setLoading(false)
        return
      }

      const jobIds = jobs.filter(isPublishedJob).map((job) => job._id)

      if (jobIds.length === 0) {
        setAppliedJobIds([])
        setError(null)
        setLoading(false)
        return
      }

      if (!options?.silent) setLoading(true)

      setError(null)

      try {
        const applied = await getAppliedJobIds(
          jobIds,
          email,
          options?.signal
        )

        if (requestId !== requestRef.current) return

        setAppliedJobIds(applied)
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return
        }

        if (requestId !== requestRef.current) return

        setError(getApplicationsErrorMessage(requestError))
      } finally {
        if (requestId === requestRef.current) {
          setLoading(false)
        }
      }
    },
    [email, role, isPending, jobs]
  )

  useEffect(() => {
    if (isPending) return

    const controller = new AbortController()

    void load({ signal: controller.signal })

    return () => controller.abort()
  }, [isPending, load])

  const appliedSet = useMemo(
    () => new Set(appliedJobIds),
    [appliedJobIds]
  )

  return {
    appliedJobIds,
    appliedSet,
    loading: loading || isPending,
    error,
    reload: load,
    session,
    isPending,
  }
}

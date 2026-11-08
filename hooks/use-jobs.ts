"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { authClient } from "@/app/lib/auth-client"
import { getJobs, getJobsErrorMessage, type ApiJob } from "@/app/lib/jobs-api"

export function useJobs() {
  const { data: session, isPending } = authClient.useSession()

  const [jobs, setJobs] = useState<ApiJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const requestRef = useRef(0)

  const userId = session?.user?.id
  const userEmail = session?.user?.email
  const userRole = session?.user?.role

  const user = useMemo(
    () => ({
      id: userId,
      email: userEmail,
      role: userRole,
    }),
    [userId, userEmail, userRole]
  )

  const load = useCallback(
    async (options?: { silent?: boolean; signal?: AbortSignal }) => {
      const requestId = ++requestRef.current

      if (!options?.silent) setLoading(true)

      setError(null)

      try {
        const data = await getJobs({
          user,
          signal: options?.signal,
        })

        if (requestId !== requestRef.current) return

        setJobs(data)
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return
        }

        if (requestId !== requestRef.current) return

        setError(getJobsErrorMessage(requestError))
      } finally {
        if (requestId === requestRef.current) {
          setLoading(false)
        }
      }
    },
    [user]
  )

  useEffect(() => {
    if (isPending) return

    const controller = new AbortController()

    void load({ signal: controller.signal })

    return () => controller.abort()
  }, [isPending, load])

  return {
    jobs,
    setJobs,
    loading: loading || isPending,
    error,
    reload: load,
    session,
    isPending,
    user,
  }
}

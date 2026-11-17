"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { authClient } from "@/app/lib/auth-client"
import { getApplicationsErrorMessage } from "@/app/lib/applications-api"

import type { ApiJob } from "@/app/lib/jobs-api"

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "")

export type SeekerApplication = {
  id: string
  jobId: string
  jobTitle: string
  company: string
  applicantName: string
  applicantEmail: string
  experience: string
  resumeUrl: string
  coverLetter: string
  status: string
  appliedAt: string | Date
  updatedAt: string | Date
}

type ApplicationResponse = {
  success: boolean
  message?: string
  data: SeekerApplication[]
  total: number
}

export function useSeekerApplications(_jobs: ApiJob[]) {
  const { data: session, isPending } = authClient.useSession()

  const email = session?.user?.email
  const role = session?.user?.role

  const [applications, setApplications] = useState<SeekerApplication[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const requestRef = useRef(0)

  const load = useCallback(
    async (options?: { silent?: boolean; signal?: AbortSignal }) => {
      const requestId = ++requestRef.current

      if (isPending) return

      if (!email || role !== "seeker") {
        setApplications([])
        setError(null)
        setLoading(false)
        return
      }

      if (!options?.silent) {
        setLoading(true)
      }

      setError(null)

      try {
        const { data: tokenData, error: tokenError } = await authClient.token()

        if (tokenError || !tokenData?.token) {
          throw new Error("Authentication token not available.")
        }

        const response = await fetch(
          `${API_URL}/api/applications/my-applications`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${tokenData.token}`,
            },
            credentials: "include",
            cache: "no-store",
            signal: options?.signal,
          }
        )

        const result = (await response.json()) as ApplicationResponse

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load applications.")
        }

        if (requestId !== requestRef.current) return

        setApplications(Array.isArray(result.data) ? result.data : [])
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
    [email, role, isPending]
  )

  useEffect(() => {
    if (isPending) return

    const controller = new AbortController()

    void load({ signal: controller.signal })

    return () => {
      controller.abort()
    }
  }, [isPending, load])

  // Application Job IDs
  const appliedJobIds = useMemo(
    () => applications.map((application) => application.jobId),
    [applications]
  )

  // Existing page compatibility
  const appliedSet = useMemo(() => new Set(appliedJobIds), [appliedJobIds])

  return {
    applications,
    appliedJobIds,
    appliedSet,
    loading: loading || isPending,
    error,
    reload: load,
    session,
    isPending,
  }
}

"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2, Check } from "lucide-react"
import { authClient } from "@/app/lib/auth-client"
import {
  ApplicationsApiError,
  applyToJob,
  checkApplication,
  getApplicationsErrorMessage,
} from "@/app/lib/applications-api"

interface ApplyButtonProps {
  jobId: string
  name: string
  email: string
  experience?: string
  resumeUrl?: string
  coverLetter?: string
  className?: string
}

export default function ApplyButton({
  jobId,
  name,
  email,
  experience = "",
  resumeUrl = "",
  coverLetter = "",
  className = "",
}: ApplyButtonProps) {
  const { data: session } = authClient.useSession()

  const [loading, setLoading] = useState(false)
  const [applied, setApplied] = useState(false)
  const [checking, setChecking] = useState(true)

  const role = session?.user?.role

  // Check whether the seeker already applied to this job.
  useEffect(() => {
    if (!jobId || !email || role !== "seeker") {
      setChecking(false)
      return
    }

    const controller = new AbortController()
    let active = true

    checkApplication(jobId, email, controller.signal)
      .then((alreadyApplied) => {
        if (active) setApplied(alreadyApplied)
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return
        }

        if (active) {
          toast.error(
            getApplicationsErrorMessage(
              error,
              "Unable to check your application status."
            )
          )
        }
      })
      .finally(() => {
        if (active) setChecking(false)
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [jobId, email, role])

  const handleApply = async () => {
    if (!session?.user) {
      toast.error("Please sign in to apply for this job")
      return
    }

    if (role !== "seeker") {
      toast.error("Only job seekers can apply for jobs")
      return
    }

    if (!jobId || !name || !email) {
      toast.error("Please complete your profile before applying")
      return
    }

    if (applied || loading) return

    setLoading(true)

    try {
      await applyToJob({
        jobId,
        name,
        email,
        experience,
        resumeUrl,
        coverLetter,
      })

      setApplied(true)
      toast.success("Application submitted successfully!")
    } catch (error) {
      if (error instanceof ApplicationsApiError && error.status === 409) {
        setApplied(true)
      }

      toast.error(
        getApplicationsErrorMessage(error, "Something went wrong while applying.")
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleApply()}
      disabled={loading || applied || checking}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
        applied ? "bg-emerald-600" : "bg-cyan-500 hover:bg-cyan-600"
      } ${className}`}
    >
      {loading || checking ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : applied ? (
        <Check className="h-4 w-4" />
      ) : null}

      {checking
        ? "Checking..."
        : loading
          ? "Applying..."
          : applied
            ? "Applied"
            : "Apply"}
    </button>
  )
}

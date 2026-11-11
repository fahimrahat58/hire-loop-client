"use client"

import { useEffect, useState } from "react"
import { Bookmark, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/app/lib/auth-client"
import { getAuthToken } from "@/app/lib/auth-token"
import {
  checkSavedJob,
  getSavedJobsErrorMessage,
  removeSavedJob,
  saveJob,
} from "@/app/lib/saved-jobs"

interface SaveJobButtonProps {
  jobId: string
  className?: string
}

export default function SaveJobButton({
  jobId,
  className = "",
}: SaveJobButtonProps) {
  const { data: session, isPending } = authClient.useSession()

  const user = session?.user
  const isSeeker = user?.role === "seeker"

  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (isPending) return

    if (!user?.email || !isSeeker) {
      setChecking(false)
      return
    }

    const controller = new AbortController()
    let active = true

    const run = async () => {
      try {
        const token = await getAuthToken()
        const alreadySaved = await checkSavedJob(jobId, token, controller.signal)

        if (active) setSaved(alreadySaved)
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return
        }

        if (active) {
          toast.error(
            getSavedJobsErrorMessage(
              error,
              "Unable to check whether this job is saved."
            )
          )
        }
      } finally {
        if (active) setChecking(false)
      }
    }

    void run()

    return () => {
      active = false
      controller.abort()
    }
  }, [jobId, user?.email, isSeeker, isPending])

  const handleSave = async () => {
    if (loading || checking) return

    setLoading(true)

    try {
      const token = await getAuthToken()

      if (saved) {
        await removeSavedJob(jobId, token)
        setSaved(false)
        toast.success("Job removed from saved jobs")
      } else {
        await saveJob(jobId, token)
        setSaved(true)
        toast.success("Job saved successfully")
      }
    } catch (error) {
      toast.error(getSavedJobsErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  if (isPending || !user?.email || !isSeeker) {
    return null
  }

  return (
    <button
      type="button"
      onClick={() => void handleSave()}
      disabled={loading || checking}
      aria-label={saved ? "Remove saved job" : "Save job"}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-6 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        saved
          ? "bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25"
          : "bg-white/5 text-gray-200 hover:bg-white/10"
      } ${className}`}
    >
      {loading || checking ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Bookmark className={`size-4 ${saved ? "fill-current" : ""}`} />
      )}

      {checking ? "Checking..." : saved ? "Saved" : "Save Job"}
    </button>
  )
}

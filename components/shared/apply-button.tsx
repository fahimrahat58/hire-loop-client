"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Loader2, Check, X, Crown, ArrowRight, LockKeyhole } from "lucide-react"

import { authClient } from "@/app/lib/auth-client"
import {
  ApplicationsApiError,
  applyToJob,
  checkApplication,
  getApplicationsErrorMessage,
} from "@/app/lib/applications-api"

const FREE_APPLICATION_LIMIT = 5

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
  const [showLimitDialog, setShowLimitDialog] = useState(false)

  const role = session?.user?.role

  useEffect(() => {
    if (!jobId || !email || role !== "seeker") {
      setChecking(false)
      return
    }

    const controller = new AbortController()
    let active = true

    setChecking(true)

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
        toast.info("You have already applied for this job.")
        return
      }

      if (error instanceof ApplicationsApiError && error.status === 429) {
        setShowLimitDialog(true)
        return
      }

      toast.error(
        getApplicationsErrorMessage(
          error,
          "Something went wrong while applying."
        )
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
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

      {showLimitDialog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setShowLimitDialog(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-limit-title"
            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#1c1a1d] p-7 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowLimitDialog(false)}
              aria-label="Close dialog"
              className="absolute top-4 right-4 rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
            >
              <X className="size-5" />
            </button>

            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/10">
              <LockKeyhole className="size-7 text-amber-400" />
            </div>

            <div className="mt-5 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
                <Crown className="size-3.5" />
                Free plan limit reached
              </div>

              <h2
                id="application-limit-title"
                className="mt-4 text-2xl font-bold text-white"
              >
                You've reached your application limit!
              </h2>

              <p className="mt-3 text-sm leading-6 text-gray-400">
                You've used all {FREE_APPLICATION_LIMIT} free job applications.
                Upgrade your plan to Premium to continue applying for unlimited
                job opportunities.
              </p>
            </div>

            <div className="mt-7 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Free applications</span>
                <span className="font-semibold text-amber-400">
                  {FREE_APPLICATION_LIMIT} / {FREE_APPLICATION_LIMIT}
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-full rounded-full bg-amber-500" />
              </div>
            </div>

            <Link
              href="/dashboard/seeker/billing"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-cyan-600"
            >
              Upgrade Your Plan
              <ArrowRight className="size-4" />
            </Link>

            <button
              type="button"
              onClick={() => setShowLimitDialog(false)}
              className="mt-3 w-full rounded-xl px-5 py-3 text-sm font-medium text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}
    </>
  )
}

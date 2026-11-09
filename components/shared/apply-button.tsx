"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2, Check } from "lucide-react"

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
  const [loading, setLoading] = useState(false)
  const [applied, setApplied] = useState(false)
  const [checking, setChecking] = useState(true)

  // Check whether the user already applied
  useEffect(() => {
    const checkApplication = async () => {
      if (!jobId || !email) {
        setChecking(false)
        return
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/applications/check?jobId=${encodeURIComponent(jobId)}&email=${encodeURIComponent(email)}`,
          { cache: "no-store" }
        )

        const result = await response.json()

        if (response.ok && result.success) {
          setApplied(result.applied)
        }
      } catch (error) {
        console.error("CHECK APPLICATION ERROR:", error)
      } finally {
        setChecking(false)
      }
    }

    checkApplication()
  }, [jobId, email])

  const handleApply = async () => {
    if (!jobId || !name || !email) {
      toast.error("Please login to apply for this job")
      return
    }

    if (applied || loading) return

    try {
      setLoading(true)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/applications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobId,
            name,
            email,
            experience,
            resumeUrl,
            coverLetter,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setApplied(true)
        }

        throw new Error(result.message || "Failed to apply")
      }

      setApplied(true)
      toast.success("Application submitted successfully!")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleApply}
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

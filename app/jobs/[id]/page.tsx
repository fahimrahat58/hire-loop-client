"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, MapPin, Briefcase, Banknote, Loader2 } from "lucide-react"

import ApplyButton from "@/components/shared/apply-button"
import SaveJobButton from "@/components/shared/save-job-button"
import { authClient } from "@/app/lib/auth-client"

interface Job {
  _id: string
  title: string
  company: string
  description: string
  location: string
  type?: string
  jobType?: string
  salary: string
  closed?: boolean
  requirements?: string[]
  responsibilities?: string[]
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function JobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: session, isPending } = authClient.useSession()
  const user = session?.user

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!id || !API_URL) {
      setError("API configuration is missing")
      setLoading(false)
      return
    }

    const fetchJob = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await fetch(`${API_URL}/api/jobs/${id}`, {
          cache: "no-store",
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Job not found")
        }

        setJob(result.data)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load job")
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [id])

  // LOADING
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 px-4 text-gray-400">
        <Loader2 className="size-6 animate-spin" />
        <span className="text-sm sm:text-base">Loading job details...</span>
      </div>
    )
  }

  // ERROR
  if (error || !job) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <h2 className="text-xl font-bold text-white sm:text-2xl">
          Job not found
        </h2>

        <p className="max-w-md text-sm leading-6 break-words text-gray-400">
          {error || "This job may have been removed."}
        </p>

        <Link
          href="/jobs"
          className="rounded-lg px-4 py-2 text-sm font-medium text-indigo-400 transition hover:bg-indigo-500/10 hover:text-indigo-300"
        >
          Browse all jobs
        </Link>
      </div>
    )
  }

  return (
    <section className="mx-auto w-full max-w-5xl overflow-hidden px-3 py-6 text-white sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      {/* BACK BUTTON */}
      <button
        onClick={() => router.back()}
        className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-400 transition hover:bg-white/5 hover:text-white sm:mb-8 sm:text-sm"
      >
        <ArrowLeft className="size-4" />
        Go back
      </button>

      {/* JOB DETAILS CARD */}
      <div className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-[#1c1a1d] p-4 sm:rounded-2xl sm:p-6 md:p-8 lg:p-10">
        {/* HEADER */}
        <div className="min-w-0">
          <p className="text-xs font-medium break-words text-indigo-400 sm:text-sm">
            {job.company || "Company"}
          </p>

          <h1 className="mt-2 text-2xl leading-tight font-bold break-words sm:mt-3 sm:text-3xl md:text-4xl">
            {job.title}
          </h1>
        </div>

        {/* JOB INFORMATION */}
        <div className="mt-5 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
          <span className="flex max-w-full min-w-0 items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-xs break-words text-gray-300 sm:px-4 sm:text-sm">
            <MapPin className="size-4 shrink-0 text-indigo-400" />
            <span className="break-words">
              {job.location || "Location not specified"}
            </span>
          </span>

          <span className="flex max-w-full min-w-0 items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-xs break-words text-gray-300 sm:px-4 sm:text-sm">
            <Briefcase className="size-4 shrink-0 text-indigo-400" />
            <span>{job.type || job.jobType || "Full-time"}</span>
          </span>

          <span className="flex max-w-full min-w-0 items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-xs break-words text-gray-300 sm:px-4 sm:text-sm">
            <Banknote className="size-4 shrink-0 text-indigo-400" />
            <span className="break-words">{job.salary || "Negotiable"}</span>
          </span>
        </div>

        {/* JOB DESCRIPTION */}
        <div className="mt-8 border-t border-white/10 pt-6 sm:mt-10 sm:pt-8">
          <h2 className="text-lg font-semibold sm:text-xl">Job Description</h2>

          <p className="mt-3 text-sm leading-7 break-words whitespace-pre-line text-gray-400 sm:mt-4 sm:leading-8">
            {job.description || "No description provided."}
          </p>
        </div>

        {/* REQUIREMENTS */}
        {job.requirements?.length ? (
          <div className="mt-7 sm:mt-8">
            <h2 className="text-lg font-semibold sm:text-xl">Requirements</h2>

            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-gray-400 sm:mt-4 sm:space-y-3">
              {job.requirements.map((item, index) => (
                <li key={index} className="pl-1 break-words">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* RESPONSIBILITIES */}
        {job.responsibilities?.length ? (
          <div className="mt-7 sm:mt-8">
            <h2 className="text-lg font-semibold sm:text-xl">
              Responsibilities
            </h2>

            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-gray-400 sm:mt-4 sm:space-y-3">
              {job.responsibilities.map((item, index) => (
                <li key={index} className="pl-1 break-words">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* ACTION BUTTONS */}
        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:pt-7">
          {/* APPLY BUTTON */}
          {job.closed ? (
            <button
              disabled
              className="flex min-h-11 w-full items-center justify-center rounded-lg bg-gray-600 px-6 py-3 text-sm font-semibold text-white opacity-60 sm:w-auto"
            >
              Applications Closed
            </button>
          ) : isPending ? (
            <button
              disabled
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-gray-600 px-6 py-3 text-sm text-white opacity-60 sm:w-auto"
            >
              <Loader2 className="size-4 animate-spin" />
              Loading...
            </button>
          ) : user?.name && user?.email ? (
            <ApplyButton
              jobId={job._id}
              name={user.name}
              email={user.email}
              className="w-full px-6 py-3 text-sm sm:w-auto"
            />
          ) : (
            <Link
              href="/sign-in"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-cyan-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 sm:w-auto"
            >
              Login to Apply
            </Link>
          )}

          {/* SAVE JOB BUTTON */}
          <div className="w-full sm:w-auto">
            <SaveJobButton jobId={job._id} />
          </div>
        </div>
      </div>
    </section>
  )
}

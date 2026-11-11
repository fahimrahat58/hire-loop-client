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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-gray-400">
        <Loader2 className="size-6 animate-spin" />
        Loading job details...
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-bold text-white">Job not found</h2>

        <p className="text-sm text-gray-400">
          {error || "This job may have been removed."}
        </p>

        <Link href="/jobs" className="text-indigo-400">
          Browse all jobs
        </Link>
      </div>
    )
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 text-white sm:px-6">
      <button
        onClick={() => router.back()}
        className="mb-8 flex items-center gap-2 text-sm text-gray-400 hover:text-white"
      >
        <ArrowLeft className="size-4" />
        Go back
      </button>

      <div className="rounded-2xl border border-white/10 bg-[#1c1a1d] p-6 sm:p-10">
        <p className="text-sm font-medium text-indigo-400">
          {job.company || "Company"}
        </p>

        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{job.title}</h1>

        <div className="mt-6 flex flex-wrap gap-3 text-sm text-gray-300">
          <span className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
            <MapPin className="size-4 text-indigo-400" />
            {job.location}
          </span>

          <span className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
            <Briefcase className="size-4 text-indigo-400" />
            {job.type || job.jobType || "Full-time"}
          </span>

          <span className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
            <Banknote className="size-4 text-indigo-400" />
            {job.salary || "Negotiable"}
          </span>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold">Job Description</h2>

          <p className="mt-4 text-sm leading-7 whitespace-pre-line text-gray-400">
            {job.description}
          </p>
        </div>

        {job.requirements?.length ? (
          <div className="mt-8">
            <h2 className="text-xl font-semibold">Requirements</h2>

            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-400">
              {job.requirements.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {job.responsibilities?.length ? (
          <div className="mt-8">
            <h2 className="text-xl font-semibold">Responsibilities</h2>

            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-400">
              {job.responsibilities.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
          {job.closed ? (
            <button
              disabled
              className="rounded-lg bg-gray-600 px-6 py-3 text-sm font-semibold text-white opacity-60"
            >
              Applications Closed
            </button>
          ) : isPending ? (
            <button
              disabled
              className="inline-flex items-center gap-2 rounded-lg bg-gray-600 px-6 py-3 text-sm text-white opacity-60"
            >
              <Loader2 className="size-4 animate-spin" />
              Loading...
            </button>
          ) : user?.name && user?.email ? (
            <ApplyButton
              jobId={job._id}
              name={user.name}
              email={user.email}
              className="px-6 py-3 text-sm"
            />
          ) : (
            <Link
              href="/sign-in"
              className="inline-flex rounded-lg bg-cyan-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600"
            >
              Login to Apply
            </Link>
          )}

          <SaveJobButton jobId={job._id} />
        </div>
      </div>
    </section>
  )
}

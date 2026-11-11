"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MapPin, Briefcase, Banknote, ArrowRight, Loader2 } from "lucide-react"
import ApplyButton from "@/components/shared/apply-button"
import { authClient } from "@/app/lib/auth-client"

interface Job {
  _id: string
  title: string
  description: string
  location: string
  type?: string
  jobType?: string
  salary: string
  closed?: boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function SmartJobDiscovery() {
  const { data: session, isPending } = authClient.useSession()

  const user = session?.user

  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        setError("")

        if (!API_URL) {
          throw new Error("API URL is not configured.")
        }

        const response = await fetch(`${API_URL}/api/jobs`, {
          cache: "no-store",
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to fetch jobs")
        }

        const allJobs: Job[] = Array.isArray(result.data) ? result.data : []

        const activeJobs = allJobs.filter((job) => !job.closed)

        setJobs(activeJobs.slice(0, 6))
      } catch (err) {
        console.error("SMART JOB DISCOVERY ERROR:", err)

        setError(err instanceof Error ? err.message : "Unable to load jobs.")
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Section Header */}

      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-2 text-[11px] font-semibold tracking-widest text-indigo-400 uppercase">
          <span>◆</span>
          <span>SMART JOB DISCOVERY</span>
          <span>◆</span>
        </div>

        <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          The roles you'd never
          <br />
          find by searching
        </h2>
      </div>

      {/* Loading */}

      {loading && (
        <div className="flex min-h-60 items-center justify-center gap-3 text-gray-400">
          <Loader2 className="size-6 animate-spin text-indigo-400" />
          <span className="text-sm">Loading jobs...</span>
        </div>
      )}

      {/* Error */}

      {!loading && error && (
        <div className="mt-12 rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Empty State */}

      {!loading && !error && jobs.length === 0 && (
        <div className="mt-12 rounded-xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <Briefcase className="mx-auto size-8 text-gray-500" />

          <h3 className="mt-3 text-lg font-semibold text-white">
            No jobs available
          </h3>

          <p className="mt-2 text-sm text-gray-400">
            New job opportunities will appear here when recruiters post them.
          </p>
        </div>
      )}

      {/* Job Cards */}

      {!loading && !error && jobs.length > 0 && (
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#1c1a1d]/60 p-6 backdrop-blur-md transition-all hover:border-white/20 hover:bg-[#221f24]/70"
            >
              <div>
                <h3 className="text-xl font-bold text-white">{job.title}</h3>

                <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-gray-400">
                  {job.description}
                </p>

                {/* Job Information */}

                <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-gray-300">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-3 py-1 text-[11px]">
                    <MapPin className="size-3.5 text-purple-400" />
                    {job.location || "Not specified"}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-3 py-1 text-[11px]">
                    <Briefcase className="size-3.5 text-purple-400" />
                    {job.type || job.jobType || "Full-time"}
                  </span>
                </div>

                {/* Salary */}

                <div className="mt-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-3 py-1 text-[11px] text-gray-300">
                    <Banknote className="size-3.5 text-purple-400" />
                    {job.salary || "Negotiable"}
                  </span>
                </div>
              </div>

              {/* Actions */}

              <div className="mt-8 flex items-center justify-between gap-3">
                <Link
                  href={`/jobs/${job._id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:border-indigo-400 hover:text-indigo-400"
                >
                  View Details
                  <ArrowRight className="size-3.5" />
                </Link>

                {!isPending && user?.name && user?.email && (
                  <ApplyButton
                    jobId={job._id}
                    name={user.name}
                    email={user.email}
                    className="px-4 py-2.5 text-xs"
                  />
                )}

                {!isPending && !user && (
                  <Link
                    href="/sign-in"
                    className="rounded-lg bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-cyan-600"
                  >
                    Login to Apply
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View All Jobs */}

      <div className="mt-12 flex justify-center">
        <Link
          href="/jobs"
          className="rounded-xl bg-white px-6 py-3 text-xs font-semibold text-black transition-all hover:bg-gray-200"
        >
          View all jobs
        </Link>
      </div>
    </section>
  )
}

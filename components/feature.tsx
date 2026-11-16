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
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      {/* Section Header */}
      <div className="flex flex-col items-center px-2 text-center">
        <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.15em] text-indigo-400 uppercase sm:text-[11px] sm:tracking-widest">
          <span>◆</span>
          <span>SMART JOB DISCOVERY</span>
          <span>◆</span>
        </div>

        <h2 className="mt-3 text-2xl leading-tight font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          The roles you'd never
          <br />
          find by searching
        </h2>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex min-h-52 items-center justify-center gap-3 text-gray-400 sm:min-h-60">
          <Loader2 className="size-6 animate-spin text-indigo-400" />
          <span className="text-sm">Loading jobs...</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/5 p-5 text-center sm:mt-12 sm:p-6">
          <p className="text-sm break-words text-red-400">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && jobs.length === 0 && (
        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center sm:mt-12 sm:p-10">
          <Briefcase className="mx-auto size-8 text-gray-500" />

          <h3 className="mt-3 text-base font-semibold text-white sm:text-lg">
            No jobs available
          </h3>

          <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-gray-400 sm:text-sm">
            New job opportunities will appear here when recruiters post them.
          </p>
        </div>
      )}

      {/* Job Cards */}
      {!loading && !error && jobs.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="flex min-w-0 flex-col justify-between rounded-xl border border-white/10 bg-[#1c1a1d]/60 p-4 backdrop-blur-md transition-all hover:border-white/20 hover:bg-[#221f24]/70 sm:rounded-2xl sm:p-5 lg:p-6"
            >
              <div className="min-w-0">
                <h3 className="text-lg leading-snug font-bold break-words text-white sm:text-xl">
                  {job.title}
                </h3>

                <p className="mt-3 line-clamp-3 text-xs leading-relaxed break-words text-gray-400 sm:text-sm">
                  {job.description}
                </p>

                {/* Job Information */}
                <div className="mt-5 flex flex-wrap items-center gap-2 sm:mt-6">
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-2.5 py-1.5 text-[10px] text-gray-300 sm:px-3 sm:text-[11px]">
                    <MapPin className="size-3.5 shrink-0 text-purple-400" />
                    <span className="break-words">
                      {job.location || "Not specified"}
                    </span>
                  </span>

                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-2.5 py-1.5 text-[10px] text-gray-300 sm:px-3 sm:text-[11px]">
                    <Briefcase className="size-3.5 shrink-0 text-purple-400" />
                    {job.type || job.jobType || "Full-time"}
                  </span>
                </div>

                {/* Salary */}
                <div className="mt-2.5">
                  <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-2.5 py-1.5 text-[10px] text-gray-300 sm:px-3 sm:text-[11px]">
                    <Banknote className="size-3.5 shrink-0 text-purple-400" />
                    <span className="break-words">
                      {job.salary || "Negotiable"}
                    </span>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-2 sm:mt-8 sm:gap-3">
                <Link
                  href={`/jobs/${job._id}`}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 py-2.5 text-[11px] font-semibold whitespace-nowrap text-white transition hover:border-indigo-400 hover:text-indigo-400 sm:flex-none sm:px-4 sm:text-xs"
                >
                  View Details
                  <ArrowRight className="size-3.5 shrink-0" />
                </Link>

                {!isPending && user?.name && user?.email && (
                  <ApplyButton
                    jobId={job._id}
                    name={user.name}
                    email={user.email}
                    className="flex-1 px-3 py-2.5 text-[11px] whitespace-nowrap sm:flex-none sm:px-4 sm:text-xs"
                  />
                )}

                {!isPending && !user && (
                  <Link
                    href="/sign-in"
                    className="flex-1 rounded-lg bg-cyan-500 px-3 py-2.5 text-center text-[11px] font-semibold whitespace-nowrap text-white transition hover:bg-cyan-600 sm:flex-none sm:px-4 sm:text-xs"
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
      <div className="mt-8 flex justify-center sm:mt-12">
        <Link
          href="/jobs"
          className="inline-flex w-full max-w-xs items-center justify-center rounded-xl bg-white px-6 py-3 text-xs font-semibold text-black transition-all hover:bg-gray-200 sm:w-auto"
        >
          View all jobs
        </Link>
      </div>
    </section>
  )
}

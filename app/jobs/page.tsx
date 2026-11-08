"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  MapPin,
  Briefcase,
  Banknote,
  Loader2,
  ArrowUpRight,
} from "lucide-react"

interface Job {
  _id: string
  title: string
  company: string
  location: string
  salary: string
  category: string
  description?: string
  closed?: boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(`${API_URL}/api/jobs`, {
          cache: "no-store",
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load jobs")
        }

        setJobs(result.data)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load jobs")
      } finally {
        setLoading(false)
      }
    }

    if (API_URL) {
      fetchJobs()
    } else {
      setError("API URL is not configured")
      setLoading(false)
    }
  }, [])

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 text-white sm:px-6 lg:px-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-medium text-indigo-400">
          Explore Opportunities
        </p>

        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">All Jobs</h1>

        <p className="mt-3 text-sm leading-6 text-gray-400">
          Discover job opportunities posted by recruiters.
        </p>

        {!loading && !error && (
          <p className="mt-4 text-sm text-gray-400">
            Showing{" "}
            <span className="font-semibold text-white">{jobs.length}</span> jobs
          </p>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex min-h-[40vh] items-center justify-center gap-3 text-gray-400">
          <Loader2 className="size-6 animate-spin" />
          Loading jobs...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-12 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && jobs.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#1c1a1d] px-6 py-16 text-center">
          <Briefcase className="mx-auto mb-4 size-10 text-gray-500" />
          <h2 className="text-xl font-semibold">No jobs found</h2>
          <p className="mt-2 text-sm text-gray-400">
            There are no job opportunities available right now.
          </p>
        </div>
      )}

      {/* Job Cards */}
      {!loading && !error && jobs.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="flex flex-col rounded-2xl border border-white/10 bg-[#1c1a1d] p-5 transition duration-300 hover:-translate-y-1 hover:border-indigo-500/40 sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-indigo-400">
                    {job.company || "Company"}
                  </p>

                  <h2 className="mt-2 text-xl leading-snug font-bold text-white">
                    {job.title}
                  </h2>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                    job.closed
                      ? "bg-red-500/10 text-red-400"
                      : "bg-emerald-500/10 text-emerald-400"
                  }`}
                >
                  {job.closed ? "Closed" : "Open"}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 text-xs text-gray-300">
                <span className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2">
                  <MapPin className="size-3.5 text-indigo-400" />
                  {job.location}
                </span>

                <span className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2">
                  <Briefcase className="size-3.5 text-indigo-400" />
                  {job.category || "General"}
                </span>
              </div>

              <div className="mt-5 flex items-center gap-2 text-sm text-gray-300">
                <Banknote className="size-4 text-indigo-400" />
                {job.salary || "Negotiable"}
              </div>

              {job.description && (
                <p className="mt-5 line-clamp-3 text-sm leading-7 text-gray-400">
                  {job.description}
                </p>
              )}

              <div className="mt-auto pt-7">
                <Link
                  href={`/jobs/${job._id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  View Details
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

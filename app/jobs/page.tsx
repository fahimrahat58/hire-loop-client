"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  MapPin,
  Briefcase,
  Banknote,
  Loader2,
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"

interface Job {
  _id: string
  title: string
  company: string
  location: string
  salary: string
  category: string
  type?: string
  jobType?: string
  description?: string
  status?: string
  closed?: boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Normalize values before comparing
const normalize = (value?: string) => (value || "").trim().toLowerCase()

function JobsPageContent() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // --------------------------------
  // URL FILTER VALUES
  // --------------------------------

  const search = searchParams.get("search") || ""
  const category = searchParams.get("category") || ""
  const type = searchParams.get("type") || ""
  const location = searchParams.get("location") || ""
  const status = searchParams.get("status") || ""

  // --------------------------------
  // UPDATE URL PARAMS
  // --------------------------------

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value.trim()) {
      params.set(key, value.trim())
    } else {
      params.delete(key)
    }

    const queryString = params.toString()

    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    })
  }

  // --------------------------------
  // CLEAR ALL FILTERS
  // --------------------------------

  const clearFilters = () => {
    router.replace(pathname, { scroll: false })
  }

  const hasFilters = Boolean(search || category || type || location || status)

  // --------------------------------
  // FETCH JOBS
  // --------------------------------

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await fetch(`${API_URL}/api/jobs`, {
          cache: "no-store",
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load jobs")
        }

        setJobs(Array.isArray(result.data) ? result.data : [])
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

  // --------------------------------
  // FILTER JOBS
  // --------------------------------

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Normalize filter values
      const searchValue = normalize(search)
      const categoryValue = normalize(category)
      const typeValue = normalize(type)
      const locationValue = normalize(location)
      const statusValue = normalize(status)

      // Normalize job data
      const title = normalize(job.title)
      const company = normalize(job.company)
      const jobLocation = normalize(job.location)
      const jobCategory = normalize(job.category)
      const description = normalize(job.description)

      const jobStatus = normalize(job.status)

      // Support both type and jobType
      const jobType = normalize(job.type || job.jobType)

      // Determine job status
      const isClosed = job.closed === true || jobStatus === "closed"

      const isDraft = jobStatus === "draft"

      const isOpen = !isClosed && !isDraft

      // --------------------------------
      // SEARCH FILTER
      // --------------------------------

      const matchesSearch =
        !searchValue ||
        title.includes(searchValue) ||
        company.includes(searchValue) ||
        jobLocation.includes(searchValue) ||
        description.includes(searchValue)

      // --------------------------------
      // CATEGORY FILTER
      // --------------------------------

      const matchesCategory = !categoryValue || jobCategory === categoryValue

      // --------------------------------
      // JOB TYPE FILTER
      // --------------------------------

      // Old documents may not have type/jobType.
      // For those documents, check whether location contains Remote.
      const effectiveJobType =
        jobType || (jobLocation.includes("remote") ? "remote" : "")

      const matchesType = !typeValue || effectiveJobType === typeValue

      // --------------------------------
      // LOCATION FILTER
      // --------------------------------

      const matchesLocation =
        !locationValue || jobLocation.includes(locationValue)

      // --------------------------------
      // STATUS FILTER
      // --------------------------------

      const matchesStatus =
        !statusValue ||
        (statusValue === "open" && isOpen) ||
        (statusValue === "closed" && isClosed)

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesLocation &&
        matchesStatus
      )
    })
  }, [jobs, search, category, type, location, status])

  // --------------------------------
  // LOADING
  // --------------------------------

  if (loading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center gap-3 text-gray-400">
        <Loader2 className="size-6 animate-spin" />
        Loading jobs...
      </section>
    )
  }

  // --------------------------------
  // ERROR
  // --------------------------------

  if (error) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-red-400">{error}</p>
      </section>
    )
  }

  // --------------------------------
  // MAIN UI
  // --------------------------------

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 text-white sm:px-6 lg:px-8 lg:py-12">
      {/* HEADER */}

      <div className="mb-8">
        <p className="text-sm font-medium text-indigo-400">
          Explore Opportunities
        </p>

        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">All Jobs</h1>

        <p className="mt-3 text-sm leading-6 text-gray-400">
          Discover job opportunities posted by recruiters.
        </p>
      </div>

      {/* FILTER SECTION */}

      <div className="mb-8 rounded-2xl border border-white/10 bg-[#1c1a1d] p-4 sm:p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-indigo-400" />

            <h2 className="text-sm font-semibold">Filter Jobs</h2>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs font-medium text-red-400 transition hover:text-red-300"
            >
              <X className="size-3.5" />
              Clear filters
            </button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* SEARCH */}

          <div>
            <label
              htmlFor="job-search"
              className="mb-2 block text-xs font-medium text-gray-400"
            >
              Search jobs
            </label>

            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-500" />

              <input
                id="job-search"
                type="search"
                value={search}
                onChange={(e) => updateFilter("search", e.target.value)}
                placeholder="Job title or company..."
                className="w-full rounded-xl border border-white/10 bg-[#111014] py-3 pr-3 pl-10 text-sm text-white transition outline-none placeholder:text-gray-600 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* CATEGORY */}

          <div>
            <label
              htmlFor="job-category"
              className="mb-2 block text-xs font-medium text-gray-400"
            >
              Category
            </label>

            <select
              id="job-category"
              value={category}
              onChange={(e) => updateFilter("category", e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#111014] px-3 py-3 text-sm text-white outline-none focus:border-indigo-500"
            >
              <option value="">All Categories</option>
              <option value="Design">Design</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Operations">Operations</option>
            </select>
          </div>

          {/* JOB TYPE */}

          <div>
            <label
              htmlFor="job-type"
              className="mb-2 block text-xs font-medium text-gray-400"
            >
              Job Type
            </label>

            <select
              id="job-type"
              value={type}
              onChange={(e) => updateFilter("type", e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#111014] px-3 py-3 text-sm text-white outline-none focus:border-indigo-500"
            >
              <option value="">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Remote">Remote</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          {/* LOCATION */}

          <div>
            <label
              htmlFor="job-location"
              className="mb-2 block text-xs font-medium text-gray-400"
            >
              Location
            </label>

            <div className="relative">
              <MapPin className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-500" />

              <input
                id="job-location"
                type="text"
                value={location}
                onChange={(e) => updateFilter("location", e.target.value)}
                placeholder="Search location..."
                className="w-full rounded-xl border border-white/10 bg-[#111014] py-3 pr-3 pl-10 text-sm text-white transition outline-none placeholder:text-gray-600 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* STATUS */}

          <div>
            <label
              htmlFor="job-status"
              className="mb-2 block text-xs font-medium text-gray-400"
            >
              Job Status
            </label>

            <select
              id="job-status"
              value={status}
              onChange={(e) => updateFilter("status", e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#111014] px-3 py-3 text-sm text-white outline-none focus:border-indigo-500"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* RESULTS HEADER */}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-400">
          Showing{" "}
          <span className="font-semibold text-white">
            {filteredJobs.length}
          </span>{" "}
          of <span className="font-semibold text-white">{jobs.length}</span>{" "}
          jobs
        </p>

        {hasFilters && (
          <span className="rounded-full bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-400">
            Filters applied
          </span>
        )}
      </div>

      {/* EMPTY STATE */}

      {filteredJobs.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#1c1a1d] px-6 py-16 text-center">
          <Briefcase className="mx-auto mb-4 size-10 text-gray-500" />

          <h2 className="text-xl font-semibold">
            {hasFilters ? "No matching jobs found" : "No jobs found"}
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            {hasFilters
              ? "Try changing your search or filter criteria."
              : "There are no job opportunities available right now."}
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-indigo-500"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* JOB CARDS */}

      {filteredJobs.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredJobs.map((job) => {
            const isClosed =
              job.closed === true || normalize(job.status) === "closed"

            return (
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
                      isClosed
                        ? "bg-red-500/10 text-red-400"
                        : "bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {isClosed ? "Closed" : "Open"}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-2 text-xs text-gray-300">
                  <span className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2">
                    <MapPin className="size-3.5 text-indigo-400" />
                    {job.location || "Location not specified"}
                  </span>

                  <span className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2">
                    <Briefcase className="size-3.5 text-indigo-400" />
                    {job.category || "General"}
                  </span>

                  {(job.type || job.jobType) && (
                    <span className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2">
                      <Briefcase className="size-3.5 text-indigo-400" />
                      {job.type || job.jobType}
                    </span>
                  )}
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
            )
          })}
        </div>
      )}
    </section>
  )
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center gap-3 text-gray-400">
          <Loader2 className="size-6 animate-spin" />
          Loading jobs...
        </div>
      }
    >
      <JobsPageContent />
    </Suspense>
  )
}

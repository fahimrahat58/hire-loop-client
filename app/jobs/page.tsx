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

const normalize = (value?: string) => (value || "").trim().toLowerCase()

function JobsPageContent() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const search = searchParams.get("search") || ""
  const category = searchParams.get("category") || ""
  const type = searchParams.get("type") || ""
  const location = searchParams.get("location") || ""
  const status = searchParams.get("status") || ""

  // UPDATE URL FILTERS
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

  // CLEAR FILTERS
  const clearFilters = () => {
    router.replace(pathname, { scroll: false })
  }

  const hasFilters = Boolean(search || category || type || location || status)

  // FETCH JOBS
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

  // FILTER JOBS
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const searchValue = normalize(search)
      const categoryValue = normalize(category)
      const typeValue = normalize(type)
      const locationValue = normalize(location)
      const statusValue = normalize(status)

      const title = normalize(job.title)
      const company = normalize(job.company)
      const jobLocation = normalize(job.location)
      const jobCategory = normalize(job.category)
      const description = normalize(job.description)
      const jobStatus = normalize(job.status)

      const jobType = normalize(job.type || job.jobType)

      const isClosed = job.closed === true || jobStatus === "closed"
      const isDraft = jobStatus === "draft"
      const isOpen = !isClosed && !isDraft

      const matchesSearch =
        !searchValue ||
        title.includes(searchValue) ||
        company.includes(searchValue) ||
        jobLocation.includes(searchValue) ||
        description.includes(searchValue)

      const matchesCategory = !categoryValue || jobCategory === categoryValue

      const effectiveJobType =
        jobType || (jobLocation.includes("remote") ? "remote" : "")

      const matchesType = !typeValue || effectiveJobType === typeValue

      const matchesLocation =
        !locationValue || jobLocation.includes(locationValue)

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

  // LOADING
  if (loading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center gap-3 px-4 text-gray-400">
        <Loader2 className="size-6 animate-spin" />
        <span className="text-sm sm:text-base">Loading jobs...</span>
      </section>
    )
  }

  // ERROR
  if (error) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-sm break-words text-red-400 sm:text-base">{error}</p>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-7xl overflow-hidden px-3 py-6 text-white sm:px-6 sm:py-8 lg:px-8 lg:py-12">
      {/* HEADER */}
      <div className="mb-6 sm:mb-8">
        <p className="text-xs font-medium text-indigo-400 sm:text-sm">
          Explore Opportunities
        </p>

        <h1 className="mt-2 text-2xl font-bold sm:text-3xl lg:text-4xl">
          All Jobs
        </h1>

        <p className="mt-2 text-xs leading-6 text-gray-400 sm:mt-3 sm:text-sm">
          Discover job opportunities posted by recruiters.
        </p>
      </div>

      {/* FILTER SECTION */}
      <div className="mb-6 rounded-xl border border-white/10 bg-[#1c1a1d] p-3 sm:mb-8 sm:rounded-2xl sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 sm:mb-5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-indigo-400" />
            <h2 className="text-sm font-semibold sm:text-base">Filter Jobs</h2>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300 sm:text-sm"
            >
              <X className="size-3.5" />
              Clear filters
            </button>
          )}
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {/* SEARCH */}
          <div className="min-w-0">
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
                className="w-full min-w-0 rounded-xl border border-white/10 bg-[#111014] py-3 pr-3 pl-10 text-sm text-white transition outline-none placeholder:text-gray-600 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* CATEGORY */}
          <div className="min-w-0">
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
              className="w-full min-w-0 rounded-xl border border-white/10 bg-[#111014] px-3 py-3 text-sm text-white outline-none focus:border-indigo-500"
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
          <div className="min-w-0">
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
              className="w-full min-w-0 rounded-xl border border-white/10 bg-[#111014] px-3 py-3 text-sm text-white outline-none focus:border-indigo-500"
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
          <div className="min-w-0">
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
                className="w-full min-w-0 rounded-xl border border-white/10 bg-[#111014] py-3 pr-3 pl-10 text-sm text-white transition outline-none placeholder:text-gray-600 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* STATUS */}
          <div className="min-w-0">
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
              className="w-full min-w-0 rounded-xl border border-white/10 bg-[#111014] px-3 py-3 text-sm text-white outline-none focus:border-indigo-500"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* RESULTS HEADER */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 sm:mb-6">
        <p className="text-xs text-gray-400 sm:text-sm">
          Showing{" "}
          <span className="font-semibold text-white">
            {filteredJobs.length}
          </span>{" "}
          of <span className="font-semibold text-white">{jobs.length}</span>{" "}
          jobs
        </p>

        {hasFilters && (
          <span className="rounded-full bg-indigo-500/10 px-3 py-1.5 text-[10px] font-medium text-indigo-400 sm:text-xs">
            Filters applied
          </span>
        )}
      </div>

      {/* EMPTY STATE */}
      {filteredJobs.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-[#1c1a1d] px-4 py-12 text-center sm:rounded-2xl sm:px-6 sm:py-16">
          <Briefcase className="mx-auto mb-4 size-10 text-gray-500" />

          <h2 className="text-lg font-semibold sm:text-xl">
            {hasFilters ? "No matching jobs found" : "No jobs found"}
          </h2>

          <p className="mt-2 text-xs leading-6 text-gray-400 sm:text-sm">
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
          {filteredJobs.map((job) => {
            const isClosed =
              job.closed === true || normalize(job.status) === "closed"

            return (
              <div
                key={job._id}
                className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#1c1a1d] p-4 transition duration-300 hover:border-indigo-500/40 sm:rounded-2xl sm:p-6 sm:hover:-translate-y-1"
              >
                {/* CARD HEADER */}
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium break-words text-indigo-400 sm:text-sm">
                      {job.company || "Company"}
                    </p>

                    <h2 className="mt-2 text-lg leading-snug font-bold break-words text-white sm:text-xl">
                      {job.title}
                    </h2>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium sm:px-3 sm:text-xs ${
                      isClosed
                        ? "bg-red-500/10 text-red-400"
                        : "bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {isClosed ? "Closed" : "Open"}
                  </span>
                </div>

                {/* JOB DETAILS */}
                <div className="mt-5 flex flex-wrap gap-2 text-xs text-gray-300 sm:mt-6">
                  <span className="flex max-w-full min-w-0 items-center gap-2 rounded-full bg-white/5 px-3 py-2 break-words">
                    <MapPin className="size-3.5 shrink-0 text-indigo-400" />
                    <span className="break-words">
                      {job.location || "Location not specified"}
                    </span>
                  </span>

                  <span className="flex max-w-full min-w-0 items-center gap-2 rounded-full bg-white/5 px-3 py-2 break-words">
                    <Briefcase className="size-3.5 shrink-0 text-indigo-400" />
                    <span className="break-words">
                      {job.category || "General"}
                    </span>
                  </span>

                  {(job.type || job.jobType) && (
                    <span className="flex max-w-full min-w-0 items-center gap-2 rounded-full bg-white/5 px-3 py-2 break-words">
                      <Briefcase className="size-3.5 shrink-0 text-indigo-400" />
                      <span className="break-words">
                        {job.type || job.jobType}
                      </span>
                    </span>
                  )}
                </div>

                {/* SALARY */}
                <div className="mt-4 flex min-w-0 items-center gap-2 text-sm break-words text-gray-300 sm:mt-5">
                  <Banknote className="size-4 shrink-0 text-indigo-400" />
                  <span>{job.salary || "Negotiable"}</span>
                </div>

                {/* DESCRIPTION */}
                {job.description && (
                  <p className="mt-4 line-clamp-3 text-sm leading-6 break-words text-gray-400 sm:mt-5 sm:leading-7">
                    {job.description}
                  </p>
                )}

                {/* VIEW DETAILS */}
                <div className="mt-auto pt-5 sm:pt-7">
                  <Link
                    href={`/jobs/${job._id}`}
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-indigo-500 hover:bg-indigo-500"
                  >
                    View Details
                    <ArrowUpRight className="size-4 shrink-0" />
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
        <div className="flex min-h-[60vh] items-center justify-center gap-3 px-4 text-gray-400">
          <Loader2 className="size-6 animate-spin" />
          <span className="text-sm sm:text-base">Loading jobs...</span>
        </div>
      }
    >
      <JobsPageContent />
    </Suspense>
  )
}

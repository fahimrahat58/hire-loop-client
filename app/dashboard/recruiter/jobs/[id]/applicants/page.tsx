"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Search,
  Users,
  Mail,
  ExternalLink,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileText,
} from "lucide-react"

import { authClient } from "@/app/lib/auth-client"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

const STATUS_OPTIONS = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Offered",
  "Rejected",
]

type Application = {
  id: string
  jobId: string
  name: string
  email: string
  role: string
  company?: string
  applied: string
  experience: string
  resumeUrl: string
  coverLetter: string
  status: string
}

type JobInfo = {
  id: string
  title: string
  company: string
}

type ApiResponse = {
  success: boolean
  message?: string
  data: Application[]
  total: number
  job?: JobInfo
}

const statusStyles: Record<string, string> = {
  Applied: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  "Under Review": "border-amber-500/20 bg-amber-500/10 text-amber-400",
  Shortlisted: "border-violet-500/20 bg-violet-500/10 text-violet-400",
  Offered: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  Rejected: "border-red-500/20 bg-red-500/10 text-red-400",
}

function formatDate(value?: string) {
  if (!value) return "N/A"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "N/A"

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function JobApplicantsPage() {
  const params = useParams<{ id: string }>()
  const jobId = params.id

  const { data: session, isPending: sessionPending } = authClient.useSession()

  const user = session?.user

  const [applications, setApplications] = useState<Application[]>([])
  const [job, setJob] = useState<JobInfo | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [processingId, setProcessingId] = useState<string | null>(null)

  // --------------------------------
  // FETCH APPLICANTS FOR THIS JOB
  // --------------------------------

  const loadApplicants = useCallback(async () => {
    if (!user?.email || !jobId) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch(
        `${API_URL}/api/applications/recruiter/${jobId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": user.email,
          },
          cache: "no-store",
        }
      )

      const result: ApiResponse = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load applicants.")
      }

      setApplications(result.data || [])
      setJob(result.job || null)
    } catch (err) {
      console.error("JOB APPLICANTS ERROR:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading applicants."
      )
    } finally {
      setLoading(false)
    }
  }, [user?.email, jobId])

  useEffect(() => {
    if (sessionPending) return

    if (!user?.email) {
      setLoading(false)
      return
    }

    void loadApplicants()
  }, [sessionPending, user?.email, loadApplicants])

  // --------------------------------
  // UPDATE APPLICATION STATUS
  // --------------------------------

  const updateStatus = async (applicationId: string, newStatus: string) => {
    if (!user?.email || processingId) return

    setProcessingId(applicationId)

    try {
      const response = await fetch(
        `${API_URL}/api/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": user.email,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to update application status."
        )
      }

      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId
            ? { ...application, status: newStatus }
            : application
        )
      )

      toast.add({
        title: "Status updated",
        description: `Application status changed to ${newStatus}.`,
        type: "success",
      })
    } catch (err) {
      console.error("UPDATE STATUS ERROR:", err)

      toast.add({
        title: "Update failed",
        description:
          err instanceof Error ? err.message : "Something went wrong.",
        type: "error",
      })
    } finally {
      setProcessingId(null)
    }
  }

  // --------------------------------
  // SEARCH AND FILTER
  // --------------------------------

  const filteredApplications = useMemo(() => {
    const term = search.trim().toLowerCase()

    return applications.filter((application) => {
      const matchesSearch =
        !term ||
        application.name?.toLowerCase().includes(term) ||
        application.email?.toLowerCase().includes(term)

      const matchesStatus =
        statusFilter === "All" || application.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [applications, search, statusFilter])

  // --------------------------------
  // STATISTICS
  // --------------------------------

  const counts = useMemo(
    () => ({
      total: applications.length,
      shortlisted: applications.filter(
        (application) => application.status === "Shortlisted"
      ).length,
      pending: applications.filter(
        (application) =>
          application.status === "Applied" ||
          application.status === "Under Review"
      ).length,
    }),
    [applications]
  )

  // --------------------------------
  // LOADING
  // --------------------------------

  if (sessionPending || loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-7 w-44 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-64 animate-pulse rounded bg-white/[0.06]" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-xl border border-white/10 bg-white/[0.03]"
            />
          ))}
        </div>

        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-xl border border-white/10 bg-white/[0.03]"
            />
          ))}
        </div>
      </div>
    )
  }

  // --------------------------------
  // AUTH CHECK
  // --------------------------------

  if (!user?.email) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <AlertCircle className="mx-auto size-8 text-amber-400" />

        <h2 className="mt-3 font-semibold text-white">Please log in</h2>

        <p className="mt-2 text-sm text-[#a0a0ab]">
          You need to log in to view job applicants.
        </p>
      </div>
    )
  }

  // --------------------------------
  // ERROR
  // --------------------------------

  if (error) {
    return (
      <div className="space-y-5">
        <Link
          href="/dashboard/recruiter/jobs"
          className="inline-flex items-center gap-2 text-sm text-[#a0a0ab] hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to Manage Jobs
        </Link>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <AlertCircle className="mx-auto size-8 text-red-400" />

          <h2 className="mt-3 font-semibold text-white">
            Failed to load applicants
          </h2>

          <p className="mt-2 text-sm text-[#a0a0ab]">{error}</p>

          <button
            type="button"
            onClick={() => void loadApplicants()}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#5c53fe] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#4b43e8]"
          >
            <RefreshCw className="size-4" />
            Try again
          </button>
        </div>
      </div>
    )
  }

  // --------------------------------
  // MAIN UI
  // --------------------------------

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div>
        <Link
          href="/dashboard/recruiter/jobs"
          className="mb-4 inline-flex items-center gap-2 text-sm text-[#a0a0ab] transition hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to Manage Jobs
        </Link>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-[#ededef]">
              Job Applicants
            </h1>

            <p className="mt-1 text-sm text-[#a0a0ab]">
              Applicants for{" "}
              <span className="font-medium text-[#b8b2ff]">
                {job?.title || "this job"}
              </span>
            </p>

            {job?.company && (
              <p className="mt-1 text-xs text-[#6e6e78]">{job.company}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => void loadApplicants()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm text-[#d4d4d8] transition hover:bg-white/5"
          >
            <RefreshCw className="size-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#a0a0ab]">Total Applicants</p>
            <Users className="size-5 text-[#a99fff]" />
          </div>

          <p className="mt-3 text-3xl font-semibold text-white">
            {counts.total}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#a0a0ab]">Shortlisted</p>
            <Users className="size-5 text-violet-400" />
          </div>

          <p className="mt-3 text-3xl font-semibold text-white">
            {counts.shortlisted}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#a0a0ab]">Pending Review</p>
            <FileText className="size-5 text-amber-400" />
          </div>

          <p className="mt-3 text-3xl font-semibold text-white">
            {counts.pending}
          </p>
        </div>
      </div>

      {/* SEARCH AND FILTER */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#6e6e78]" />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search applicants..."
            className="w-full rounded-lg border border-white/10 bg-[#111116] py-2.5 pr-3 pl-9 text-sm text-white outline-none placeholder:text-[#6e6e78] focus:border-[#5c53fe]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-white/10 bg-[#111116] px-3 py-2.5 text-sm text-[#d4d4d8] outline-none focus:border-[#5c53fe]"
        >
          <option value="All">All statuses</option>

          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* APPLICANTS */}

      <div className="space-y-4">
        {filteredApplications.length > 0 ? (
          filteredApplications.map((application) => {
            const isProcessing = processingId === application.id

            return (
              <div
                key={application.id}
                className="rounded-xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-white/20 sm:p-6"
              >
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                  {/* APPLICANT INFORMATION */}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#5c53fe]/15 text-base font-semibold text-[#b8b2ff]">
                        {application.name?.charAt(0)?.toUpperCase() || "A"}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-[#ededef]">
                          {application.name || "Unknown Applicant"}
                        </h3>

                        <a
                          href={`mailto:${application.email}`}
                          className="mt-1 flex items-center gap-1.5 text-xs break-all text-[#a0a0ab] transition hover:text-[#b8b2ff]"
                        >
                          <Mail className="size-3.5 shrink-0" />
                          {application.email}
                        </a>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-[11px] text-[#6e6e78]">Experience</p>

                        <p className="mt-1 text-sm text-[#d4d4d8]">
                          {application.experience || "Not provided"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] text-[#6e6e78]">
                          Applied date
                        </p>

                        <p className="mt-1 text-sm text-[#d4d4d8]">
                          {formatDate(application.applied)}
                        </p>
                      </div>
                    </div>

                    {application.coverLetter && (
                      <details className="mt-4">
                        <summary className="cursor-pointer text-xs font-medium text-[#b8b2ff] hover:text-white">
                          View cover letter
                        </summary>

                        <p className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3 text-sm leading-6 whitespace-pre-wrap text-[#a0a0ab]">
                          {application.coverLetter}
                        </p>
                      </details>
                    )}
                  </div>

                  {/* STATUS AND RESUME */}

                  <div className="flex w-full flex-col gap-3 lg:w-48">
                    <div>
                      <p className="mb-2 text-[11px] text-[#6e6e78]">
                        Application status
                      </p>

                      <span
                        className={cn(
                          "inline-flex rounded-full border px-3 py-1 text-xs font-medium",
                          statusStyles[application.status] ||
                            "border-white/10 bg-white/5 text-[#d4d4d8]"
                        )}
                      >
                        {application.status || "Applied"}
                      </span>
                    </div>

                    <select
                      value={application.status || "Applied"}
                      disabled={isProcessing}
                      onChange={(event) =>
                        void updateStatus(application.id, event.target.value)
                      }
                      className="w-full rounded-lg border border-white/10 bg-[#111116] px-3 py-2.5 text-xs text-[#d4d4d8] outline-none focus:border-[#5c53fe] disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    {isProcessing && (
                      <p className="flex items-center gap-2 text-xs text-[#a0a0ab]">
                        <Loader2 className="size-3.5 animate-spin" />
                        Updating...
                      </p>
                    )}

                    {application.resumeUrl && (
                      <a
                        href={application.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-xs font-medium text-[#d4d4d8] transition hover:border-[#5c53fe]/50 hover:bg-[#5c53fe]/10 hover:text-white"
                      >
                        <ExternalLink className="size-3.5" />
                        View Resume
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/[0.025] px-5 py-14 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-white/5">
              <Users className="size-6 text-[#6e6e78]" />
            </div>

            <h3 className="mt-4 font-semibold text-[#ededef]">
              {applications.length === 0
                ? "No applicants yet"
                : "No matching applicants"}
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm text-[#a0a0ab]">
              {applications.length === 0
                ? "Applicants will appear here when someone applies for this job."
                : "Try changing your search or status filter."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

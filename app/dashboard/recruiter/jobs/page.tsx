"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  BriefcaseBusiness,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react"

import { authClient } from "@/app/lib/auth-client"

import {
  getJobs,
  deleteJob,
  getJobStatus,
  getJobDate,
  getJobCategory,
  getJobsErrorMessage,
  type ApiJob,
  type JobUser,
} from "@/app/lib/jobs-api"

import { filterManageableJobs } from "@/app/lib/job-ownership"

import {
  DashboardCard,
  EmptyState,
  PageHeader,
  ProgressBar,
  StatusBadge,
  TableShell,
  Td,
  Th,
  ghostButton,
  inputClass,
  primaryButton,
  secondaryButton,
} from "@/components/dashboard/ui"

import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

const PLAN_LIMIT = 10

type DashboardJob = ApiJob & {
  status?: string
  applicants?: number
}

export default function RecruiterJobsPage() {
  const { data: session, isPending: sessionPending } = authClient.useSession()

  const user = session?.user

  const currentUser: JobUser | null = user
    ? {
        id: user.id,
        email: user.email,
        role: user.role,
      }
    : null

  const [jobs, setJobs] = useState<DashboardJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("All")

  const [processingId, setProcessingId] = useState<string | null>(null)
  const [deleteJobTarget, setDeleteJobTarget] = useState<DashboardJob | null>(
    null
  )

  // --------------------------------
  // FETCH JOBS
  // --------------------------------

  const loadJobs = useCallback(
    async (showLoader = true) => {
      if (!currentUser) {
        setJobs([])
        setLoading(false)
        return
      }

      if (showLoader) {
        setLoading(true)
      }

      setError(null)

      try {
        console.log(
          "API URL:",
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        )

        console.log("CURRENT USER:", currentUser)

        // AbortController / signal ব্যবহার করা হচ্ছে না।
        // তাই page change হলে AbortError হবে না।
        const response = await getJobs({
          user: currentUser,
        })

        console.log("API RESPONSE:", response)

        const manageableJobs = filterManageableJobs(
          response,
          currentUser
        ) as DashboardJob[]

        console.log("MANAGEABLE JOBS:", manageableJobs)

        setJobs(manageableJobs)
      } catch (err) {
        console.error("JOBS API ERROR:", err)

        setError(getJobsErrorMessage(err, "Unable to load your job posts."))
      } finally {
        if (showLoader) {
          setLoading(false)
        }
      }
    },
    [currentUser?.id, currentUser?.email, currentUser?.role]
  )

  // --------------------------------
  // INITIAL FETCH
  // --------------------------------

  useEffect(() => {
    if (sessionPending) return

    void loadJobs(true)
  }, [sessionPending, loadJobs])

  // --------------------------------
  // JOB STATUS
  // --------------------------------

  const getStatus = (job: DashboardJob) => {
    if (job.status?.toLowerCase() === "draft") {
      return "Draft"
    }

    return getJobStatus(job)
  }

  const activeCount = jobs.filter((job) => getStatus(job) === "Active").length

  // --------------------------------
  // SEARCH AND FILTER
  // --------------------------------

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase()

    return jobs.filter((job) => {
      const jobStatus = getStatus(job)

      const matchesStatus = status === "All" || jobStatus === status

      const matchesQuery =
        !term ||
        job.title.toLowerCase().includes(term) ||
        job.company.toLowerCase().includes(term) ||
        job.location.toLowerCase().includes(term)

      return matchesStatus && matchesQuery
    })
  }, [jobs, query, status])

  // --------------------------------
  // DELETE DIALOG
  // --------------------------------

  const openDeleteDialog = (job: DashboardJob) => {
    setDeleteJobTarget(job)
  }

  const closeDeleteDialog = () => {
    if (processingId) return

    setDeleteJobTarget(null)
  }

  // --------------------------------
  // DELETE JOB
  // --------------------------------

  const remove = async () => {
    if (!currentUser || !deleteJobTarget || processingId) return

    const id = deleteJobTarget._id

    setProcessingId(id)

    try {
      await deleteJob(id, {
        user: currentUser,
      })

      setJobs((current) => current.filter((job) => job._id !== id))

      setDeleteJobTarget(null)

      toast.add({
        title: "Job deleted successfully",
        description: "The job post has been removed.",
        type: "success",
      })
    } catch (err) {
      console.error("DELETE JOB ERROR:", err)

      toast.add({
        title: "Unable to delete job",
        description: getJobsErrorMessage(err),
        type: "error",
      })
    } finally {
      setProcessingId(null)
    }
  }

  // --------------------------------
  // LOADING
  // --------------------------------

  if (sessionPending || loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-7 w-40 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-72 max-w-full animate-pulse rounded bg-white/[0.06]" />
        </div>

        <DashboardCard className="p-5">
          <div className="h-10 animate-pulse rounded bg-white/[0.06]" />
          <div className="mt-5 h-2 animate-pulse rounded bg-white/[0.06]" />
        </DashboardCard>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="h-10 w-full animate-pulse rounded-lg bg-white/[0.06] sm:max-w-xs" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-white/[0.06] sm:w-32" />
        </div>

        <DashboardCard className="space-y-5 p-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-12 animate-pulse rounded bg-white/[0.06]"
            />
          ))}
        </DashboardCard>
      </div>
    )
  }

  // --------------------------------
  // ROLE CHECK
  // --------------------------------

  if (
    !currentUser ||
    !["admin", "recruiter"].includes(currentUser.role?.toLowerCase() || "")
  ) {
    return (
      <DashboardCard className="p-8 text-center">
        <AlertCircle className="mx-auto size-8 text-amber-400" />

        <h2 className="mt-3 text-lg font-semibold text-[#ededef]">
          Access restricted
        </h2>

        <p className="mt-2 text-sm text-[#a0a0ab]">
          You do not have permission to manage job posts.
        </p>
      </DashboardCard>
    )
  }

  // --------------------------------
  // ERROR
  // --------------------------------

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Manage Jobs"
          description="Create, edit and track every job post linked to your company."
        />

        <DashboardCard className="flex flex-col items-center gap-3 p-8 text-center">
          <AlertCircle className="size-9 text-red-400" />

          <h2 className="text-base font-semibold text-[#ededef]">
            Failed to load jobs
          </h2>

          <p className="max-w-md text-sm text-[#a0a0ab]">{error}</p>

          <button
            type="button"
            onClick={() => void loadJobs(true)}
            className={primaryButton}
          >
            <RefreshCw className="size-4" />
            Try again
          </button>
        </DashboardCard>
      </div>
    )
  }

  // --------------------------------
  // MAIN UI
  // --------------------------------

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Jobs"
        description="Create, edit and track every job post linked to your company."
        actions={
          activeCount >= PLAN_LIMIT ? (
            <span
              className={cn(primaryButton, "pointer-events-none opacity-50")}
            >
              <Plus className="size-4" />
              Active job limit reached
            </span>
          ) : (
            <Link
              href="/dashboard/recruiter/jobs/new"
              className={primaryButton}
            >
              <Plus className="size-4" />
              Post new job
            </Link>
          )
        }
      />

      {/* PLAN USAGE */}

      <DashboardCard className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-[#5c53fe]/15 text-[#b8b2ff]">
              <BriefcaseBusiness className="size-4" />
            </span>

            <div>
              <p className="text-[13px] font-medium text-[#ededef]">
                Growth plan usage
              </p>

              <p className="text-[11px] text-[#6e6e78]">
                {activeCount} of {PLAN_LIMIT} active job posts used
              </p>
            </div>
          </div>

          <Link href="/dashboard/recruiter/billing" className={secondaryButton}>
            Manage plan
          </Link>
        </div>

        <ProgressBar value={activeCount} max={PLAN_LIMIT} className="mt-4" />

        <p className="mt-2 text-[11px] text-[#6e6e78]">
          {Math.max(0, PLAN_LIMIT - activeCount)} slots remaining. Upgrade to
          Enterprise for up to 50 active job posts.
        </p>
      </DashboardCard>

      {/* SEARCH AND FILTER */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#6e6e78]" />

          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search job posts..."
            className={cn(inputClass, "pl-9")}
          />
        </div>

        <div className="flex gap-2">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-[#0f0f13] px-3 py-2.5 text-xs text-[#d4d4d8] outline-none focus:border-[#5c53fe] sm:w-auto"
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
            <option value="Draft">Draft</option>
          </select>

          <button
            type="button"
            onClick={() => void loadJobs(false)}
            disabled={loading}
            aria-label="Refresh jobs"
            className={secondaryButton}
          >
            <RefreshCw className="size-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* JOB TABLE */}

      <DashboardCard className="overflow-hidden">
        {rows.length > 0 ? (
          <TableShell>
            <thead>
              <tr>
                <Th>Job title</Th>
                <Th>Status</Th>
                <Th>Applicants</Th>
                <Th>Date posted</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>

            <tbody>
              {rows.map((job) => {
                const isProcessing = processingId === job._id
                const jobStatus = getStatus(job)

                return (
                  <tr key={job._id} className="hover:bg-white/[0.02]">
                    <Td>
                      <p className="font-medium text-[#ededef]">{job.title}</p>

                      <p className="text-[11px] text-[#6e6e78]">
                        {getJobCategory(job)}
                      </p>

                      <p className="mt-0.5 text-[11px] text-[#6e6e78]">
                        {job.company}
                      </p>
                    </Td>

                    <Td>
                      <StatusBadge status={jobStatus} />
                    </Td>

                    <Td className="font-medium text-[#ededef]">
                      {job.applicants ?? 0}
                    </Td>

                    <Td>{getJobDate(job)}</Td>

                    <Td>
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        {/* EDIT - DIRECT FORM OPEN */}

                        <Link
                          href={`/dashboard/recruiter/jobs/new?edit=${job._id}`}
                          className={ghostButton}
                        >
                          <Pencil className="size-3.5" />
                          Edit
                        </Link>

                        {/* APPLICANTS */}

                        <Link
                          href={`/dashboard/recruiter/jobs/${job._id}/applicants`}
                          className={ghostButton}
                        >
                          <Eye className="size-3.5" />
                          Applicants
                        </Link>

                        {/* DELETE */}

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => openDeleteDialog(job)}
                          aria-label={`Delete ${job.title}`}
                          className={cn(ghostButton, "hover:text-red-400")}
                        >
                          {isProcessing ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                        </button>
                      </div>
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </TableShell>
        ) : (
          <EmptyState
            title={
              query || status !== "All"
                ? "No matching jobs found"
                : "No job posts found"
            }
            description={
              query || status !== "All"
                ? "Try a different search or status filter."
                : "Create your first job post to start collecting applicants."
            }
            action={
              <Link
                href="/dashboard/recruiter/jobs/new"
                className={primaryButton}
              >
                <Plus className="size-4" />
                Post a new job
              </Link>
            }
          />
        )}
      </DashboardCard>

      {/* DELETE CONFIRMATION DIALOG */}

      {deleteJobTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeDeleteDialog()
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#15151b] p-6 shadow-2xl"
          >
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
              <Trash2 className="size-6" />
            </div>

            <h2
              id="delete-dialog-title"
              className="text-lg font-semibold text-[#ededef]"
            >
              Delete Job Post?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#a0a0ab]">
              Are you sure you want to delete "{deleteJobTarget.title}"? This
              action cannot be undone.
            </p>

            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/[0.06] p-3">
              <p className="text-xs leading-5 text-red-300">
                Warning: This job post will be permanently removed. Make sure
                you want to continue.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={!!processingId}
                onClick={closeDeleteDialog}
                className={secondaryButton}
              >
                <X className="size-3.5" />
                Cancel
              </button>

              <button
                type="button"
                disabled={!!processingId}
                onClick={() => void remove()}
                className={cn(primaryButton, "bg-red-600 hover:bg-red-700")}
              >
                {processingId ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-3.5" />
                )}
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

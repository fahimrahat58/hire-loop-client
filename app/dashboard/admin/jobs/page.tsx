"use client"

import { useMemo, useState } from "react"
import {
  BriefcaseBusiness,
  Eye,
  FileDown,
  Search,
  TrendingUp,
  Users,
  X,
  Loader2,
} from "lucide-react"
import { useJobs } from "@/hooks/use-jobs"
import { useJobFeedback } from "@/hooks/use-job-feedback"
import {
  deleteJob,
  getJobCategory,
  getJobDate,
  getJobStatus,
  getJobType,
  getJobsErrorMessage,
  type ApiJob,
} from "@/app/lib/jobs-api"
import { forgetJobOwner } from "@/app/lib/job-ownership"
import {
  Avatar,
  DashboardCard,
  EmptyState,
  PageHeader,
  StatCard,
  StatusBadge,
  TableShell,
  Td,
  Th,
  ghostButton,
  inputClass,
  primaryButton,
  secondaryButton,
} from "@/components/dashboard/ui"
import { cn } from "@/lib/utils"

export default function AdminJobsPage() {
  const { jobs: rows, loading, error, reload, user } = useJobs()
  const { notify, Toast } = useJobFeedback()

  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("All Statuses")
  const [category, setCategory] = useState("All Categories")
  const [viewJob, setViewJob] = useState<ApiJob | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const canManageAllJobs = user.role === "admin"

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()

    return rows.filter(
      (job) =>
        (status === "All Statuses" || getJobStatus(job) === status) &&
        (category === "All Categories" || getJobCategory(job) === category) &&
        (!term ||
          job.title.toLowerCase().includes(term) ||
          job.company.toLowerCase().includes(term))
    )
  }, [rows, query, status, category])

  const remove = async (job: ApiJob) => {
    if (user.role !== "admin") {
      notify("error", "Only admins can remove any job listing.")
      return
    }

    setBusyId(job._id)

    try {
      await deleteJob(job._id, { user })
      forgetJobOwner(job._id)
      setViewJob(null)
      await reload({ silent: true })
      notify("success", "Job listing removed successfully.")
    } catch (err) {
      notify("error", getJobsErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  if (!loading && !canManageAllJobs) {
    return (
      <DashboardCard>
        <EmptyState
          title="Admin access required"
          description="Only administrators can manage all job listings."
        />
      </DashboardCard>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Jobs"
        description="Oversee all active listings and historical job posts across the platform."
        actions={
          <button
            type="button"
            onClick={() => window.print()}
            className={secondaryButton}
          >
            <FileDown className="size-3.5" />
            Export list
          </button>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#6e6e78]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by job title or company..."
            className={cn(inputClass, "pl-9")}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#0f0f13] px-3 py-2.5 text-xs text-[#d4d4d8] outline-none focus:border-[#5c53fe]"
          >
            <option>All Statuses</option>
            <option>Active</option>
            <option>Closed</option>
            <option>Draft</option>
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#0f0f13] px-3 py-2.5 text-xs text-[#d4d4d8] outline-none focus:border-[#5c53fe]"
          >
            <option>All Categories</option>
            {Array.from(new Set(rows.map(getJobCategory))).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-white/[0.07] bg-[#141418] p-1 lg:ml-auto">
          <span className="rounded-md bg-[#232327] px-3 py-1.5 text-[11px] font-medium text-[#f4f4f5]">
            Active ({rows.filter((j) => getJobStatus(j) === "Active").length})
          </span>
          <span className="px-3 py-1.5 text-[11px] text-[#a0a0ab]">
            Closed ({rows.filter((j) => getJobStatus(j) === "Closed").length})
          </span>
        </div>
      </div>

      <DashboardCard className="overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-12 animate-pulse rounded-lg bg-white/[0.06]"
              />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            title="Unable to load jobs"
            description={error}
            action={
              <button onClick={() => void reload()} className={primaryButton}>
                Try again
              </button>
            }
          />
        ) : visible.length ? (
          <TableShell>
            <thead>
              <tr>
                <Th>Title</Th>
                <Th>Company</Th>
                <Th>Category</Th>
                <Th>Type</Th>
                <Th>Date posted</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>

            <tbody>
              {visible.map((job) => (
                <tr key={job._id} className="hover:bg-white/[0.02]">
                  <Td>
                    <p className="font-medium text-[#ededef]">{job.title}</p>
                    <p className="text-[11px] text-[#6e6e78]">
                      Ref: {job._id.slice(-6).toUpperCase()}
                    </p>
                  </Td>

                  <Td>
                    <div className="flex items-center gap-2">
                      <Avatar name={job.company} size="sm" />
                      <span className="text-[#d4d4d8]">{job.company}</span>
                    </div>
                  </Td>

                  <Td>{getJobCategory(job)}</Td>
                  <Td>{getJobType(job)}</Td>
                  <Td>{getJobDate(job)}</Td>
                  <Td>
                    <StatusBadge status={getJobStatus(job)} />
                  </Td>

                  <Td>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setViewJob(job)}
                        className={ghostButton}
                      >
                        <Eye className="size-3.5" />
                        View
                      </button>

                      <button
                        type="button"
                        disabled={busyId === job._id}
                        onClick={() => void remove(job)}
                        className={cn(ghostButton, "hover:text-red-400")}
                      >
                        {busyId === job._id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          "Remove"
                        )}
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        ) : (
          <EmptyState
            title="No jobs found"
            description="No listings match the current search or filters."
            action={
              <button
                onClick={() => {
                  setQuery("")
                  setStatus("All Statuses")
                  setCategory("All Categories")
                }}
                className={secondaryButton}
              >
                Clear filters
              </button>
            }
          />
        )}
      </DashboardCard>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total job posts"
          value={String(rows.length)}
          icon={BriefcaseBusiness}
          accent="violet"
        />
        <StatCard
          label="Active listings"
          value={String(
            rows.filter((j) => getJobStatus(j) === "Active").length
          )}
          icon={TrendingUp}
          accent="green"
        />
        <StatCard
          label="Total applicants"
          value={String(
            rows.reduce((total, job) => total + (job.applicants ?? 0), 0)
          )}
          icon={Users}
          accent="blue"
        />
      </div>

      {viewJob ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-job-dialog"
            className="w-full max-w-md rounded-xl border border-white/10 bg-[#141418] p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar name={viewJob.company} size="md" />
                <div>
                  <h2
                    id="admin-job-dialog"
                    className="text-base font-semibold text-[#ededef]"
                  >
                    {viewJob.title}
                  </h2>
                  <p className="text-xs text-[#a0a0ab]">{viewJob.company}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewJob(null)}
                aria-label="Close job details"
                className="rounded-lg p-1.5 text-[#a0a0ab] transition hover:bg-white/[0.06] hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-4 text-xs">
              <div>
                <dt className="text-[#6e6e78]">Reference</dt>
                <dd className="mt-1 font-mono text-[#ededef]">{viewJob._id}</dd>
              </div>
              <div>
                <dt className="text-[#6e6e78]">Category</dt>
                <dd className="mt-1 text-[#ededef]">
                  {getJobCategory(viewJob)}
                </dd>
              </div>
              <div>
                <dt className="text-[#6e6e78]">Type</dt>
                <dd className="mt-1 text-[#ededef]">{getJobType(viewJob)}</dd>
              </div>
              <div>
                <dt className="text-[#6e6e78]">Date posted</dt>
                <dd className="mt-1 text-[#ededef]">{getJobDate(viewJob)}</dd>
              </div>
              <div>
                <dt className="text-[#6e6e78]">Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={getJobStatus(viewJob)} />
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setViewJob(null)}
                className={secondaryButton}
              >
                Close
              </button>

              <button
                type="button"
                disabled={busyId === viewJob._id}
                onClick={() => void remove(viewJob)}
                className={cn(primaryButton, "bg-red-600 hover:bg-red-700")}
              >
                <BriefcaseBusiness className="size-3.5" />
                Remove listing
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {Toast}
    </div>
  )
}

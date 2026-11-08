"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  BriefcaseBusiness,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react"
import { recruiterJobs, type RecruiterJob } from "@/app/lib/dashboard-data"
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
import { cn } from "@/lib/utils"

const PLAN_LIMIT = 10

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<RecruiterJob[]>(recruiterJobs)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("All")
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const activeCount = jobs.filter((job) => job.status === "Active").length

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase()

    return jobs.filter((job) => {
      const matchesStatus = status === "All" || job.status === status
      const matchesQuery = !term || job.title.toLowerCase().includes(term)
      return matchesStatus && matchesQuery
    })
  }, [jobs, query, status])

  const toggleStatus = (id: string) => {
    setJobs((current) =>
      current.map((job) => {
        if (job.id !== id) return job
        return {
          ...job,
          status:
            job.status === "Active"
              ? "Closed"
              : job.status === "Draft"
                ? "Active"
                : "Active",
        }
      })
    )
  }

  const remove = (id: string) => {
    setJobs((current) => current.filter((job) => job.id !== id))
    setConfirmDelete(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Jobs"
        description="Create, edit, close and track every job post linked to your company."
        actions={
          activeCount >= PLAN_LIMIT ? (
            <span className={cn(primaryButton, "pointer-events-none opacity-50")}>
              <Plus className="size-4" />
              Active job limit reached
            </span>
          ) : (
            <Link href="/dashboard/recruiter/jobs/new" className={primaryButton}>
              <Plus className="size-4" />
              Post new job
            </Link>
          )
        }
      />

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
          {PLAN_LIMIT - activeCount} slots remaining. Upgrade to Enterprise for up
          to 50 active job posts.
        </p>
      </DashboardCard>

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
      </div>

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
              {rows.map((job) => (
                <tr key={job.id} className="hover:bg-white/[0.02]">
                  <Td>
                    <p className="font-medium text-[#ededef]">{job.title}</p>
                    <p className="text-[11px] text-[#6e6e78]">{job.category}</p>
                  </Td>
                  <Td>
                    <StatusBadge status={job.status} />
                  </Td>
                  <Td className="font-medium text-[#ededef]">{job.applicants}</Td>
                  <Td>{job.posted}</Td>
                  <Td>
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      <Link
                        href={`/dashboard/recruiter/jobs/new?edit=${job.id}`}
                        className={ghostButton}
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </Link>
                      <Link
                        href={`/dashboard/jobs/${job.id}/applicants`}
                        className={ghostButton}
                      >
                        <Eye className="size-3.5" />
                        Applicants
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleStatus(job.id)}
                        className={ghostButton}
                      >
                        {job.status === "Active"
                          ? "Close"
                          : job.status === "Draft"
                            ? "Publish"
                            : "Reopen"}
                      </button>

                      {confirmDelete === job.id ? (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-1.5 py-0.5">
                          <span className="text-[10px] text-red-300">Delete?</span>
                          <button
                            type="button"
                            onClick={() => remove(job.id)}
                            className="rounded px-1 py-0.5 text-[10px] font-semibold text-red-300 hover:bg-red-500/20"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(null)}
                            aria-label="Cancel delete"
                            className="rounded px-1 py-0.5 text-red-300 hover:bg-red-500/20"
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(job.id)}
                          aria-label={`Delete ${job.title}`}
                          className={cn(ghostButton, "hover:text-red-400")}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        ) : (
          <EmptyState
            title="No job posts found"
            description="Try a different search or create your next role to start collecting applicants."
            action={
              <Link href="/dashboard/recruiter/jobs/new" className={primaryButton}>
                Post a new job
              </Link>
            }
          />
        )}
      </DashboardCard>
    </div>
  )
}

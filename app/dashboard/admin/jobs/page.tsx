"use client"

import { useMemo, useState } from "react"
import {
  BriefcaseBusiness,
  Eye,
  FileDown,
  Search,
  Timer,
  TrendingUp,
  Users,
  X,
} from "lucide-react"
import { adminJobRows, type AdminJob } from "@/app/lib/dashboard-data"
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
  const [rows, setRows] = useState<AdminJob[]>(adminJobRows)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("All Statuses")
  const [category, setCategory] = useState("All Categories")
  const [viewJob, setViewJob] = useState<AdminJob | null>(null)

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()

    return rows.filter((job) => {
      const matchesStatus = status === "All Statuses" || job.status === status
      const matchesCategory =
        category === "All Categories" || job.category === category
      const matchesQuery =
        !term ||
        job.title.toLowerCase().includes(term) ||
        job.company.toLowerCase().includes(term)

      return matchesStatus && matchesCategory && matchesQuery
    })
  }, [rows, query, status, category])

  const remove = (job: AdminJob) => {
    if (!window.confirm(`Remove "${job.title}" from HireLoop?`)) return
    setRows((current) => current.filter((item) => item.id !== job.id))
    setViewJob(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Jobs"
        description="Oversee all active listings and historical job posts across the platform."
        actions={
          <button type="button" onClick={() => window.print()} className={secondaryButton}>
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
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by job title or company..."
            className={cn(inputClass, "pl-9")}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-lg border border-white/10 bg-[#0f0f13] px-3 py-2.5 text-xs text-[#d4d4d8] outline-none focus:border-[#5c53fe]"
          >
            <option>All Statuses</option>
            <option>Active</option>
            <option>Closed</option>
          </select>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-lg border border-white/10 bg-[#0f0f13] px-3 py-2.5 text-xs text-[#d4d4d8] outline-none focus:border-[#5c53fe]"
          >
            <option>All Categories</option>
            <option>Design</option>
            <option>Engineering</option>
            <option>Marketing</option>
          </select>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-white/[0.07] bg-[#141418] p-1 lg:ml-auto">
          <span className="rounded-md bg-[#232327] px-3 py-1.5 text-[11px] font-medium text-[#f4f4f5]">
            Active (128)
          </span>
          <span className="px-3 py-1.5 text-[11px] text-[#a0a0ab]">
            Closed (45)
          </span>
        </div>
      </div>

      <DashboardCard className="overflow-hidden">
        {visible.length > 0 ? (
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
                <tr key={job.id} className="hover:bg-white/[0.02]">
                  <Td>
                    <p className="font-medium text-[#ededef]">{job.title}</p>
                    <p className="text-[11px] text-[#6e6e78]">Ref: {job.ref}</p>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <Avatar name={job.company} size="sm" />
                      <span className="text-[#d4d4d8]">{job.company}</span>
                    </div>
                  </Td>
                  <Td>{job.category}</Td>
                  <Td>{job.type}</Td>
                  <Td>{job.posted}</Td>
                  <Td>
                    <StatusBadge status={job.status} />
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
                        onClick={() => remove(job)}
                        className={cn(ghostButton, "hover:text-red-400")}
                      >
                        Remove
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
                type="button"
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
          label="Engagement Rate"
          value="82.4%"
          hint="+5.2% from last month"
          icon={TrendingUp}
          accent="green"
        />
        <StatCard
          label="Avg. Time to Fill"
          value="14 Days"
          hint="Stable performance"
          icon={Timer}
          accent="violet"
        />
        <StatCard
          label="Total Applications"
          value="12,840"
          hint="-2.1% across tech sectors"
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
                <dd className="mt-1 font-mono text-[#ededef]">
                  {viewJob.ref}
                </dd>
              </div>
              <div>
                <dt className="text-[#6e6e78]">Category</dt>
                <dd className="mt-1 text-[#ededef]">{viewJob.category}</dd>
              </div>
              <div>
                <dt className="text-[#6e6e78]">Type</dt>
                <dd className="mt-1 text-[#ededef]">{viewJob.type}</dd>
              </div>
              <div>
                <dt className="text-[#6e6e78]">Date posted</dt>
                <dd className="mt-1 text-[#ededef]">{viewJob.posted}</dd>
              </div>
              <div>
                <dt className="text-[#6e6e78]">Status</dt>
                <dd className="mt-1">
                  <StatusBadge status={viewJob.status} />
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
                onClick={() => remove(viewJob)}
                className={cn(primaryButton, "bg-red-600 hover:bg-red-700")}
              >
                <BriefcaseBusiness className="size-3.5" />
                Remove listing
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

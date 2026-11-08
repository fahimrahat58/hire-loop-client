"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  CalendarCheck2,
  CircleCheckBig,
  FileDown,
  Search,
  UserRoundPlus,
  Users,
} from "lucide-react"
import {
  recruiterApplicants,
  type ApplicationStatus,
} from "@/app/lib/dashboard-data"
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
  inputClass,
  secondaryButton,
} from "@/components/dashboard/ui"
import { cn } from "@/lib/utils"

const statuses: ApplicationStatus[] = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Offered",
  "Rejected",
]

const filters = ["All", ...statuses] as const

export default function RecruiterApplicationsPage() {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<(typeof filters)[number]>("All")
  const [rows, setRows] = useState(recruiterApplicants)

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()

    return rows.filter((candidate) => {
      const matchesFilter = filter === "All" || candidate.status === filter
      const matchesQuery =
        !term ||
        candidate.name.toLowerCase().includes(term) ||
        candidate.role.toLowerCase().includes(term)

      return matchesFilter && matchesQuery
    })
  }, [rows, query, filter])

  const changeStatus = (id: string, status: ApplicationStatus) => {
    setRows((current) =>
      current.map((candidate) =>
        candidate.id === id ? { ...candidate, status } : candidate
      )
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description="Review candidates across every job post and move them through your pipeline."
        actions={
          <button type="button" onClick={() => window.print()} className={secondaryButton}>
            <FileDown className="size-3.5" />
            Export list
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Applicants"
          value="1,284"
          hint="+12.4% vs last month"
          icon={Users}
          accent="blue"
        />
        <StatCard
          label="New This Week"
          value="112"
          hint="Needs first review"
          icon={UserRoundPlus}
          accent="violet"
        />
        <StatCard
          label="In Interview"
          value="24"
          hint="8 scheduled today"
          icon={CalendarCheck2}
          accent="amber"
        />
        <StatCard
          label="Offers Sent"
          value="8"
          hint="3 accepted"
          icon={CircleCheckBig}
          accent="green"
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[11px] font-medium transition",
                filter === item
                  ? "border-[#8f88ff]/50 bg-[#5c53fe]/15 text-[#c7c2ff]"
                  : "border-white/10 bg-[#1a1a1f] text-[#a0a0ab] hover:border-white/20 hover:text-white"
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#6e6e78]" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search candidates..."
            className={cn(inputClass, "pl-9")}
          />
        </div>
      </div>

      <DashboardCard className="overflow-hidden">
        {visible.length > 0 ? (
          <TableShell>
            <thead>
              <tr>
                <Th>Candidate</Th>
                <Th>Role</Th>
                <Th>Date applied</Th>
                <Th>Experience</Th>
                <Th>Status</Th>
                <Th className="text-right">Update status</Th>
              </tr>
            </thead>
            <tbody>
              {visible.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-white/[0.02]">
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={candidate.name} size="sm" />
                      <span className="font-medium text-[#ededef]">
                        {candidate.name}
                      </span>
                    </div>
                  </Td>
                  <Td>{candidate.role}</Td>
                  <Td>{candidate.applied}</Td>
                  <Td>{candidate.experience}</Td>
                  <Td>
                    <StatusBadge status={candidate.status} />
                  </Td>
                  <Td className="text-right">
                    <select
                      value={candidate.status}
                      onChange={(event) =>
                        changeStatus(
                          candidate.id,
                          event.target.value as ApplicationStatus
                        )
                      }
                      aria-label={`Update status for ${candidate.name}`}
                      className="rounded-lg border border-white/10 bg-[#0f0f13] px-2 py-1.5 text-[11px] text-[#d4d4d8] outline-none focus:border-[#5c53fe]"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        ) : (
          <EmptyState
            title="No candidates found"
            description="No applicants match this filter right now. Try another status or clear the search."
            action={
              <button
                type="button"
                onClick={() => {
                  setFilter("All")
                  setQuery("")
                }}
                className={secondaryButton}
              >
                Clear filters
              </button>
            }
          />
        )}
      </DashboardCard>

      <p className="text-[11px] text-[#6e6e78]">
        Need a per-job view?{" "}
        <Link
          href="/dashboard/recruiter/jobs"
          className="font-medium text-[#b8b2ff] hover:text-white"
        >
          Open Manage Jobs
        </Link>{" "}
        and select “Applicants” on any role.
      </p>
    </div>
  )
}

"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  CalendarDays,
  CheckCircle2,
  FileDown,
  FileText,
  Search,
  TrendingUp,
} from "lucide-react"
import { seekerApplications } from "@/app/lib/dashboard-data"
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
  secondaryButton,
} from "@/components/dashboard/ui"
import { cn } from "@/lib/utils"

const tabs = ["Active", "Archived"] as const

export default function SeekerApplicationsPage() {
  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<(typeof tabs)[number]>("Active")

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase()

    return seekerApplications.filter((application) => {
      if (tab === "Archived" && application.status !== "Rejected") return false
      if (tab === "Active" && application.status === "Rejected") return false

      return (
        !term ||
        application.title.toLowerCase().includes(term) ||
        application.company.toLowerCase().includes(term)
      )
    })
  }, [query, tab])

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Applications"
        description="Track your job applications and interview progress in real-time."
        actions={
          <button
            type="button"
            onClick={() => window.print()}
            className={secondaryButton}
          >
            <FileDown className="size-3.5" />
            Export PDF
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Applied" value="24" icon={FileText} accent="blue" />
        <StatCard
          label="Shortlisted"
          value="8"
          icon={CheckCircle2}
          accent="violet"
        />
        <StatCard
          label="Interviews"
          value="3"
          icon={CalendarDays}
          accent="amber"
        />
        <StatCard
          label="Success Rate"
          value="12%"
          hint="Offers / applications"
          icon={TrendingUp}
          accent="green"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-white/[0.07] bg-[#141418] p-1">
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition",
                tab === item
                  ? "bg-[#232327] text-[#f4f4f5]"
                  : "text-[#a0a0ab] hover:bg-white/[0.05] hover:text-white"
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#6e6e78]" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search applications..."
            className={cn(inputClass, "pl-9")}
          />
        </div>
      </div>

      <DashboardCard className="overflow-hidden">
        {rows.length > 0 ? (
          <>
            <TableShell>
              <thead>
                <tr>
                  <Th>Job Title</Th>
                  <Th>Company</Th>
                  <Th>Applied</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Action</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((application) => (
                  <tr
                    key={application.id}
                    className="transition hover:bg-white/[0.02]"
                  >
                    <Td>
                      <div className="flex items-center gap-3">
                        <Avatar name={application.company} size="sm" />
                        <div>
                          <p className="text-[13px] font-medium text-[#ededef]">
                            {application.title}
                          </p>
                          <p className="text-[11px] text-[#6e6e78]">
                            {application.type}
                          </p>
                        </div>
                      </div>
                    </Td>
                    <Td>{application.company}</Td>
                    <Td>{application.applied}</Td>
                    <Td>
                      <StatusBadge status={application.status} />
                    </Td>
                    <Td className="text-right">
                      <Link
                        href="/dashboard/seeker/jobs"
                        className={ghostButton}
                      >
                        Details
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableShell>

            <div className="flex flex-col gap-2 border-t border-white/[0.06] px-5 py-3 text-[11px] text-[#6e6e78] sm:flex-row sm:items-center sm:justify-between">
              <span>Showing 1-{rows.length} of 24 applications</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled
                  className={cn(secondaryButton, "px-2.5 py-1 text-[11px]")}
                >
                  Previous
                </button>
                <button
                  type="button"
                  className={cn(secondaryButton, "px-2.5 py-1 text-[11px]")}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            title="No applications found"
            description="Try clearing the search or switch tabs to see other applications."
          />
        )}
      </DashboardCard>
    </div>
  )
}

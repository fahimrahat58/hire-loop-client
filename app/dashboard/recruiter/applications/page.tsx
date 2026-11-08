"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  CalendarCheck2,
  CircleCheckBig,
  FileDown,
  Loader2,
  Search,
  UserRoundPlus,
  Users,
  RefreshCw,
} from "lucide-react"

import { authClient } from "@/app/lib/auth-client"

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

type ApplicationStatus =
  "Applied" | "Under Review" | "Shortlisted" | "Offered" | "Rejected"

type Application = {
  id: string
  jobId: string
  name: string
  email: string
  role: string
  applied: string
  experience: string
  resumeUrl: string
  coverLetter: string
  status: ApplicationStatus
}

const statuses: ApplicationStatus[] = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Offered",
  "Rejected",
]

const filters = ["All", ...statuses] as const

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function RecruiterApplicationsPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession()

  const recruiterEmail = session?.user?.email

  const [rows, setRows] = useState<Application[]>([])
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<(typeof filters)[number]>("All")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // ------------------------------------
  // FETCH APPLICATIONS
  // ------------------------------------

  const fetchApplications = useCallback(async () => {
    if (!recruiterEmail || !API_URL) return

    try {
      setLoading(true)
      setError("")

      const response = await fetch(`${API_URL}/api/applications/recruiter`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": recruiterEmail,
        },
        cache: "no-store",
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch applications")
      }

      setRows(result.data || [])
    } catch (err) {
      console.error("FETCH APPLICATIONS ERROR:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading applications"
      )
    } finally {
      setLoading(false)
    }
  }, [recruiterEmail])

  useEffect(() => {
    if (sessionLoading) return

    if (!recruiterEmail) {
      setLoading(false)
      setError("Please sign in to view recruiter applications.")
      return
    }

    fetchApplications()
  }, [sessionLoading, recruiterEmail, fetchApplications])

  // ------------------------------------
  // UPDATE APPLICATION STATUS
  // ------------------------------------

  const changeStatus = async (id: string, status: ApplicationStatus) => {
    if (!API_URL || !recruiterEmail) return

    const previousRows = rows

    try {
      setUpdatingId(id)

      // Optimistic UI update
      setRows((current) =>
        current.map((candidate) =>
          candidate.id === id ? { ...candidate, status } : candidate
        )
      )

      const response = await fetch(`${API_URL}/api/applications/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": recruiterEmail,
        },
        body: JSON.stringify({ status }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update application status")
      }
    } catch (err) {
      console.error("UPDATE STATUS ERROR:", err)

      setRows(previousRows)

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update application status"
      )
    } finally {
      setUpdatingId(null)
    }
  }

  // ------------------------------------
  // FILTER AND SEARCH
  // ------------------------------------

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()

    return rows.filter((candidate) => {
      const matchesFilter = filter === "All" || candidate.status === filter

      const matchesQuery =
        !term ||
        candidate.name.toLowerCase().includes(term) ||
        candidate.email.toLowerCase().includes(term) ||
        candidate.role.toLowerCase().includes(term)

      return matchesFilter && matchesQuery
    })
  }, [rows, query, filter])

  // ------------------------------------
  // DYNAMIC STATISTICS
  // ------------------------------------

  const newThisWeek = useMemo(() => {
    const now = new Date()
    const sevenDaysAgo = new Date()

    sevenDaysAgo.setDate(now.getDate() - 7)

    return rows.filter((candidate) => {
      const appliedDate = new Date(candidate.applied)

      return (
        !Number.isNaN(appliedDate.getTime()) &&
        appliedDate >= sevenDaysAgo &&
        appliedDate <= now
      )
    }).length
  }, [rows])

  const underReview = rows.filter(
    (candidate) => candidate.status === "Under Review"
  ).length

  const offersSent = rows.filter(
    (candidate) => candidate.status === "Offered"
  ).length

  // ------------------------------------
  // DATE FORMAT
  // ------------------------------------

  const formatDate = (date: string) => {
    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A"
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // ------------------------------------
  // EXPORT CSV
  // ------------------------------------

  const exportApplications = () => {
    if (visible.length === 0) return

    const headers = [
      "Candidate",
      "Email",
      "Role",
      "Date Applied",
      "Experience",
      "Status",
    ]

    const csvRows = visible.map((candidate) => [
      candidate.name,
      candidate.email,
      candidate.role,
      formatDate(candidate.applied),
      candidate.experience,
      candidate.status,
    ])

    const escapeCSV = (value: string) =>
      `"${String(value).replace(/"/g, '""')}"`

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...csvRows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n")

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = "hireloop-applications.csv"
    link.click()

    URL.revokeObjectURL(url)
  }

  // ------------------------------------
  // RENDER
  // ------------------------------------

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description="Review candidates across every job post and move them through your pipeline."
        actions={
          <button
            type="button"
            onClick={exportApplications}
            disabled={visible.length === 0}
            className={cn(
              secondaryButton,
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            <FileDown className="size-3.5" />
            Export list
          </button>
        }
      />

      {/* STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Applicants"
          value={loading ? "…" : String(rows.length)}
          hint="Total applications received"
          icon={Users}
          accent="blue"
        />

        <StatCard
          label="New This Week"
          value={loading ? "…" : String(newThisWeek)}
          hint="Applications received in 7 days"
          icon={UserRoundPlus}
          accent="violet"
        />

        <StatCard
          label="Under Review"
          value={loading ? "…" : String(underReview)}
          hint="Candidates being reviewed"
          icon={CalendarCheck2}
          accent="amber"
        />

        <StatCard
          label="Offers Sent"
          value={loading ? "…" : String(offersSent)}
          hint="Applications with offers"
          icon={CircleCheckBig}
          accent="green"
        />
      </div>

      {/* SEARCH AND FILTER */}

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

      {/* ERROR MESSAGE */}

      {error && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-red-400">{error}</p>

          <button
            type="button"
            onClick={fetchApplications}
            className="flex items-center gap-2 text-xs font-medium text-[#c7c2ff]"
          >
            <RefreshCw className="size-3.5" />
            Try again
          </button>
        </div>
      )}

      {/* APPLICATION TABLE */}

      <DashboardCard className="overflow-hidden">
        {loading || sessionLoading ? (
          <div className="flex min-h-60 flex-col items-center justify-center gap-3">
            <Loader2 className="size-7 animate-spin text-[#8f88ff]" />
            <p className="text-xs text-[#a0a0ab]">Loading applications...</p>
          </div>
        ) : visible.length > 0 ? (
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

                      <div className="min-w-0">
                        <p className="font-medium text-[#ededef]">
                          {candidate.name}
                        </p>
                        <p className="max-w-40 truncate text-[10px] text-[#777783]">
                          {candidate.email}
                        </p>
                      </div>
                    </div>
                  </Td>

                  <Td>{candidate.role}</Td>

                  <Td>{formatDate(candidate.applied)}</Td>

                  <Td>{candidate.experience}</Td>

                  <Td>
                    <StatusBadge status={candidate.status} />
                  </Td>

                  <Td className="text-right">
                    <select
                      value={candidate.status}
                      disabled={updatingId === candidate.id}
                      onChange={(event) =>
                        changeStatus(
                          candidate.id,
                          event.target.value as ApplicationStatus
                        )
                      }
                      aria-label={`Update status for ${candidate.name}`}
                      className="rounded-lg border border-white/10 bg-[#0f0f13] px-2 py-1.5 text-[11px] text-[#d4d4d8] outline-none focus:border-[#5c53fe] disabled:opacity-50"
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
            title={
              rows.length === 0 ? "No applications yet" : "No candidates found"
            }
            description={
              rows.length === 0
                ? "Applications submitted for your job posts will appear here."
                : "No applicants match this filter right now. Try another status or clear the search."
            }
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
        and select "Applicants" on any role.
      </p>
    </div>
  )
}

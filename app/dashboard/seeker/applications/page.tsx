"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  FileDown,
  FileText,
  RefreshCw,
  Search,
} from "lucide-react"

import { authClient } from "@/app/lib/auth-client"
import { useJobs } from "@/hooks/use-jobs"
import { useSeekerApplications } from "@/hooks/use-seeker-applications"
import {
  getJobDate,
  getJobStatus,
  getJobType,
  type ApiJob,
} from "@/app/lib/jobs-api"
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

const tabs = ["All", "Open", "Closed"] as const

type Tab = (typeof tabs)[number]

function matchesTab(job: ApiJob, tab: Tab) {
  if (tab === "All") return true

  const status = getJobStatus(job)

  return tab === "Open" ? status === "Active" : status === "Closed"
}

export default function SeekerApplicationsPage() {
  const { data: session, isPending: sessionPending } = authClient.useSession()

  const {
    jobs,
    loading: jobsLoading,
    error: jobsError,
    reload: reloadJobs,
  } = useJobs()

  const {
    appliedSet,
    appliedJobIds,
    loading: applicationsLoading,
    error: applicationsError,
    reload: reloadApplications,
  } = useSeekerApplications(jobs)

  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<Tab>("All")

  const appliedJobs = useMemo(
    () => jobs.filter((job) => appliedSet.has(job._id)),
    [jobs, appliedSet]
  )

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase()

    return appliedJobs.filter((job) => {
      if (!matchesTab(job, tab)) return false

      return (
        !term ||
        job.title.toLowerCase().includes(term) ||
        job.company.toLowerCase().includes(term) ||
        job.location.toLowerCase().includes(term)
      )
    })
  }, [appliedJobs, query, tab])

  const openApplications = useMemo(
    () => appliedJobs.filter((job) => getJobStatus(job) === "Active").length,
    [appliedJobs]
  )

  const closedApplications = appliedJobs.length - openApplications

  const appliedCompanies = useMemo(
    () =>
      new Set(
        appliedJobs
          .map((job) => job.company.trim())
          .filter((company) => company)
      ).size,
    [appliedJobs]
  )

  const loading = jobsLoading || applicationsLoading || sessionPending
  const error = jobsError || applicationsError

  const retry = () => {
    if (jobsError) void reloadJobs()
    if (applicationsError) void reloadApplications()
  }

  if (!sessionPending && !session?.user) {
    return (
      <DashboardCard>
        <EmptyState
          title="Sign in to view applications"
          description="Your applications are linked to your HireLoop seeker account."
          action={
            <Link href="/sign-in" className={primaryButton}>
              Sign in
            </Link>
          }
        />
      </DashboardCard>
    )
  }

  if (!sessionPending && session?.user?.role !== "seeker") {
    return (
      <DashboardCard>
        <EmptyState
          title="Applications are for job seekers"
          description="Switch to a job seeker account to track your applications."
          action={
            <Link href="/dashboard" className={primaryButton}>
              Go to dashboard
            </Link>
          }
        />
      </DashboardCard>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Applications"
        description="Applications confirmed by the HireLoop API. Pipeline statuses and applied dates are not exposed by the backend yet."
        actions={
          <>
            <Link href="/dashboard/seeker/jobs" className={primaryButton}>
              <BriefcaseBusiness className="size-3.5" />
              Browse jobs
            </Link>

            <button
              type="button"
              onClick={() => window.print()}
              className={secondaryButton}
            >
              <FileDown className="size-3.5" />
              Export PDF
            </button>
          </>
        }
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.03]"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Applied"
            value={String(appliedJobIds.length)}
            hint="Confirmed by the applications API"
            icon={FileText}
            accent="blue"
          />

          <StatCard
            label="Open Roles"
            value={String(openApplications)}
            hint="Applications on roles still open"
            icon={BriefcaseBusiness}
            accent="green"
          />

          <StatCard
            label="Closed Roles"
            value={String(closedApplications)}
            hint="Applications on closed roles"
            icon={CalendarDays}
            accent="amber"
          />

          <StatCard
            label="Companies"
            value={String(appliedCompanies)}
            hint="Companies you have applied to"
            icon={Building2}
            accent="violet"
          />
        </div>
      )}

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
        {loading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-14 animate-pulse rounded-lg bg-white/[0.04]"
              />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            title="Unable to load applications"
            description={error}
            action={
              <button type="button" onClick={retry} className={secondaryButton}>
                <RefreshCw className="size-3.5" />
                Try again
              </button>
            }
          />
        ) : rows.length > 0 ? (
          <>
            <TableShell>
              <thead>
                <tr>
                  <Th>Job Title</Th>
                  <Th>Company</Th>
                  <Th>Location</Th>
                  <Th>Job Posted</Th>
                  <Th>Job Status</Th>
                  <Th>Application</Th>
                  <Th className="text-right">Action</Th>
                </tr>
              </thead>

              <tbody>
                {rows.map((job) => (
                  <tr
                    key={job._id}
                    className="transition hover:bg-white/[0.02]"
                  >
                    <Td>
                      <div className="flex items-center gap-3">
                        <Avatar name={job.company} size="sm" />

                        <div>
                          <p className="text-[13px] font-medium text-[#ededef]">
                            {job.title}
                          </p>
                          <p className="text-[11px] text-[#6e6e78]">
                            {getJobType(job)}
                          </p>
                        </div>
                      </div>
                    </Td>

                    <Td>{job.company}</Td>
                    <Td>{job.location || "—"}</Td>
                    <Td>{getJobDate(job)}</Td>

                    <Td>
                      <StatusBadge status={getJobStatus(job)} />
                    </Td>

                    <Td>
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-0.5 text-[11px] font-medium text-[#a0a0ab]">
                        Recorded
                      </span>
                    </Td>

                    <Td className="text-right">
                      <Link
                        href={`/dashboard/jobs/${job._id}`}
                        className={ghostButton}
                      >
                        View job
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableShell>

            <div className="flex flex-col gap-2 border-t border-white/[0.06] px-5 py-3 text-[11px] text-[#6e6e78] sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {rows.length} of {appliedJobs.length} confirmed
                applications
              </span>

              <span>
                Status updates are managed by recruiters and are not exposed by
                the API.
              </span>
            </div>
          </>
        ) : appliedJobs.length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="Apply to a role and it will appear here once the applications API confirms it."
            action={
              <Link href="/dashboard/seeker/jobs" className={primaryButton}>
                Browse jobs
              </Link>
            }
          />
        ) : (
          <EmptyState
            title="No applications match your filters"
            description="Try a different search term or switch tabs to see other applications."
            action={
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  setTab("All")
                }}
                className={secondaryButton}
              >
                Clear filters
              </button>
            }
          />
        )}
      </DashboardCard>
    </div>
  )
}

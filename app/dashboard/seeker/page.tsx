"use client"

import { useMemo } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  Pencil,
  RefreshCw,
  Sparkles,
} from "lucide-react"

import { authClient } from "@/app/lib/auth-client"
import { useJobs } from "@/hooks/use-jobs"
import { useSavedJobs } from "@/hooks/use-saved-jobs"
import { useSeekerApplications } from "@/hooks/use-seeker-applications"
import {
  getJobCategory,
  getJobDate,
  getJobStatus,
  getJobType,
} from "@/app/lib/jobs-api"
import { getSavedJobDate, getSavedJobStatus } from "@/app/lib/saved-jobs"
import {
  Avatar,
  DashboardCard,
  EmptyState,
  PageHeader,
  SectionCard,
  StatCard,
  primaryButton,
  secondaryButton,
} from "@/components/dashboard/ui"

const statIcons = [BriefcaseBusiness, Bookmark, FileText, Building2]
const statAccents = ["violet", "blue", "amber", "green"] as const

function formatMemberSince(value?: Date | string | null) {
  if (!value) return "—"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "—"

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-64 animate-pulse rounded bg-white/[0.06]" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-white/[0.04]" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.03]"
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-72 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.03]" />
        <div className="h-72 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.03] lg:col-span-2" />
      </div>
    </div>
  )
}

export default function SeekerDashboardPage() {
  const { data: session, isPending: sessionPending } = authClient.useSession()

  const {
    jobs,
    loading: jobsLoading,
    error: jobsError,
    reload: reloadJobs,
  } = useJobs()

  const {
    savedJobs,
    loading: savedLoading,
    error: savedError,
    reload: reloadSaved,
  } = useSavedJobs()

  const {
    appliedSet,
    appliedJobIds,
    loading: applicationsLoading,
    error: applicationsError,
    reload: reloadApplications,
  } = useSeekerApplications(jobs)

  const openJobs = useMemo(
    () => jobs.filter((job) => getJobStatus(job) === "Active"),
    [jobs]
  )

  const openCompanies = useMemo(
    () =>
      new Set(
        openJobs.map((job) => job.company.trim()).filter((company) => company)
      ).size,
    [openJobs]
  )

  const appliedJobs = useMemo(
    () => jobs.filter((job) => appliedSet.has(job._id)),
    [jobs, appliedSet]
  )

  const openAppliedJobs = useMemo(
    () =>
      appliedJobs.filter((job) => getJobStatus(job) === "Active").length,
    [appliedJobs]
  )

  const closedAppliedJobs = appliedJobs.length - openAppliedJobs

  const appliedCompanies = useMemo(
    () =>
      new Set(
        appliedJobs
          .map((job) => job.company.trim())
          .filter((company) => company)
      ).size,
    [appliedJobs]
  )

  const openSavedJobs = useMemo(
    () =>
      savedJobs.filter((job) => getSavedJobStatus(job) === "Active").length,
    [savedJobs]
  )

  const latestOpenJobs = useMemo(() => openJobs.slice(0, 4), [openJobs])
  const latestSavedJobs = useMemo(() => savedJobs.slice(0, 3), [savedJobs])

  const name = session?.user?.name?.trim() || "there"
  const memberSince = formatMemberSince(
    session?.user?.createdAt as Date | string | undefined
  )

  const statsLoading =
    sessionPending || jobsLoading || savedLoading || applicationsLoading

  if (sessionPending) {
    return <DashboardSkeleton />
  }

  if (!session?.user) {
    return (
      <DashboardCard>
        <EmptyState
          title="Sign in to view your dashboard"
          description="Your saved jobs, applications and job recommendations are tied to your HireLoop account."
          action={
            <Link href="/sign-in" className={primaryButton}>
              Sign in
            </Link>
          }
        />
      </DashboardCard>
    )
  }

  if (session.user.role !== "seeker") {
    return (
      <DashboardCard>
        <EmptyState
          title="This dashboard is for job seekers"
          description="Sign in with a job seeker account to browse jobs, save roles, and track applications."
          action={
            <Link href="/dashboard" className={primaryButton}>
              Go to dashboard
            </Link>
          }
        />
      </DashboardCard>
    )
  }

  const stats = [
    {
      label: "Open roles",
      value: String(openJobs.length),
      hint: `${openCompanies} ${openCompanies === 1 ? "company" : "companies"} hiring`,
    },
    {
      label: "Saved jobs",
      value: String(savedJobs.length),
      hint: `${openSavedJobs} still open`,
    },
    {
      label: "Applications",
      value: String(appliedJobIds.length),
      hint: `${openAppliedJobs} on open roles`,
    },
    {
      label: "Applied companies",
      value: String(appliedCompanies),
      hint: "Companies you have applied to",
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${name}`}
        description="Here is a live snapshot of your job search, pulled from your HireLoop account."
        actions={
          <>
            <Link href="/dashboard/seeker/jobs" className={primaryButton}>
              Browse jobs
              <ArrowUpRight className="size-3.5" />
            </Link>
            <Link href="/dashboard/seeker/settings" className={secondaryButton}>
              <Pencil className="size-3.5" />
              Edit settings
            </Link>
          </>
        }
      />

      {jobsError || savedError || applicationsError ? (
        <div className="flex flex-col gap-3 rounded-xl border border-[#f59e0b]/25 bg-[#f59e0b]/10 px-4 py-3 text-[13px] text-[#fcd34d] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <RefreshCw className="mt-0.5 size-4 shrink-0" />
            <span>
              Some dashboard data could not be loaded.{" "}
              {jobsError || savedError || applicationsError}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (jobsError) void reloadJobs()
              if (savedError) void reloadSaved()
              if (applicationsError) void reloadApplications()
            }}
            className={secondaryButton}
          >
            Retry
          </button>
        </div>
      ) : null}

      {statsLoading ? (
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
          {stats.map((stat, index) => {
            const Icon = statIcons[index] ?? BriefcaseBusiness

            return (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                hint={stat.hint}
                icon={Icon}
                accent={statAccents[index] ?? "violet"}
              />
            )
          })}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardCard className="flex flex-col p-5">
          <div className="flex items-start gap-3">
            <Avatar name={session.user.name || "User"} size="xl" />

            <div className="min-w-0 pt-1">
              <h2 className="truncate text-lg font-semibold text-[#ededef]">
                {session.user.name || "Your profile"}
              </h2>

              <p className="text-xs text-[#a0a0ab]">
                {session.user.email || "No email on file"}
              </p>

              <span className="mt-2 inline-flex items-center rounded-full border border-[#5c53fe]/40 bg-[#5c53fe]/15 px-2 py-0.5 text-[10px] font-medium text-[#b8b2ff]">
                Job Seeker
              </span>
            </div>
          </div>

          <dl className="mt-5 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-[#a0a0ab]">
              <Mail className="size-3.5 text-[#6e6e78]" />
              <span className="truncate">
                {session.user.email || "No email on file"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[#a0a0ab]">
              <CheckCircle2 className="size-3.5 text-[#6e6e78]" />
              Member since {memberSince}
            </div>

            <div className="flex items-center gap-2 text-[#a0a0ab]">
              <Bookmark className="size-3.5 text-[#6e6e78]" />
              {savedJobs.length} saved{" "}
              {savedJobs.length === 1 ? "job" : "jobs"}
            </div>
          </dl>

          <Link
            href="/dashboard/seeker/settings"
            className={`${secondaryButton} mt-auto w-full`}
          >
            <Pencil className="size-3.5" />
            Manage account
          </Link>
        </DashboardCard>

        <SectionCard
          title="Application snapshot"
          description="Detected from your submitted applications."
          className="lg:col-span-2"
          bodyClassName="p-5"
          action={
            <Link
              href="/dashboard/seeker/applications"
              className="text-xs font-medium text-[#b8b2ff] transition hover:text-white"
            >
              View applications
            </Link>
          }
        >
          {applicationsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-12 animate-pulse rounded-lg bg-white/[0.04]"
                />
              ))}
            </div>
          ) : applicationsError ? (
            <div className="flex flex-col items-start gap-3">
              <p className="text-sm text-[#a0a0ab]">{applicationsError}</p>

              <button
                type="button"
                onClick={() => void reloadApplications()}
                className={secondaryButton}
              >
                <RefreshCw className="size-3.5" />
                Try again
              </button>
            </div>
          ) : appliedJobIds.length === 0 ? (
            <EmptyState
              title="No applications yet"
              description="Apply to a role and it will appear here. The API does not expose pipeline statuses, so only confirmed applications are shown."
              action={
                <Link href="/dashboard/seeker/jobs" className={primaryButton}>
                  Find a role
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-white/[0.06] bg-[#0f0f13] p-3">
                  <p className="text-[11px] text-[#7c7c86]">Submitted</p>
                  <p className="mt-1 text-xl font-semibold text-[#ededef]">
                    {appliedJobIds.length}
                  </p>
                </div>

                <div className="rounded-lg border border-white/[0.06] bg-[#0f0f13] p-3">
                  <p className="text-[11px] text-[#7c7c86]">On open roles</p>
                  <p className="mt-1 text-xl font-semibold text-[#ededef]">
                    {openAppliedJobs}
                  </p>
                </div>

                <div className="rounded-lg border border-white/[0.06] bg-[#0f0f13] p-3">
                  <p className="text-[11px] text-[#7c7c86]">On closed roles</p>
                  <p className="mt-1 text-xl font-semibold text-[#ededef]">
                    {closedAppliedJobs}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-white/[0.05] rounded-lg border border-white/[0.06]">
                {appliedJobs.slice(0, 4).map((job) => (
                  <Link
                    key={job._id}
                    href={`/dashboard/jobs/${job._id}`}
                    className="flex items-center gap-3 px-4 py-3 transition hover:bg-white/[0.02]"
                  >
                    <Avatar name={job.company} size="sm" />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-[#ededef]">
                        {job.title}
                      </p>
                      <p className="truncate text-[11px] text-[#6e6e78]">
                        {job.company} · {job.location}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[10px] text-[#a0a0ab]">
                      Recorded
                    </span>
                  </Link>
                ))}
              </div>

              <p className="text-[11px] text-[#6e6e78]">
                Detailed application statuses are not exposed by the current
                API, so they are not shown here.
              </p>
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Latest open roles"
          description="Fresh opportunities from the HireLoop jobs API."
          className="lg:col-span-2"
          action={
            <Link
              href="/dashboard/seeker/jobs"
              className="text-xs font-medium text-[#b8b2ff] transition hover:text-white"
            >
              Browse all
            </Link>
          }
          bodyClassName="divide-y divide-white/[0.05]"
        >
          {jobsLoading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-lg bg-white/[0.04]"
                />
              ))}
            </div>
          ) : jobsError ? (
            <EmptyState
              title="Unable to load jobs"
              description={jobsError}
              action={
                <button
                  type="button"
                  onClick={() => void reloadJobs()}
                  className={secondaryButton}
                >
                  <RefreshCw className="size-3.5" />
                  Try again
                </button>
              }
            />
          ) : latestOpenJobs.length === 0 ? (
            <EmptyState
              title="No open roles right now"
              description="New roles will appear here as soon as recruiters publish them."
            />
          ) : (
            latestOpenJobs.map((job) => (
              <Link
                key={job._id}
                href={`/dashboard/jobs/${job._id}`}
                className="flex flex-col gap-3 px-5 py-4 transition hover:bg-white/[0.02] sm:flex-row sm:items-center"
              >
                <Avatar name={job.company} size="md" />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[13px] font-semibold text-[#ededef]">
                      {job.title}
                    </h3>
                    <span className="rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[10px] text-[#a0a0ab]">
                      {getJobType(job)}
                    </span>
                  </div>

                  <p className="mt-0.5 truncate text-[11px] text-[#6e6e78]">
                    {job.company} · {getJobCategory(job)} · {job.location}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-[#7c7c86] sm:flex-col sm:items-end sm:gap-1">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3" />
                    {job.location}
                  </span>

                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3" />
                    Posted {getJobDate(job)}
                  </span>
                </div>
              </Link>
            ))
          )}
        </SectionCard>

        <SectionCard
          title="Your saved jobs"
          action={
            <Link
              href="/dashboard/seeker/saved"
              className="text-xs font-medium text-[#b8b2ff] transition hover:text-white"
            >
              View all
            </Link>
          }
          bodyClassName="divide-y divide-white/[0.05]"
        >
          {savedLoading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-12 animate-pulse rounded-lg bg-white/[0.04]"
                />
              ))}
            </div>
          ) : savedError ? (
            <EmptyState
              title="Unable to load saved jobs"
              description={savedError}
              action={
                <button
                  type="button"
                  onClick={() => void reloadSaved()}
                  className={secondaryButton}
                >
                  <RefreshCw className="size-3.5" />
                  Try again
                </button>
              }
            />
          ) : latestSavedJobs.length === 0 ? (
            <EmptyState
              title="Nothing saved yet"
              description="Save roles you want to revisit and they will show up here."
              action={
                <Link href="/dashboard/seeker/jobs" className={primaryButton}>
                  Browse jobs
                </Link>
              }
            />
          ) : (
            latestSavedJobs.map((job) => (
              <Link
                key={job.jobId}
                href={`/dashboard/jobs/${job.jobId}`}
                className="flex items-start gap-3 px-5 py-4 transition hover:bg-white/[0.02]"
              >
                <Avatar name={job.company} size="sm" />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-[#ededef]">
                    {job.title}
                  </p>
                  <p className="truncate text-[11px] text-[#6e6e78]">
                    {job.company} · {job.location}
                  </p>
                  <p className="mt-1 text-[10px] text-[#5e5e68]">
                    Saved {getSavedJobDate(job.savedAt)}
                  </p>
                </div>

                <span
                  className={
                    getSavedJobStatus(job) === "Active"
                      ? "shrink-0 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 px-2 py-0.5 text-[10px] text-[#86efac]"
                      : "shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[10px] text-[#a0a0ab]"
                  }
                >
                  {getSavedJobStatus(job)}
                </span>
              </Link>
            ))
          )}
        </SectionCard>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6e6e78]">
        <Sparkles className="size-3.5" />
        Only data returned by the HireLoop API is shown. Application status
        history and billing details require backend support that is not
        available yet.
      </div>
    </div>
  )
}

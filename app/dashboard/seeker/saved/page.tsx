"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Bookmark,
  Building2,
  CalendarClock,
  DollarSign,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { authClient } from "@/app/lib/auth-client"
import { useSavedJobs } from "@/hooks/use-saved-jobs"
import {
  getSavedJobDate,
  getSavedJobStatus,
  getSavedJobsErrorMessage,
  type SavedJob,
} from "@/app/lib/saved-jobs"
import {
  Avatar,
  DashboardCard,
  EmptyState,
  PageHeader,
  StatCard,
  inputClass,
  primaryButton,
  secondaryButton,
} from "@/components/dashboard/ui"
import { cn } from "@/lib/utils"

const sortOptions = [
  { label: "Recently Saved", value: "recent" as const },
  { label: "Oldest Saved", value: "oldest" as const },
]

function SavedJobsSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-56 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.03]"
        />
      ))}
    </div>
  )
}

function savedJobMatches(job: SavedJob, term: string) {
  if (!term) return true

  const haystack = [
    job.title,
    job.company,
    job.location,
    job.category,
    job.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  return haystack.includes(term)
}

export default function SeekerSavedJobsPage() {
  const { data: session, isPending: sessionPending } = authClient.useSession()

  const {
    savedJobs,
    loading,
    error,
    reload,
    remove,
    pendingIds,
  } = useSavedJobs()

  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All Saved")
  const [sort, setSort] = useState<"recent" | "oldest">("recent")

  const categories = useMemo(
    () => [
      "All Saved",
      ...new Set(
        savedJobs
          .map((job) => job.category?.trim() || "General")
          .filter(Boolean)
      ),
    ],
    [savedJobs]
  )

  const visibleJobs = useMemo(() => {
    const term = query.trim().toLowerCase()

    const list = savedJobs.filter((job) => {
      const jobCategory = job.category?.trim() || "General"

      return (
        (category === "All Saved" || jobCategory === category) &&
        savedJobMatches(job, term)
      )
    })

    return sort === "oldest" ? [...list].reverse() : list
  }, [savedJobs, query, category, sort])

  const openSavedJobs = useMemo(
    () =>
      savedJobs.filter((job) => getSavedJobStatus(job) === "Active").length,
    [savedJobs]
  )

  const savedThisMonth = useMemo(() => {
    const now = new Date()

    return savedJobs.filter((job) => {
      const date = new Date(job.savedAt)

      return (
        !Number.isNaN(date.getTime()) &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      )
    }).length
  }, [savedJobs])

  const handleRemove = async (job: SavedJob) => {
    try {
      await remove(job.jobId)
      toast.success(`Removed ${job.title} from saved jobs`)
    } catch (removeError) {
      toast.error(getSavedJobsErrorMessage(removeError))
    }
  }

  if (sessionPending) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 animate-pulse rounded bg-white/[0.06]" />
        <SavedJobsSkeleton />
      </div>
    )
  }

  if (!session?.user) {
    return (
      <DashboardCard>
        <EmptyState
          title="Sign in to view saved jobs"
          description="Saved jobs are stored against your HireLoop seeker account."
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
          title="Saved jobs are for job seekers"
          description="Switch to a job seeker account to save and manage jobs."
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
        title="Saved Jobs"
        description="Every job saved to your HireLoop account, synced with the Saved Jobs API."
        actions={
          <Link href="/dashboard/seeker/jobs" className={primaryButton}>
            Browse more jobs
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          [1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.03]"
            />
          ))
        ) : (
          <>
            <StatCard
              label="Total Saved"
              value={String(savedJobs.length)}
              hint="Stored by the saved jobs API"
              icon={Bookmark}
              accent="violet"
            />

            <StatCard
              label="Still Open"
              value={String(openSavedJobs)}
              hint="Saved roles accepting applications"
              icon={CalendarClock}
              accent="amber"
            />

            <StatCard
              label="Saved This Month"
              value={String(savedThisMonth)}
              hint="Based on saved timestamps"
              icon={Building2}
              accent="green"
            />
          </>
        )}
      </div>

      <DashboardCard className="p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#6e6e78]" />

            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search saved jobs..."
              className={cn(inputClass, "pl-9")}
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[11px] font-medium transition",
                  category === item
                    ? "border-[#8f88ff]/50 bg-[#5c53fe]/15 text-[#c7c2ff]"
                    : "border-white/10 bg-[#1a1a1f] text-[#a0a0ab] hover:border-white/20 hover:text-white"
                )}
              >
                {item} (
                {item === "All Saved"
                  ? savedJobs.length
                  : savedJobs.filter(
                      (job) => (job.category?.trim() || "General") === item
                    ).length}
                )
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#6e6e78]">Sort by:</span>

            <select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as "recent" | "oldest")
              }
              className="rounded-lg border border-white/10 bg-[#0f0f13] px-2.5 py-1.5 text-[11px] text-[#d4d4d8] outline-none focus:border-[#5c53fe]"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </DashboardCard>

      {loading ? (
        <SavedJobsSkeleton />
      ) : error ? (
        <DashboardCard>
          <EmptyState
            title="Unable to load saved jobs"
            description={error}
            action={
              <button
                type="button"
                onClick={() => void reload()}
                className={secondaryButton}
              >
                <RefreshCw className="size-3.5" />
                Try again
              </button>
            }
          />
        </DashboardCard>
      ) : visibleJobs.length === 0 ? (
        <DashboardCard>
          <EmptyState
            title={
              savedJobs.length === 0
                ? "No saved jobs yet"
                : "No saved jobs match your filters"
            }
            description={
              savedJobs.length === 0
                ? "Save roles you are interested in and they will show up here for easy access."
                : "Try a different search term, category, or sort order."
            }
            action={
              savedJobs.length === 0 ? (
                <Link href="/dashboard/seeker/jobs" className={primaryButton}>
                  Browse jobs
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("")
                    setCategory("All Saved")
                    setSort("recent")
                  }}
                  className={secondaryButton}
                >
                  Clear filters
                </button>
              )
            }
          />
        </DashboardCard>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {visibleJobs.map((job) => {
            const status = getSavedJobStatus(job)
            const removing = pendingIds.includes(job.jobId)

            return (
              <DashboardCard
                key={job.jobId}
                className={cn(
                  "flex flex-col p-5",
                  status !== "Active" && "opacity-75"
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar name={job.company} size="md" />

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold tracking-[0.12em] text-[#6e6e78] uppercase">
                      {job.company}
                    </p>

                    <h2 className="mt-0.5 truncate text-base font-semibold text-[#ededef]">
                      {job.title}
                    </h2>
                  </div>

                  <span
                    className={cn(
                      "shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium",
                      status === "Active"
                        ? "border-[#22c55e]/30 bg-[#22c55e]/10 text-[#86efac]"
                        : "border-white/10 bg-white/[0.06] text-[#a0a0ab]"
                    )}
                  >
                    {status}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-[#7c7c86]">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3" />
                    {job.location || "Location not specified"}
                  </span>

                  <span className="inline-flex items-center gap-1">
                    <DollarSign className="size-3" />
                    {job.salary || "Not specified"}
                  </span>

                  <span className="inline-flex items-center gap-1">
                    <Building2 className="size-3" />
                    {job.category?.trim() || "General"}
                  </span>
                </div>

                <p className="mt-3 line-clamp-2 text-[12px] leading-relaxed text-[#8b8b96]">
                  {job.description || "No description provided."}
                </p>

                <p className="mt-3 text-[11px] text-[#6e6e78]">
                  Saved {getSavedJobDate(job.savedAt)}
                </p>

                <div className="mt-auto flex items-center gap-2 pt-5">
                  <Link
                    href={`/dashboard/jobs/${job.jobId}`}
                    className={cn(primaryButton, "flex-1")}
                  >
                    View job
                  </Link>

                  <button
                    type="button"
                    onClick={() => void handleRemove(job)}
                    disabled={removing}
                    className={secondaryButton}
                    aria-label={`Remove ${job.title} from saved jobs`}
                  >
                    {removing ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                    {removing ? "Removing..." : "Remove"}
                  </button>
                </div>
              </DashboardCard>
            )
          })}
        </div>
      )}

      {!loading && !error ? (
        <div className="flex items-center justify-between gap-3 text-[11px] text-[#6e6e78]">
          <span>
            Showing {visibleJobs.length} of {savedJobs.length} saved{" "}
            {savedJobs.length === 1 ? "job" : "jobs"}
          </span>

          <Link
            href="/dashboard/seeker/jobs"
            className="font-medium text-[#b8b2ff] transition hover:text-white"
          >
            Find more roles
          </Link>
        </div>
      ) : null}
    </div>
  )
}

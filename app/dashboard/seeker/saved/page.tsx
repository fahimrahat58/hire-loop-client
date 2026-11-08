"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Bookmark,
  Building2,
  CalendarClock,
  DollarSign,
  MapPin,
  Search,
  Trash2,
} from "lucide-react"
import { useJobs } from "@/hooks/use-jobs"
import {
  getJobCategory,
  getJobDate,
  getJobStatus,
  type ApiJob,
} from "@/app/lib/jobs-api"
import {
  getSavedJobs,
  onSavedJobsChange,
  removeSavedJob,
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

export default function SeekerSavedJobsPage() {
  const { jobs: allJobs, loading, error, reload } = useJobs()

  const [savedEntries, setSavedEntries] = useState(getSavedJobs)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All Saved")
  const [sort, setSort] = useState<"recent" | "oldest">("recent")

  useEffect(() => {
    const sync = () => setSavedEntries(getSavedJobs())

    sync()

    return onSavedJobsChange(sync)
  }, [])

  const savedJobs = useMemo(() => {
    const ids = new Set(savedEntries.map((entry) => entry.id))

    return allJobs.filter((job) => ids.has(job._id))
  }, [allJobs, savedEntries])

  const categories = useMemo(
    () => ["All Saved", ...new Set(savedJobs.map(getJobCategory))],
    [savedJobs]
  )

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()

    const list = savedJobs.filter(
      (job) =>
        (category === "All Saved" || getJobCategory(job) === category) &&
        (!term ||
          job.title.toLowerCase().includes(term) ||
          job.company.toLowerCase().includes(term) ||
          job.location.toLowerCase().includes(term))
    )

    return sort === "oldest" ? [...list].reverse() : list
  }, [savedJobs, query, category, sort])

  const remove = (id: string) => {
    removeSavedJob(id)
    setSavedEntries(getSavedJobs())
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saved Jobs"
        description="Manage and track your bookmarked opportunities."
        actions={
          <Link href="/dashboard/seeker/jobs" className={primaryButton}>
            Browse more jobs
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:max-w-xl">
        <StatCard
          label="Total Saved"
          value={String(savedEntries.length)}
          icon={Bookmark}
          accent="violet"
        />

        <StatCard
          label="Available Saved Jobs"
          value={String(
            savedJobs.filter((job) => getJobStatus(job) === "Active").length
          )}
          icon={CalendarClock}
          accent="amber"
        />
      </div>

      <DashboardCard className="p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#6e6e78]" />

            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
                  : savedJobs.filter((job) => getJobCategory(job) === item)
                      .length}
                )
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#6e6e78]">Sort by:</span>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "recent" | "oldest")}
              className="rounded-lg border border-white/10 bg-[#0f0f13] px-2.5 py-1.5 text-[11px] text-[#d4d4d8] outline-none focus:border-[#5c53fe]"
            >
              <option value="recent">Recently Saved</option>
              <option value="oldest">Oldest Saved</option>
            </select>
          </div>
        </div>
      </DashboardCard>

      {loading ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-52 animate-pulse rounded-xl bg-white/[0.04]"
            />
          ))}
        </div>
      ) : error ? (
        <DashboardCard>
          <EmptyState
            title="Unable to load saved jobs"
            description={error}
            action={
              <button onClick={() => void reload()} className={primaryButton}>
                Try again
              </button>
            }
          />
        </DashboardCard>
      ) : visible.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {visible.map((job: ApiJob) => (
            <DashboardCard
              key={job._id}
              className={cn(
                "flex flex-col p-5",
                getJobStatus(job) === "Closed" && "opacity-70"
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
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-[#7c7c86]">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3" />
                  {job.location}
                </span>

                <span className="inline-flex items-center gap-1">
                  <DollarSign className="size-3" />
                  {job.salary || "Not specified"}
                </span>

                <span className="inline-flex items-center gap-1">
                  <Building2 className="size-3" />
                  {getJobCategory(job)}
                </span>
              </div>

              <p className="mt-3 text-[11px] text-[#6e6e78]">
                Posted {getJobDate(job)}
              </p>

              <div className="mt-auto flex items-center gap-2 pt-5">
                {getJobStatus(job) === "Closed" ? (
                  <button
                    type="button"
                    disabled
                    className={cn(primaryButton, "flex-1")}
                  >
                    Position closed
                  </button>
                ) : (
                  <Link
                    href={`/dashboard/jobs/${job._id}`}
                    className={cn(primaryButton, "flex-1")}
                  >
                    View job
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => remove(job._id)}
                  className={secondaryButton}
                  aria-label={`Remove ${job.title} from saved jobs`}
                >
                  <Trash2 className="size-3.5" />
                  Remove
                </button>
              </div>
            </DashboardCard>
          ))}
        </div>
      ) : (
        <DashboardCard>
          <EmptyState
            title="No saved jobs here"
            description="Save roles you are interested in and they will show up here for easy access."
            action={
              <Link href="/dashboard/seeker/jobs" className={primaryButton}>
                Browse jobs
              </Link>
            }
          />
        </DashboardCard>
      )}

      <div className="flex items-center justify-between gap-3 text-[11px] text-[#6e6e78]">
        <span>
          Showing {visible.length} of {savedEntries.length} saved bookmarks
        </span>
      </div>
    </div>
  )
}

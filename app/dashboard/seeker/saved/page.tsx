"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Bookmark,
  Building2,
  CalendarClock,
  CheckCircle2,
  DollarSign,
  MapPin,
  Search,
  Trash2,
} from "lucide-react"
import { savedJobs, type SavedJob } from "@/app/lib/dashboard-data"
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

const categories = ["All Saved", "Design", "Engineering", "Product"]

export default function SeekerSavedJobsPage() {
  const [jobs, setJobs] = useState<SavedJob[]>(savedJobs)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All Saved")
  const [sort, setSort] = useState<"recent" | "oldest">("recent")
  const [applied, setApplied] = useState<string[]>([])

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    const list = jobs.filter((job) => {
      const matchesCategory =
        category === "All Saved" || job.category === category
      const matchesQuery =
        !term ||
        job.title.toLowerCase().includes(term) ||
        job.company.toLowerCase().includes(term) ||
        job.location.toLowerCase().includes(term)

      return matchesCategory && matchesQuery
    })

    return sort === "oldest" ? [...list].reverse() : list
  }, [jobs, query, category, sort])

  const remove = (id: string) => {
    setJobs((current) => current.filter((job) => job.id !== id))
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
        <StatCard label="Total Saved" value="24" icon={Bookmark} accent="violet" />
        <StatCard
          label="Closing Soon"
          value="3"
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
                {item}
                {item !== "All Saved"
                  ? ` (${jobs.filter((job) => job.category === item).length})`
                  : ` (${jobs.length})`}
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
              <option value="recent">Recently Saved</option>
              <option value="oldest">Oldest Saved</option>
            </select>
          </div>
        </div>
      </DashboardCard>

      {visible.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {visible.map((job) => {
            const hasApplied = applied.includes(job.id)

            return (
              <DashboardCard
                key={job.id}
                className={cn("flex flex-col p-5", job.closed && "opacity-70")}
              >
                <div className="flex items-start gap-3">
                  <Avatar name={job.company} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold tracking-[0.12em] text-[#6e6e78] uppercase">
                          {job.company}
                        </p>
                        <h2 className="mt-0.5 truncate text-base font-semibold text-[#ededef]">
                          {job.title}
                        </h2>
                      </div>
                      {job.closing ? (
                        <span
                          className={cn(
                            "shrink-0 rounded-full border px-2 py-0.5 text-[10px]",
                            job.closed
                              ? "border-white/10 bg-white/[0.06] text-[#a0a0ab]"
                              : "border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#fcd34d]"
                          )}
                        >
                          {job.closing}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-[#7c7c86]">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3" /> {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <DollarSign className="size-3" /> {job.salary}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="size-3" /> {job.category}
                  </span>
                </div>

                <p className="mt-3 text-[11px] text-[#6e6e78]">{job.savedAt}</p>

                <div className="mt-auto flex items-center gap-2 pt-5">
                  {job.closed ? (
                    <button
                      type="button"
                      disabled
                      className={cn(primaryButton, "flex-1")}
                    >
                      Position closed
                    </button>
                  ) : job.draft ? (
                    <Link
                      href="/dashboard/seeker/jobs"
                      className={cn(primaryButton, "flex-1")}
                    >
                      <CheckCircle2 className="size-3.5" />
                      Continue application
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setApplied((current) =>
                          current.includes(job.id)
                            ? current
                            : [...current, job.id]
                        )
                      }
                      className={cn(primaryButton, "flex-1")}
                    >
                      {hasApplied ? (
                        <>
                          <CheckCircle2 className="size-3.5" />
                          Applied
                        </>
                      ) : (
                        "Apply now"
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => remove(job.id)}
                    className={secondaryButton}
                    aria-label={`Remove ${job.title} from saved jobs`}
                  >
                    <Trash2 className="size-3.5" />
                    Remove
                  </button>
                </div>
              </DashboardCard>
            )
          })}
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
          Showing {visible.length} of 24 bookmarks · 2 drafts saved
        </span>
        <button type="button" className={secondaryButton}>
          Load more
        </button>
      </div>
    </div>
  )
}

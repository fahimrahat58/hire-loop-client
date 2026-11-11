"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Bookmark,
  BookmarkCheck,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  DollarSign,
  Loader2,
  MapPin,
  Search,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { useJobs } from "@/hooks/use-jobs"
import { useSavedJobs } from "@/hooks/use-saved-jobs"
import { useSeekerApplications } from "@/hooks/use-seeker-applications"
import {
  getJobCategory,
  getJobDate,
  getJobStatus,
  getJobType,
  parseSalaryMin,
  type ApiJob,
} from "@/app/lib/jobs-api"
import {
  applyToJob,
  getApplicationsErrorMessage,
} from "@/app/lib/applications-api"
import { getSavedJobsErrorMessage } from "@/app/lib/saved-jobs"
import {
  Avatar,
  DashboardCard,
  EmptyState,
  PageHeader,
  StatusBadge,
  inputClass,
  primaryButton,
  secondaryButton,
} from "@/components/dashboard/ui"
import { cn } from "@/lib/utils"

const types = [
  "All",
  "Full-time",
  "Part-time",
  "Contract",
  "Remote",
  "Internship",
]

const salaryBands = [
  { label: "Any salary", value: 0 },
  { label: "$100k+", value: 100 },
  { label: "$150k+", value: 150 },
  { label: "$180k+", value: 180 },
]

export default function SeekerJobsPage() {
  const {
    jobs: allJobs,
    loading,
    error,
    reload,
    session,
    isPending: sessionPending,
  } = useJobs()

  const {
    savedJobs,
    savedIds,
    save,
    remove,
    pendingIds: pendingSavedIds,
    loading: savedLoading,
  } = useSavedJobs()

  const {
    appliedSet,
    loading: applicationsLoading,
    reload: reloadApplications,
  } = useSeekerApplications(allJobs)

  const [query, setQuery] = useState("")
  const [type, setType] = useState("All")
  const [category, setCategory] = useState("All Categories")
  const [location, setLocation] = useState("All Locations")
  const [salary, setSalary] = useState(0)
  const [activeJob, setActiveJob] = useState<ApiJob | null>(null)
  const [coverLetter, setCoverLetter] = useState("")
  const [applying, setApplying] = useState(false)

  const categories = useMemo(
    () => ["All Categories", ...new Set(allJobs.map(getJobCategory))],
    [allJobs]
  )

  const locations = useMemo(
    () => [
      "All Locations",
      ...new Set(allJobs.map((job) => job.location).filter(Boolean)),
    ],
    [allJobs]
  )

  const jobs = useMemo(() => {
    const term = query.trim().toLowerCase()

    return allJobs.filter((job) => {
      const skills = Array.isArray(job.skills) ? job.skills : []

      return (
        getJobStatus(job) === "Active" &&
        (type === "All" || getJobType(job) === type) &&
        (category === "All Categories" || getJobCategory(job) === category) &&
        (location === "All Locations" || job.location === location) &&
        parseSalaryMin(job.salary) >= salary &&
        (!term ||
          job.title.toLowerCase().includes(term) ||
          job.company.toLowerCase().includes(term) ||
          job.location.toLowerCase().includes(term) ||
          skills.some((skill) => skill.toLowerCase().includes(term)))
      )
    })
  }, [allJobs, query, type, category, location, salary])

  const resetFilters = () => {
    setQuery("")
    setType("All")
    setCategory("All Categories")
    setLocation("All Locations")
    setSalary(0)
  }

  if (sessionPending) {
    return (
      <div className="grid gap-4 xl:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-64 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.04]"
          />
        ))}
      </div>
    )
  }

  if (!session?.user) {
    return (
      <DashboardCard>
        <EmptyState
          title="Sign in to browse jobs"
          description="Sign in with a job seeker account to save roles and submit applications."
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
          title="Job browsing is for job seekers"
          description="Switch to a job seeker account to browse and apply for jobs."
          action={
            <Link href="/dashboard" className={primaryButton}>
              Go to dashboard
            </Link>
          }
        />
      </DashboardCard>
    )
  }

  const toggleSaved = async (id: string) => {
    const currentlySaved = savedIds.has(id)

    try {
      if (currentlySaved) {
        await remove(id)
        toast.success("Job removed from saved jobs")
      } else {
        await save(id)
        toast.success("Job saved successfully")
      }
    } catch (saveError) {
      toast.error(getSavedJobsErrorMessage(saveError))
    }
  }

  const confirmApply = async () => {
    if (!activeJob || applying) return

    if (!session?.user?.email || !session.user.name) {
      toast.error("Please complete your profile before applying.")
      return
    }

    setApplying(true)

    try {
      await applyToJob({
        jobId: activeJob._id,
        name: session.user.name,
        email: session.user.email,
        coverLetter,
      })

      toast.success("Application submitted successfully")
      setActiveJob(null)
      setCoverLetter("")
      await reloadApplications({ silent: true })
    } catch (applyError) {
      toast.error(getApplicationsErrorMessage(applyError))
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Browse Jobs"
        description="Search live opportunities, save the ones you like, and apply in a couple of clicks."
        actions={
          <span className={secondaryButton}>
            {savedLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Bookmark className="size-3.5" />
            )}
            {savedJobs.length} saved
          </span>
        }
      />

      <DashboardCard className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#6e6e78]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, company, location, or skill..."
              className={cn(inputClass, "pl-9")}
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {types.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setType(item)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[11px] font-medium transition",
                  type === item
                    ? "border-[#8f88ff]/50 bg-[#5c53fe]/15 text-[#c7c2ff]"
                    : "border-white/10 bg-[#1a1a1f] text-[#a0a0ab] hover:border-white/20 hover:text-white"
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
            className="rounded-lg border border-white/10 bg-[#0f0f13] px-2.5 py-1.5 text-[11px] text-[#d4d4d8] outline-none focus:border-[#5c53fe]"
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            aria-label="Filter by location"
            className="rounded-lg border border-white/10 bg-[#0f0f13] px-2.5 py-1.5 text-[11px] text-[#d4d4d8] outline-none focus:border-[#5c53fe]"
          >
            {locations.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <select
            value={salary}
            onChange={(e) => setSalary(Number(e.target.value))}
            aria-label="Filter by minimum salary"
            className="rounded-lg border border-white/10 bg-[#0f0f13] px-2.5 py-1.5 text-[11px] text-[#d4d4d8] outline-none focus:border-[#5c53fe]"
          >
            {salaryBands.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <span className="text-[11px] text-[#6e6e78] sm:ml-auto">
            {jobs.length} {jobs.length === 1 ? "role" : "roles"} found
          </span>

          <button
            type="button"
            onClick={resetFilters}
            className="text-[11px] font-medium text-[#b8b2ff] transition hover:text-white"
          >
            Reset filters
          </button>
        </div>
      </DashboardCard>

      {loading ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-64 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.04]"
            />
          ))}
        </div>
      ) : error ? (
        <DashboardCard>
          <EmptyState
            title="Unable to load jobs"
            description={error}
            action={
              <button onClick={() => void reload()} className={primaryButton}>
                Try again
              </button>
            }
          />
        </DashboardCard>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {jobs.map((job) => {
            const isSaved = savedIds.has(job._id)
            const savedPending = pendingSavedIds.includes(job._id)
            const hasApplied = appliedSet.has(job._id)
            const skills = Array.isArray(job.skills) ? job.skills : []

            return (
              <DashboardCard key={job._id} className="flex flex-col p-5">
                <div className="flex items-start gap-3">
                  <Avatar name={job.company} size="lg" />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="text-base font-semibold text-[#ededef]">
                          {job.title}
                        </h2>
                        <p className="text-xs text-[#a0a0ab]">
                          {job.company} · posted {getJobDate(job)}
                        </p>
                      </div>

                      <StatusBadge status={getJobType(job)} />
                    </div>
                  </div>
                </div>

                <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed whitespace-pre-line text-[#8b8b96]">
                  {job.description}
                </p>

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
                    <CalendarClock className="size-3" />
                    {getJobCategory(job)}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md border border-white/[0.07] bg-[#1a1a1f] px-2 py-0.5 text-[10px] text-[#a0a0ab]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex items-center gap-2 pt-5">
                  <button
                    type="button"
                    onClick={() => void toggleSaved(job._id)}
                    disabled={savedPending}
                    className={cn(
                      secondaryButton,
                      isSaved && "border-[#8f88ff]/40 text-[#b8b2ff]"
                    )}
                    aria-pressed={isSaved}
                  >
                    {savedPending ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : isSaved ? (
                      <BookmarkCheck className="size-3.5" />
                    ) : (
                      <Bookmark className="size-3.5" />
                    )}
                    {savedPending ? "Saving..." : isSaved ? "Saved" : "Save"}
                  </button>

                  <Link
                    href={`/dashboard/jobs/${job._id}`}
                    className={cn(secondaryButton, "flex-1")}
                  >
                    View details
                  </Link>

                  <button
                    type="button"
                    onClick={() => setActiveJob(job)}
                    disabled={hasApplied || applicationsLoading}
                    className={cn(primaryButton, "flex-1")}
                  >
                    {hasApplied ? (
                      <>
                        <CheckCircle2 className="size-3.5" />
                        Applied
                      </>
                    ) : (
                      <>
                        <BriefcaseBusiness className="size-3.5" />
                        Apply now
                      </>
                    )}
                  </button>
                </div>
              </DashboardCard>
            )
          })}
        </div>
      )}

      {!loading && !error && jobs.length === 0 ? (
        <DashboardCard>
          <EmptyState
            title="No jobs match your search"
            description="Try a different keyword or clear the filters to see every open role."
            action={
              <button
                type="button"
                onClick={resetFilters}
                className={primaryButton}
              >
                Clear filters
              </button>
            }
          />
        </DashboardCard>
      ) : null}

      {activeJob ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
          <div
            className="w-full max-w-lg rounded-xl border border-white/10 bg-[#141418] p-5 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="apply-dialog-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="apply-dialog-title"
                  className="text-lg font-semibold text-[#ededef]"
                >
                  Apply to {activeJob.title}
                </h2>
                <p className="mt-1 text-xs text-[#a0a0ab]">
                  {activeJob.company} · {activeJob.location}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveJob(null)}
                aria-label="Close application dialog"
                className="rounded-lg p-1.5 text-[#a0a0ab] transition hover:bg-white/[0.06] hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <label
              htmlFor="cover-letter"
              className="mt-5 mb-1.5 block text-xs font-medium text-[#a0a0ab]"
            >
              Cover letter (optional)
            </label>

            <textarea
              id="cover-letter"
              rows={5}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell the hiring team why you are a great fit..."
              className={cn(inputClass, "resize-none")}
            />

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveJob(null)}
                className={secondaryButton}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void confirmApply()}
                disabled={applying}
                className={primaryButton}
              >
                {applying ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-3.5" />
                )}
                {applying ? "Submitting..." : "Confirm application"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

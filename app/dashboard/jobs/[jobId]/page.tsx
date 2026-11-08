"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  DollarSign,
  MapPin,
} from "lucide-react"

import { authClient } from "@/app/lib/auth-client"
import {
  getJob,
  getJobCategory,
  getJobDate,
  getJobType,
  getJobsErrorMessage,
  type ApiJob,
} from "@/app/lib/jobs-api"

import {
  Avatar,
  DashboardCard,
  EmptyState,
  PageHeader,
  StatusBadge,
  secondaryButton,
  primaryButton,
} from "@/components/dashboard/ui"

export default function JobDetailsPage() {
  const params = useParams<{ jobId: string }>()
  const { data: session } = authClient.useSession()

  const [job, setJob] = useState<ApiJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!params.jobId) return

    const controller = new AbortController()

    setLoading(true)

    getJob(params.jobId, {
      user: session?.user
        ? {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
          }
        : null,
      signal: controller.signal,
    })
      .then(setJob)
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(getJobsErrorMessage(err, "Unable to load this job."))
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [params.jobId, session])

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 animate-pulse rounded bg-white/[0.06]" />
        <div className="h-64 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.04]" />
      </div>
    )
  }

  if (error || !job) {
    return (
      <DashboardCard>
        <EmptyState
          title="Job not found"
          description={
            error || "This job may have been removed or is no longer available."
          }
          action={
            <Link href="/dashboard/seeker/jobs" className={primaryButton}>
              Browse jobs
            </Link>
          }
        />
      </DashboardCard>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={
          <Link
            href="/dashboard/seeker/jobs"
            className="inline-flex items-center gap-1 text-xs text-[#a0a0ab] transition hover:text-white"
          >
            <ArrowLeft className="size-3.5" />
            Back to browse jobs
          </Link>
        }
        title={job.title}
        description={`${job.company} · ${getJobCategory(job)}`}
        actions={
          <StatusBadge status={job.closed ? "Closed" : getJobType(job)} />
        }
      />

      <DashboardCard className="p-5 sm:p-7">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar name={job.company} size="lg" />

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-[#ededef]">
              {job.company}
            </h2>

            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#a0a0ab]">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                {job.location}
              </span>

              <span className="inline-flex items-center gap-1">
                <DollarSign className="size-3.5" />
                {job.salary || "Salary not specified"}
              </span>

              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3.5" />
                Posted {getJobDate(job)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-7 border-t border-white/[0.06] pt-6">
          <h3 className="text-sm font-semibold text-[#ededef]">
            About this role
          </h3>

          <p className="mt-3 text-[13px] leading-7 whitespace-pre-line text-[#a0a0ab]">
            {job.description || "No description provided."}
          </p>
        </div>

        {Array.isArray(job.skills) && job.skills.length > 0 ? (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-[#ededef]">Skills</h3>

            <div className="mt-3 flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md border border-white/[0.07] bg-[#1a1a1f] px-2.5 py-1 text-xs text-[#a0a0ab]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-7 flex flex-wrap gap-2">
          <Link href="/dashboard/seeker/jobs" className={secondaryButton}>
            Back to jobs
          </Link>

          {job.closed ? (
            <span className={secondaryButton}>This position is closed</span>
          ) : (
            <Link href="/dashboard/seeker/jobs" className={primaryButton}>
              <BriefcaseBusiness className="size-3.5" />
              Apply for this job
            </Link>
          )}
        </div>
      </DashboardCard>
    </div>
  )
}

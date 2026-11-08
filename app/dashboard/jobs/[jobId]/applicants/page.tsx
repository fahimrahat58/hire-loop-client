"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Users } from "lucide-react"

import { authClient } from "@/app/lib/auth-client"
import {
  getJob,
  getJobStatus,
  getJobsErrorMessage,
  type ApiJob,
} from "@/app/lib/jobs-api"

import {
  PageHeader,
  StatCard,
  StatusBadge,
  EmptyState,
  DashboardCard,
  primaryButton,
} from "@/components/dashboard/ui"

import { ApplicantsTable } from "@/components/dashboard/applicants-table"

export default function JobApplicantsPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const { data: session } = authClient.useSession()

  const [job, setJob] = useState<ApiJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    getJob(jobId, {
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
          setError(getJobsErrorMessage(err))
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [jobId, session])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 animate-pulse rounded bg-white/[0.06]" />
        <div className="h-32 animate-pulse rounded-xl bg-white/[0.04]" />
      </div>
    )
  }

  if (error || !job) {
    return (
      <DashboardCard>
        <EmptyState
          title="Job not found"
          description={error || "This job could not be found."}
          action={
            <Link href="/dashboard/recruiter/jobs" className={primaryButton}>
              Back to manage jobs
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
            href="/dashboard/recruiter/jobs"
            className="inline-flex items-center gap-1 text-xs text-[#a0a0ab] transition hover:text-white"
          >
            <ArrowLeft className="size-3.5" />
            Back to manage jobs
          </Link>
        }
        title={`Applicants · ${job.title}`}
        description="Review every candidate who applied to this role and move them through the pipeline."
        actions={<StatusBadge status={getJobStatus(job)} />}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total applicants"
          value={String(job.applicants ?? 0)}
          hint="Across this job post"
          icon={Users}
          accent="violet"
        />

        <StatCard
          label="In review"
          value="—"
          hint="Applicant data is not included in the Jobs API"
          icon={Users}
          accent="amber"
        />

        <StatCard
          label="Shortlisted"
          value="—"
          hint="Applicant data is not included in the Jobs API"
          icon={Users}
          accent="green"
        />
      </div>

      <ApplicantsTable />

      <Link
        href="/dashboard/recruiter/applications"
        className="text-sm text-[#b8b2ff] hover:text-white"
      >
        View all applications
      </Link>
    </div>
  )
}

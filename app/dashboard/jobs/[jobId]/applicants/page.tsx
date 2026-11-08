import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Users } from "lucide-react"
import { recruiterJobs } from "@/app/lib/dashboard-data"
import {
  PageHeader,
  StatCard,
  StatusBadge,
  secondaryButton,
} from "@/components/dashboard/ui"
import { ApplicantsTable } from "@/components/dashboard/applicants-table"

export default async function JobApplicantsPage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  const { jobId } = await params
  const job = recruiterJobs.find((item) => item.id === jobId) ?? recruiterJobs[0]

  if (!job) notFound()

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
        actions={<StatusBadge status={job.status} />}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total applicants"
          value={String(job.applicants)}
          hint="Across this job post"
          icon={Users}
          accent="violet"
        />
        <StatCard
          label="In review"
          value="18"
          hint="Awaiting your decision"
          icon={Users}
          accent="amber"
        />
        <StatCard
          label="Shortlisted"
          value="7"
          hint="Ready for interview"
          icon={Users}
          accent="green"
        />
      </div>

      <ApplicantsTable />

      <Link href="/dashboard/recruiter/applications" className={secondaryButton}>
        View all applications
      </Link>
    </div>
  )
}

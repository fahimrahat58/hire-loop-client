"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  BriefcaseBusiness,
  CheckCircle2,
  Plus,
  Users,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react"

import { authClient } from "@/app/lib/auth-client"

import {
  Avatar,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  TableShell,
  Td,
  Th,
  primaryButton,
} from "@/components/dashboard/ui"

import { useJobs } from "@/hooks/use-jobs"
import { filterManageableJobs } from "@/app/lib/job-ownership"
import { getJobStatus } from "@/app/lib/jobs-api"

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

const API_URL = process.env.NEXT_PUBLIC_API_URL

const statIcons = [BriefcaseBusiness, Users, CheckCircle2, XCircle]

const statAccents = ["violet", "blue", "amber", "green"] as const

export default function RecruiterDashboardPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession()

  const recruiterEmail = session?.user?.email
  const recruiterName = session?.user?.name || "Recruiter"

  const { jobs, loading: jobsLoading, error: jobsError, user } = useJobs()

  const [applications, setApplications] = useState<Application[]>([])
  const [applicationsLoading, setApplicationsLoading] = useState(true)
  const [applicationsError, setApplicationsError] = useState("")

  // Recruiter's own jobs
  const ownJobs = filterManageableJobs(jobs, user)

  const activeJobs = ownJobs.filter(
    (job) => getJobStatus(job) === "Active"
  ).length

  // Fetch real applications from MongoDB
  const fetchApplications = useCallback(async () => {
    if (!recruiterEmail || !API_URL) {
      setApplicationsLoading(false)
      return
    }

    try {
      setApplicationsLoading(true)
      setApplicationsError("")

      const response = await fetch(`${API_URL}/api/applications/recruiter`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": recruiterEmail,
        },
        cache: "no-store",
      })

      const result = await response.json()

      console.log("RECRUITER DASHBOARD APPLICATIONS:", result)

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load applications")
      }

      setApplications(Array.isArray(result.data) ? result.data : [])
    } catch (error) {
      console.error("RECRUITER APPLICATIONS ERROR:", error)

      setApplicationsError(
        error instanceof Error ? error.message : "Something went wrong"
      )
    } finally {
      setApplicationsLoading(false)
    }
  }, [recruiterEmail])

  useEffect(() => {
    if (sessionLoading) return

    if (!recruiterEmail) {
      setApplications([])
      setApplicationsLoading(false)
      setApplicationsError("Please sign in to view applications.")
      return
    }

    fetchApplications()
  }, [sessionLoading, recruiterEmail, fetchApplications])

  // Dynamic statistics
  const underReview = applications.filter(
    (application) => application.status === "Under Review"
  ).length

  const offersSent = applications.filter(
    (application) => application.status === "Offered"
  ).length

  const stats = [
    {
      label: "Active Jobs",
      value: jobsLoading ? "…" : String(activeJobs),
      hint: "Your active job listings",
    },
    {
      label: "Total Applicants",
      value: applicationsLoading ? "…" : String(applications.length),
      hint: "Applications received",
    },
    {
      label: "Under Review",
      value: applicationsLoading ? "…" : String(underReview),
      hint: "Candidates being reviewed",
    },
    {
      label: "Offers Sent",
      value: applicationsLoading ? "…" : String(offersSent),
      hint: "Offers sent to candidates",
    },
  ]

  // Latest 5 applications
  const recentApplications = useMemo(() => {
    return [...applications]
      .sort(
        (a, b) => new Date(b.applied).getTime() - new Date(a.applied).getTime()
      )
      .slice(0, 5)
  }, [applications])

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

  const pageLoading = sessionLoading || applicationsLoading

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${recruiterName}`}
        description={
          jobsError
            ? "Your hiring overview is available, but job totals could not be loaded."
            : `Here is your hiring overview. You have ${
                jobsLoading ? "…" : activeJobs
              } active roles.`
        }
        actions={
          <Link href="/dashboard/recruiter/jobs/new" className={primaryButton}>
            <Plus className="size-4" />
            Create Job Post
          </Link>
        }
      />

      {/* DYNAMIC STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = statIcons[index]

          return (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              hint={stat.hint}
              icon={Icon}
              accent={statAccents[index]}
            />
          )
        })}
      </div>

      {/* RECENT APPLICATIONS */}

      <SectionCard
        title="Recent applications"
        description="Latest applications received for your job posts"
        action={
          <Link
            href="/dashboard/recruiter/applications"
            className="text-xs font-medium text-[#b8b2ff] transition hover:text-white"
          >
            View all
          </Link>
        }
      >
        {pageLoading ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3">
            <Loader2 className="size-7 animate-spin text-[#8f88ff]" />
            <p className="text-xs text-[#a0a0ab]">
              Loading recent applications...
            </p>
          </div>
        ) : applicationsError ? (
          <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-5 text-center">
            <p className="text-sm text-red-400">{applicationsError}</p>

            <button
              type="button"
              onClick={fetchApplications}
              className="flex items-center gap-2 text-xs font-medium text-[#c7c2ff]"
            >
              <RefreshCw className="size-3.5" />
              Try again
            </button>
          </div>
        ) : recentApplications.length > 0 ? (
          <TableShell>
            <thead>
              <tr>
                <Th>Candidate name</Th>
                <Th>Role</Th>
                <Th>Date applied</Th>
                <Th>Experience</Th>
                <Th>Status</Th>
              </tr>
            </thead>

            <tbody>
              {recentApplications.map((candidate) => (
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

                  <Td>{candidate.experience || "N/A"}</Td>

                  <Td>
                    <StatusBadge status={candidate.status} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        ) : (
          <div className="flex min-h-48 flex-col items-center justify-center gap-2 p-5 text-center">
            <Users className="size-8 text-[#777783]" />

            <p className="text-sm font-medium text-[#ededef]">
              No applications yet
            </p>

            <p className="max-w-sm text-xs text-[#777783]">
              When candidates apply for your job posts, their information will
              appear here.
            </p>
          </div>
        )}
      </SectionCard>

      {/* CREATE JOB BUTTON */}

      <Link
        href="/dashboard/recruiter/jobs/new"
        aria-label="Create job post"
        className="fixed right-5 bottom-5 z-20 flex items-center gap-2 rounded-full bg-[#5c53fe] py-3 pr-5 pl-4 text-sm font-semibold text-white shadow-xl shadow-[#5c53fe]/30 transition hover:bg-[#4d44f0] lg:right-8 lg:bottom-8"
      >
        <Plus className="size-4" />
        <span className="hidden sm:inline">Create Job Post</span>
      </Link>
    </div>
  )
}

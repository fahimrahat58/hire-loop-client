"use client"

import Link from "next/link"
import {
  Building2,
  BriefcaseBusiness,
  CalendarDays,
  CreditCard,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react"

import {
  DashboardCard,
  EmptyState,
  PageHeader,
  SectionCard,
  StatCard,
  secondaryButton,
} from "@/components/dashboard/ui"

import { JobsByCategoryChart } from "@/components/dashboard/charts"

import { PrintButton } from "@/components/dashboard/print-button"
import { useJobs } from "@/hooks/use-jobs"
import { getJobCategory, getJobStatus } from "@/app/lib/jobs-api"

export default function AdminDashboardPage() {
  const { jobs, loading, error } = useJobs()

  const activeJobs = jobs.filter((job) => getJobStatus(job) === "Active").length

  const categoryCounts: Record<string, number> = jobs.reduce(
    (counts, job) => {
      const category = getJobCategory(job)

      counts[category] = (counts[category] ?? 0) + 1

      return counts
    },
    {} as Record<string, number>
  )

  const jobsByCategory = Object.entries(categoryCounts).map(
    ([category, count]) => ({
      category,
      jobs: count,
    })
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Overview"
        description="Platform overview based on available backend data. Metrics without a backend API are shown as unavailable."
        actions={
          <>
            <span className={secondaryButton}>
              <CalendarDays className="size-3.5" />
              Live data
            </span>

            <PrintButton label="Export report" />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Active Jobs"
          value={loading ? "…" : String(activeJobs)}
          hint={
            error
              ? "Unable to load live job totals"
              : "Live count from the Jobs API"
          }
          icon={BriefcaseBusiness}
          accent="green"
        />

        <DashboardCard className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#8b8b96]">
                Total Users
              </p>
              <p className="mt-2 text-sm font-medium text-[#ededef]">
                Unavailable
              </p>
              <p className="mt-1 text-xs text-[#6e6e78]">
                No admin overview metrics API is available for platform user
                totals or growth.
              </p>
            </div>
            <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-2 text-[#a0a0ab]">
              <Users className="size-4" />
            </span>
          </div>
        </DashboardCard>

        <DashboardCard className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#8b8b96]">
                Monthly Revenue
              </p>
              <p className="mt-2 text-sm font-medium text-[#ededef]">
                Unavailable
              </p>
              <p className="mt-1 text-xs text-[#6e6e78]">
                No admin payments or revenue reporting API is available.
              </p>
            </div>
            <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-2 text-[#a0a0ab]">
              <DollarSign className="size-4" />
            </span>
          </div>
        </DashboardCard>

        <DashboardCard className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#8b8b96]">
                Companies
              </p>
              <p className="mt-2 text-sm font-medium text-[#ededef]">
                Unavailable
              </p>
              <p className="mt-1 text-xs text-[#6e6e78]">
                No company management or company metrics API is available.
              </p>
            </div>
            <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-2 text-[#a0a0ab]">
              <Building2 className="size-4" />
            </span>
          </div>
        </DashboardCard>

        <DashboardCard className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#8b8b96]">
                Recruiter Growth
              </p>
              <p className="mt-2 text-sm font-medium text-[#ededef]">
                Unavailable
              </p>
              <p className="mt-1 text-xs text-[#6e6e78]">
                Growth analytics are not available from an existing backend API.
              </p>
            </div>
            <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-2 text-[#a0a0ab]">
              <TrendingUp className="size-4" />
            </span>
          </div>
        </DashboardCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Job posts by category"
          description={
            error
              ? "Unable to load live job distribution"
              : "Distribution from the Jobs API"
          }
          bodyClassName="p-4"
        >
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-10 animate-pulse rounded-lg bg-white/[0.06]"
                />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              title="Unable to load jobs"
              description="The Jobs API could not be reached to build the category distribution."
            />
          ) : jobsByCategory.length > 0 ? (
            <JobsByCategoryChart data={jobsByCategory} />
          ) : (
            <EmptyState
              title="No jobs available"
              description="There are no job listings to summarize by category yet."
            />
          )}
        </SectionCard>

        <SectionCard
          title="New user registrations"
          description="Daily signups require a backend analytics API."
          bodyClassName="p-4"
        >
          <EmptyState
            title="Registration analytics unavailable"
            description="The backend does not expose an admin registration analytics API, so no signup chart can be shown."
          />
        </SectionCard>
      </div>

      <SectionCard
        title="Recent subscription transactions"
        action={
          <Link
            href="/dashboard/admin/payments"
            className="text-xs font-medium text-[#b8b2ff] transition hover:text-white"
          >
            View payments page
          </Link>
        }
      >
        <div className="p-4">
          <EmptyState
            title="Transaction data unavailable"
            description="The backend does not expose an admin transactions API, so recent subscription transactions cannot be displayed."
            action={
              <Link
                href="/dashboard/admin/payments"
                className={secondaryButton}
              >
                <CreditCard className="size-3.5" />
                Open payments
              </Link>
            }
          />
        </div>
      </SectionCard>
    </div>
  )
}

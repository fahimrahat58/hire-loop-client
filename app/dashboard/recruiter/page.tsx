import Link from "next/link"
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Globe,
  MapPin,
  Pencil,
  Plus,
  Users,
  UsersRound,
  XCircle,
} from "lucide-react"
import {
  recruiterApplicants,
  recruiterApplicantsPerJob,
  recruiterCompany,
  recruiterStats,
} from "@/app/lib/dashboard-data"
import {
  Avatar,
  DashboardCard,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  TableShell,
  Td,
  Th,
  primaryButton,
  secondaryButton,
} from "@/components/dashboard/ui"
import { ApplicantsBarChart } from "@/components/dashboard/charts"

const statIcons = [BriefcaseBusiness, Users, CheckCircle2, XCircle]
const statAccents = ["violet", "blue", "green", "red"] as const

export default function RecruiterDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Welcome back, Alex Sterling"
        description="Here is how your hiring pipeline is performing. You have 18 active roles and 112 new applicants this week."
        actions={
          <Link href="/dashboard/recruiter/jobs/new" className={primaryButton}>
            <Plus className="size-4" />
            Create Job Post
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {recruiterStats.map((stat, index) => {
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

      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardCard className="flex flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar name={recruiterCompany.name} size="lg" />
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold text-[#ededef]">
                  {recruiterCompany.name}
                </h2>
                <p className="text-xs text-[#a0a0ab]">
                  {recruiterCompany.industry}
                </p>
              </div>
            </div>
            <StatusBadge status={recruiterCompany.status} />
          </div>

          <dl className="mt-5 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-[#a0a0ab]">
              <MapPin className="size-3.5 text-[#6e6e78]" />
              {recruiterCompany.location}
            </div>
            <div className="flex items-center gap-2 text-[#a0a0ab]">
              <UsersRound className="size-3.5 text-[#6e6e78]" />
              {recruiterCompany.employees}
            </div>
            <div className="flex items-center gap-2 text-[#a0a0ab]">
              <Globe className="size-3.5 text-[#6e6e78]" />
              techflow.io
            </div>
            <div className="flex items-center gap-2 text-[#a0a0ab]">
              <Building2 className="size-3.5 text-[#6e6e78]" />
              Founded {recruiterCompany.founded}
            </div>
          </dl>

          <p className="mt-4 line-clamp-3 text-[11px] leading-relaxed text-[#7c7c86]">
            {recruiterCompany.description}
          </p>

          <div className="mt-auto flex gap-2 pt-5">
            <Link
              href="/dashboard/recruiter/company"
              className={`${secondaryButton} flex-1`}
            >
              <Pencil className="size-3.5" />
              Edit company
            </Link>
            <Link
              href="/dashboard/recruiter/company"
              aria-label="View company profile"
              className={secondaryButton}
            >
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </DashboardCard>

        <SectionCard
          title="Applicants per job"
          description="Last 30 days across all active job posts"
          className="lg:col-span-2"
          bodyClassName="p-4"
        >
          <ApplicantsBarChart data={recruiterApplicantsPerJob} />
        </SectionCard>
      </div>

      <SectionCard
        title="Recent applications"
        action={
          <Link
            href="/dashboard/recruiter/applications"
            className="text-xs font-medium text-[#b8b2ff] transition hover:text-white"
          >
            View all
          </Link>
        }
      >
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
            {recruiterApplicants.map((candidate) => (
              <tr key={candidate.id} className="hover:bg-white/[0.02]">
                <Td>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={candidate.name} size="sm" />
                    <span className="font-medium text-[#ededef]">
                      {candidate.name}
                    </span>
                  </div>
                </Td>
                <Td>{candidate.role}</Td>
                <Td>{candidate.applied}</Td>
                <Td>{candidate.experience}</Td>
                <Td>
                  <StatusBadge status={candidate.status} />
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </SectionCard>

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

/**
 * Non-job dashboard fixtures.
 *
 * Job records are intentionally NOT kept here. Every job list/detail in the
 * dashboard is loaded from the Jobs API through `@/app/lib/jobs-api`, so this
 * module only contains the supporting demo data for areas that do not have a
 * backend endpoint yet (applications, billing, users, companies, payments...).
 */

import type { DashboardRole } from "./roles"

export type Role = DashboardRole

export type ApplicationStatus =
  | "Applied"
  | "Under Review"
  | "Shortlisted"
  | "Offered"
  | "Rejected"

export type CompanyStatus = "Pending" | "Approved" | "Rejected"

export type BillingRecord = {
  date: string
  plan: string
  amount: string
  transaction: string
  status: "Paid" | "Refunded" | "Failed" | "Pending"
}

export type DashboardStat = {
  label: string
  value: string
  hint?: string
}

export type ActivityItem = {
  id: string
  title: string
  time: string
  tone: "info" | "accent" | "success"
}

export type SeekerApplication = {
  id: string
  title: string
  company: string
  type: string
  applied: string
  status: ApplicationStatus
}

export type RecruiterApplicant = {
  id: string
  name: string
  role: string
  applied: string
  experience: string
  status: ApplicationStatus
}

export type AdminCompany = {
  id: string
  name: string
  recruiterEmail: string
  industry: string
  status: CompanyStatus
  submitted: string
}

export type AdminPayment = {
  id: string
  email: string
  plan: string
  amount: string
  date: string
  relative: string
  status: "Success" | "Pending" | "Failed"
}

export type AdminTransaction = {
  id: string
  user: string
  company: string
  plan: string
  amount: string
  date: string
  status: "Success" | "Pending" | "Failed" | "Refunded"
}

/* --------------------------------- role meta ------------------------------- */

export const roleMeta: Record<
  Role,
  {
    label: string
    subtitle: string
    search: string
  }
> = {
  seeker: {
    label: "Job Seeker",
    subtitle: "Job Seeker Workspace",
    search: "Search jobs, companies, or skills...",
  },
  recruiter: {
    label: "Recruiter",
    subtitle: "Recruiter Workspace",
    search: "Search jobs, candidates, or companies...",
  },
  admin: {
    label: "Administrator",
    subtitle: "Admin Console",
    search: "Search users, companies, or jobs...",
  },
}

/* -------------------------------- recruiter -------------------------------- */

export const recruiterCompany = {
  name: "TechFlow Inc.",
  industry: "Software Development",
  website: "techflow.io",
  location: "San Francisco, CA",
  employees: "201 - 500 employees",
  founded: "2016",
  status: "Approved" as CompanyStatus,
  description:
    "TechFlow builds workflow automation tools that help product teams ship faster. We are a remote-first company with teammates across North America and Europe.",
}

export const recruiterStats: DashboardStat[] = [
  { label: "Active Jobs", value: "18", hint: "3 posted this week" },
  { label: "New Applicants", value: "112", hint: "Needs first review" },
  { label: "Shortlisted", value: "24", hint: "8 scheduled today" },
  { label: "Rejected", value: "18", hint: "Moved out of pipeline" },
]

export const recruiterApplicants: RecruiterApplicant[] = [
  {
    id: "candidate-1",
    name: "Jamie Chen",
    role: "Senior Product Designer",
    applied: "Oct 24, 2026",
    experience: "7 years",
    status: "Shortlisted",
  },
  {
    id: "candidate-2",
    name: "Priya Patel",
    role: "Frontend Engineer",
    applied: "Oct 23, 2026",
    experience: "5 years",
    status: "Under Review",
  },
  {
    id: "candidate-3",
    name: "Marcus Johnson",
    role: "Product Manager",
    applied: "Oct 22, 2026",
    experience: "9 years",
    status: "Offered",
  },
  {
    id: "candidate-4",
    name: "Sofia Reyes",
    role: "UX Researcher",
    applied: "Oct 21, 2026",
    experience: "4 years",
    status: "Applied",
  },
  {
    id: "candidate-5",
    name: "Daniel Kim",
    role: "Backend Engineer",
    applied: "Oct 19, 2026",
    experience: "6 years",
    status: "Rejected",
  },
  {
    id: "candidate-6",
    name: "Amara Okafor",
    role: "Design Systems Lead",
    applied: "Oct 18, 2026",
    experience: "8 years",
    status: "Shortlisted",
  },
]

export const recruiterApplicantsPerJob: { job: string; applicants: number }[] = [
  { job: "Product Designer", applicants: 42 },
  { job: "Frontend Engineer", applicants: 36 },
  { job: "Product Manager", applicants: 24 },
  { job: "UX Researcher", applicants: 18 },
]

/* ---------------------------------- admin ---------------------------------- */

/**
 * Admin overview, company, and payment reporting APIs are not available in the
 * current backend. The admin dashboard shows unavailable states for those areas
 * and only renders live data where a real API exists (for example, jobs).
 */

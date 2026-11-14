/**
 * Non-job dashboard fixtures.
 *
 * Job records are intentionally NOT kept here. Every job list/detail in the
 * dashboard is loaded from the Jobs API through `@/app/lib/jobs-api`, so this
 * module only contains the supporting demo data for areas that do not have a
 * backend endpoint yet (applications, billing, users, companies, payments...).
 */

export type Role = "seeker" | "recruiter" | "admin"

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

export const adminStats: {
  label: string
  value: string
  trend: string
  tone: "up" | "down" | "neutral"
}[] = [
  { label: "Total Users", value: "12,842", trend: "+12.4%", tone: "up" },
  { label: "Recruiter Growth", value: "843", trend: "+8.2%", tone: "up" },
  { label: "Companies", value: "4,281", trend: "+24.0%", tone: "up" },
  { label: "Active Jobs", value: "1,284", trend: "+3.1%", tone: "up" },
  { label: "Monthly Revenue", value: "$1.28M", trend: "+12.4%", tone: "up" },
]

export const adminJobsByCategory: { category: string; jobs: number }[] = [
  { category: "Development", jobs: 420 },
  { category: "Design", jobs: 280 },
  { category: "Product", jobs: 190 },
  { category: "Marketing", jobs: 160 },
  { category: "Data", jobs: 140 },
]

export const adminRegistrations: { day: string; users: number }[] = [
  { day: "Sep 28", users: 42 },
  { day: "Sep 30", users: 58 },
  { day: "Oct 02", users: 51 },
  { day: "Oct 04", users: 74 },
  { day: "Oct 06", users: 66 },
  { day: "Oct 08", users: 88 },
  { day: "Oct 10", users: 71 },
  { day: "Oct 12", users: 95 },
  { day: "Oct 14", users: 84 },
  { day: "Oct 16", users: 103 },
  { day: "Oct 18", users: 92 },
  { day: "Oct 20", users: 118 },
  { day: "Oct 22", users: 106 },
  { day: "Oct 24", users: 124 },
  { day: "Oct 26", users: 137 },
]

export const adminTransactions: AdminTransaction[] = [
  {
    id: "TXN-9H3M-14RT",
    user: "Alex Sterling",
    company: "TechFlow Inc.",
    plan: "Growth",
    amount: "$49.00",
    date: "Oct 24, 2026",
    status: "Success",
  },
  {
    id: "TXN-8G2L-03QS",
    user: "Maya Thompson",
    company: "Northstar Labs",
    plan: "Professional",
    amount: "$29.00",
    date: "Oct 23, 2026",
    status: "Success",
  },
  {
    id: "TXN-7F1K-92PR",
    user: "Liam O'Connor",
    company: "Brightline",
    plan: "Enterprise",
    amount: "$199.00",
    date: "Oct 22, 2026",
    status: "Pending",
  },
  {
    id: "TXN-6E0J-81OQ",
    user: "Nina Alvarez",
    company: "Cobalt Studio",
    plan: "Professional",
    amount: "$29.00",
    date: "Oct 21, 2026",
    status: "Success",
  },
  {
    id: "TXN-5D9I-70NP",
    user: "Owen Brooks",
    company: "Arc Systems",
    plan: "Growth",
    amount: "$49.00",
    date: "Oct 20, 2026",
    status: "Refunded",
  },
]

export const adminCompanies: AdminCompany[] = [
  {
    id: "company-1",
    name: "TechFlow Inc.",
    recruiterEmail: "alex.sterling@techflow.io",
    industry: "Software Development",
    status: "Approved",
    submitted: "Mar 04, 2024",
  },
  {
    id: "company-2",
    name: "Northstar Labs",
    recruiterEmail: "maya@northstarlabs.com",
    industry: "Product Design",
    status: "Approved",
    submitted: "Jun 18, 2024",
  },
  {
    id: "company-3",
    name: "Brightline",
    recruiterEmail: "liam@brightline.co",
    industry: "Fintech",
    status: "Pending",
    submitted: "Oct 22, 2026",
  },
  {
    id: "company-4",
    name: "Cobalt Studio",
    recruiterEmail: "nina@cobaltstudio.io",
    industry: "Creative Agency",
    status: "Approved",
    submitted: "Oct 05, 2024",
  },
  {
    id: "company-5",
    name: "Arc Systems",
    recruiterEmail: "owen@arcsystems.dev",
    industry: "Cloud Infrastructure",
    status: "Rejected",
    submitted: "Oct 19, 2026",
  },
  {
    id: "company-6",
    name: "Lumen Health",
    recruiterEmail: "sara@lumenhealth.com",
    industry: "Healthcare",
    status: "Pending",
    submitted: "Oct 24, 2026",
  },
]

export const adminPayments: AdminPayment[] = [
  {
    id: "TXN-9H3M-14RT",
    email: "alex.sterling@techflow.io",
    plan: "Growth",
    amount: "$49.00",
    date: "Oct 24, 2026",
    relative: "2 hours ago",
    status: "Success",
  },
  {
    id: "TXN-8G2L-03QS",
    email: "maya@northstarlabs.com",
    plan: "Professional",
    amount: "$29.00",
    date: "Oct 23, 2026",
    relative: "Yesterday",
    status: "Success",
  },
  {
    id: "TXN-7F1K-92PR",
    email: "liam@brightline.co",
    plan: "Enterprise",
    amount: "$199.00",
    date: "Oct 22, 2026",
    relative: "2 days ago",
    status: "Pending",
  },
  {
    id: "TXN-6E0J-81OQ",
    email: "nina@cobaltstudio.io",
    plan: "Professional",
    amount: "$29.00",
    date: "Oct 21, 2026",
    relative: "3 days ago",
    status: "Success",
  },
  {
    id: "TXN-5D9I-70NP",
    email: "owen@arcsystems.dev",
    plan: "Growth",
    amount: "$49.00",
    date: "Oct 20, 2026",
    relative: "4 days ago",
    status: "Failed",
  },
  {
    id: "TXN-4C8H-69MO",
    email: "jamie.chen@example.com",
    plan: "Professional",
    amount: "$29.00",
    date: "Oct 19, 2026",
    relative: "5 days ago",
    status: "Success",
  },
  {
    id: "TXN-3B7G-58LN",
    email: "sara@lumenhealth.com",
    plan: "Enterprise",
    amount: "$199.00",
    date: "Oct 18, 2026",
    relative: "6 days ago",
    status: "Success",
  },
  {
    id: "TXN-2A6F-47KM",
    email: "daniel.kim@example.com",
    plan: "Professional",
    amount: "$29.00",
    date: "Oct 17, 2026",
    relative: "1 week ago",
    status: "Success",
  },
]

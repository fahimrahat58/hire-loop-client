import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CreditCard,
  FileText,
  Globe,
  Home,
  LayoutDashboard,
  Settings,
  Tags,
  Users,
} from "lucide-react"
import type { Role } from "@/app/lib/dashboard-data"

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const dashboardNav: Record<Role, NavItem[]> = {
  seeker: [
    { label: "Dashboard", href: "/dashboard/seeker", icon: LayoutDashboard },
    { label: "Jobs", href: "/dashboard/seeker/jobs", icon: BriefcaseBusiness },
    { label: "Saved Jobs", href: "/dashboard/seeker/saved", icon: Bookmark },
    { label: "Applications", href: "/dashboard/seeker/applications", icon: FileText },
    { label: "Billing", href: "/dashboard/seeker/billing", icon: CreditCard },
    { label: "Settings", href: "/dashboard/seeker/settings", icon: Settings },
  ],
  recruiter: [
    { label: "Dashboard", href: "/dashboard/recruiter", icon: LayoutDashboard },
    { label: "My Company", href: "/dashboard/recruiter/company", icon: Building2 },
    { label: "Manage Jobs", href: "/dashboard/recruiter/jobs", icon: BriefcaseBusiness },
    { label: "Applications", href: "/dashboard/recruiter/applications", icon: Users },
    { label: "Billing", href: "/dashboard/recruiter/billing", icon: CreditCard },
    { label: "Settings", href: "/dashboard/recruiter/settings", icon: Settings },
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Users", href: "/dashboard/admin/users", icon: Users },
    { label: "Companies", href: "/dashboard/admin/companies", icon: Building2 },
    { label: "Jobs", href: "/dashboard/admin/jobs", icon: BriefcaseBusiness },
    { label: "Payments", href: "/dashboard/admin/payments", icon: CreditCard },
    { label: "Settings", href: "/dashboard/admin/settings", icon: Settings },
  ],
}

export const publicLinks: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Browse Jobs", href: "/jobs", icon: Globe },
  { label: "Companies", href: "/companies", icon: Tags },
  { label: "Pricing", href: "/pricing", icon: BarChart3 },
]

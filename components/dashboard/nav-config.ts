import type { LucideIcon } from "lucide-react"
import {
  Bookmark,
  BriefcaseBusiness,
  CreditCard,
  FileText,
  LayoutDashboard,
  PlusCircle,
  Settings,
  UserRound,
  Users,
} from "lucide-react"
import type { DashboardRole } from "@/app/lib/roles"

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

/**
 * Role navigation mirrors the backend permissions.
 *
 * Job creation/management is recruiter-only and admin user management is the
 * only admin API, so the admin console does not advertise company, payment or
 * job-management features that the backend cannot authorize.
 */
export const dashboardNav: Record<DashboardRole, NavItem[]> = {
  seeker: [
    {
      label: "Overview",
      href: "/dashboard/seeker",
      icon: LayoutDashboard,
    },
    {
      label: "Browse Jobs",
      href: "/dashboard/seeker/jobs",
      icon: BriefcaseBusiness,
    },
    {
      label: "My Applications",
      href: "/dashboard/seeker/applications",
      icon: FileText,
    },
    {
      label: "Saved Jobs",
      href: "/dashboard/seeker/saved",
      icon: Bookmark,
    },
    {
      label: "Subscription",
      href: "/dashboard/seeker/billing",
      icon: CreditCard,
    },
    {
      label: "Profile",
      href: "/dashboard/seeker/profile",
      icon: UserRound,
    },
    {
      label: "Settings",
      href: "/dashboard/seeker/settings",
      icon: Settings,
    },
  ],
  recruiter: [
    {
      label: "Overview",
      href: "/dashboard/recruiter",
      icon: LayoutDashboard,
    },
    {
      label: "Post a Job",
      href: "/dashboard/recruiter/jobs/new",
      icon: PlusCircle,
    },
    {
      label: "My Jobs",
      href: "/dashboard/recruiter/jobs",
      icon: BriefcaseBusiness,
    },
    {
      label: "Applicants",
      href: "/dashboard/recruiter/applications",
      icon: Users,
    },
    {
      label: "Subscription",
      href: "/dashboard/recruiter/billing",
      icon: CreditCard,
    },
    {
      label: "Profile",
      href: "/dashboard/recruiter/profile",
      icon: UserRound,
    },
    {
      label: "Settings",
      href: "/dashboard/recruiter/settings",
      icon: Settings,
    },
  ],
  admin: [
    {
      label: "Overview",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Manage Users",
      href: "/dashboard/admin/users",
      icon: Users,
    },
    {
      label: "Manage Jobs",
      href: "/dashboard/admin/jobs",
      icon: BriefcaseBusiness,
    },
    {
      label: "Profile",
      href: "/dashboard/admin/profile",
      icon: UserRound,
    },
    {
      label: "Settings",
      href: "/dashboard/admin/settings",
      icon: Settings,
    },
  ],
}

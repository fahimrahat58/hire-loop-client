/**
 * The only roles that exist in HireLoop. The backend MongoDB user document is
 * the source of truth for authorization; these types are used for UI routing
 * and rendering only.
 */
export const DASHBOARD_ROLES = ["seeker", "recruiter", "admin"] as const

export type DashboardRole = (typeof DASHBOARD_ROLES)[number]

/** Alias kept for the existing dashboard fixtures and components. */
export type Role = DashboardRole

export const DASHBOARD_HOME: Record<DashboardRole, string> = {
  seeker: "/dashboard/seeker",
  recruiter: "/dashboard/recruiter",
  admin: "/dashboard/admin",
}

export function isDashboardRole(value: unknown): value is DashboardRole {
  return (
    typeof value === "string" &&
    (DASHBOARD_ROLES as readonly string[]).includes(value)
  )
}

/**
 * Returns the dashboard role only for known values. Missing, malformed or
 * unknown roles return `null` so they never receive dashboard access.
 */
export function getDashboardRole(value: unknown): DashboardRole | null {
  return isDashboardRole(value) ? value : null
}

export function dashboardPathForRole(value: unknown): string | null {
  const role = getDashboardRole(value)

  return role ? DASHBOARD_HOME[role] : null
}

import { SessionGuard } from "@/components/shared/SessionGuard"

/**
 * Shared job pages under /dashboard/jobs are visible to every signed-in role,
 * but the account must have a valid dashboard role.
 */
export default function DashboardJobsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SessionGuard>{children}</SessionGuard>
}

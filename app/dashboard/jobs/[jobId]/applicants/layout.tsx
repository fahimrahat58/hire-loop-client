import { SessionGuard } from "@/components/shared/SessionGuard"

/**
 * Applicant lists are recruiter-only on the API, so the shared route is guarded
 * with the same role requirement as the recruiter dashboard.
 */
export default function JobApplicantsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SessionGuard requiredRole="recruiter">{children}</SessionGuard>
}

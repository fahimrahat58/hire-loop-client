import Link from "next/link"

import {
  DashboardCard,
  EmptyState,
  PageHeader,
  primaryButton,
} from "@/components/dashboard/ui"

export default function AdminCompaniesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Companies"
        description="Review company registrations submitted by recruiters."
      />

      <DashboardCard>
        <EmptyState
          title="Company management is not available yet"
          description="The backend does not expose a company review API yet, so there is no real registration data to display, approve, or reject. This page will list live companies once that endpoint is available."
          action={
            <Link href="/dashboard/admin" className={primaryButton}>
              Back to overview
            </Link>
          }
        />
      </DashboardCard>
    </div>
  )
}

import Link from "next/link"

import {
  DashboardCard,
  EmptyState,
  PageHeader,
  primaryButton,
} from "@/components/dashboard/ui"

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments & Subscriptions"
        description="Review platform revenue and subscription activity."
      />

      <DashboardCard>
        <EmptyState
          title="Payment reporting is not available yet"
          description="The backend does not expose an admin payments or subscription API yet, so no real revenue or transaction data can be shown. This page will display live billing records once that endpoint is available."
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

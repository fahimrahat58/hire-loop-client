import { seekerBillingRecords } from "@/app/lib/dashboard-data"
import { BillingView } from "@/components/dashboard/billing-view"

export default function SeekerBillingPage() {
  return (
    <BillingView
      planName="Professional Tier"
      price="$29"
      description="Unlock global job insights and unlimited applications."
      nextBilling="Next billing date: Oct 24, 2026"
      features={[
        "Unlimited applications",
        "Premium job insights",
        "Priority candidate badge",
        "Direct recruiter messaging",
      ]}
      usageLabel="Applications this month"
      usage={18}
      usageMax={30}
      usageNote="12 applications remaining"
      records={seekerBillingRecords}
    />
  )
}

import { recruiterBillingRecords } from "@/app/lib/dashboard-data"
import { BillingView } from "@/components/dashboard/billing-view"

export default function RecruiterBillingPage() {
  return (
    <BillingView
      planName="Growth Plan"
      price="$49"
      description="Hire faster with applicant tracking and basic hiring analytics."
      nextBilling="Next billing date: Nov 01, 2026"
      features={[
        "Up to 10 active job posts",
        "Applicant tracking",
        "Basic analytics",
        "Email support",
      ]}
      usageLabel="Active job posts"
      usage={7}
      usageMax={10}
      usageNote="3 active slots remaining"
      records={recruiterBillingRecords}
    />
  )
}

import Link from "next/link"
import {
  CheckCircle2,
  CreditCard,
  LifeBuoy,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import type { BillingRecord } from "@/app/lib/dashboard-data"
import {
  DashboardCard,
  PageHeader,
  ProgressBar,
  SectionCard,
  StatusBadge,
  TableShell,
  Td,
  Th,
  primaryButton,
  secondaryButton,
} from "@/components/dashboard/ui"
import { PrintButton } from "./print-button"

export function BillingView({
  eyebrow,
  planName,
  price,
  description,
  nextBilling,
  features,
  usageLabel,
  usage,
  usageMax,
  usageNote,
  records,
}: {
  eyebrow?: string
  planName: string
  price: string
  description: string
  nextBilling: string
  features: string[]
  usageLabel: string
  usage: number
  usageMax: number
  usageNote: string
  records: BillingRecord[]
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={eyebrow}
        title="Subscription & Billing"
        description="Manage your plan features, recurring payments, and billing history."
        actions={<PrintButton />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardCard className="relative overflow-hidden p-5 lg:col-span-2">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-[#5c53fe]/15 blur-3xl"
          />
          <div className="relative">
            <p className="text-[10px] font-semibold tracking-[0.16em] text-[#6e6e78] uppercase">
              Current plan
            </p>
            <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-[#ededef]">
                  {planName}
                </h2>
                <p className="mt-1 text-xs text-[#a0a0ab]">{description}</p>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-semibold tracking-tight text-[#ededef]">
                  {price}
                </span>
                <span className="pb-1 text-sm text-[#8b8b96]">/mo</span>
              </div>
            </div>

            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-[12px] text-[#c4c4cc]"
                >
                  <CheckCircle2 className="size-3.5 shrink-0 text-[#22c55e]" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-lg border border-white/[0.07] bg-[#0f0f13] p-3.5">
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className="text-[#a0a0ab]">{usageLabel}</span>
                <span className="font-semibold text-[#ededef]">
                  {usage} / {usageMax} used
                </span>
              </div>
              <ProgressBar value={usage} max={usageMax} className="mt-2" />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#6e6e78]">
                <span>{usageNote}</span>
                <span>{nextBilling}</span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/pricing" className={primaryButton}>
                <Sparkles className="size-3.5" />
                Upgrade plan
              </Link>
              <Link href="/pricing" className={secondaryButton}>
                Manage plan
              </Link>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="flex flex-col p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-[#ededef]">
              Payment method
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#8f88ff]/25 bg-[#5c53fe]/10 px-2 py-0.5 text-[9px] font-semibold tracking-wider text-[#b8b2ff] uppercase">
              <ShieldCheck className="size-3" />
              Secured by Stripe
            </span>
          </div>

          <div className="mt-4 rounded-xl bg-gradient-to-br from-[#2a2740] via-[#1c1a2b] to-[#141418] p-4 ring-1 ring-white/10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-wider text-white/60 uppercase">
                Visa
              </span>
              <CreditCard className="size-5 text-white/70" />
            </div>
            <p className="mt-6 font-mono text-lg tracking-[0.18em] text-white">
              •••• •••• •••• 4242
            </p>
            <div className="mt-4 flex items-end justify-between text-[10px] tracking-wider text-white/55 uppercase">
              <div>
                <p>Card holder</p>
                <p className="mt-0.5 text-[11px] font-medium text-white">
                  Alexander Seeker
                </p>
              </div>
              <div>
                <p>Expires</p>
                <p className="mt-0.5 text-[11px] font-medium text-white">12/25</p>
              </div>
            </div>
          </div>

          <Link href="/pricing" className={`${secondaryButton} mt-4 w-full`}>
            Add new payment method
          </Link>
          <p className="mt-3 text-[11px] leading-relaxed text-[#6e6e78]">
            Payments are encrypted and processed securely. You can cancel at any
            time from this page.
          </p>
        </DashboardCard>
      </div>

      <SectionCard title="Billing history" action={<PrintButton />}>
        <TableShell>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Plan</Th>
              <Th>Amount</Th>
              <Th>Transaction Id</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.transaction} className="hover:bg-white/[0.02]">
                <Td className="text-[#d4d4d8]">{record.date}</Td>
                <Td>{record.plan}</Td>
                <Td className="font-medium text-[#ededef]">{record.amount}</Td>
                <Td className="font-mono text-[11px]">{record.transaction}</Td>
                <Td>
                  <StatusBadge status={record.status} />
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </SectionCard>

      <DashboardCard className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#5c53fe]/15 text-[#b8b2ff]">
            <LifeBuoy className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-[#ededef]">
              Need help with your invoice?
            </h2>
            <p className="mt-0.5 max-w-xl text-xs text-[#8b8b96]">
              Our support team is available 24/7 to help resolve payment issues
              or clarify billing details.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link href="/sign-in" className={primaryButton}>
            Contact support
          </Link>
          <Link href="/pricing" className={secondaryButton}>
            Refund policy
          </Link>
        </div>
      </DashboardCard>
    </div>
  )
}

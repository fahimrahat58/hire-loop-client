"use client"

import Link from "next/link"
import {
  CreditCard,
  Info,
  ReceiptText,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react"

import { authClient } from "@/app/lib/auth-client"
import {
  Avatar,
  DashboardCard,
  EmptyState,
  PageHeader,
  SectionCard,
  primaryButton,
} from "@/components/dashboard/ui"

function formatDate(value?: Date | string | null) {
  if (!value) return "—"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "—"

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export default function SeekerBillingPage() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-white/[0.06]" />

        <div className="grid gap-4 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-48 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.03]"
            />
          ))}
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <DashboardCard>
        <EmptyState
          title="Sign in to view billing"
          description="Billing information is tied to your HireLoop account."
          action={
            <Link href="/sign-in" className={primaryButton}>
              Sign in
            </Link>
          }
        />
      </DashboardCard>
    )
  }

  if (session.user.role !== "seeker") {
    return (
      <DashboardCard>
        <EmptyState
          title="Billing is for job seeker accounts"
          description="Sign in with a job seeker account to view this page."
          action={
            <Link href="/dashboard" className={primaryButton}>
              Go to dashboard
            </Link>
          }
        />
      </DashboardCard>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Review the billing information available for your account."
      />

      <div className="flex flex-col gap-3 rounded-xl border border-[#60a5fa]/25 bg-[#60a5fa]/10 px-4 py-3 text-[13px] text-[#bfdbfe] sm:flex-row sm:items-start">
        <Info className="mt-0.5 size-4 shrink-0" />

        <div>
          <p className="font-medium">Billing is not available yet</p>
          <p className="mt-0.5 text-[12px] text-[#93c5fd]">
            The HireLoop backend does not currently expose subscription,
            payment method, invoice, or transaction endpoints. No billing data
            is invented on this page. Once those endpoints exist, this page can
            display real plan and payment information.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardCard className="flex flex-col p-5">
          <div className="flex items-start gap-3">
            <Avatar name={session.user.name || "User"} size="xl" />

            <div className="min-w-0 pt-1">
              <h2 className="truncate text-lg font-semibold text-[#ededef]">
                {session.user.name || "Your profile"}
              </h2>

              <p className="truncate text-xs text-[#a0a0ab]">
                {session.user.email}
              </p>

              <span className="mt-2 inline-flex items-center rounded-full border border-[#5c53fe]/40 bg-[#5c53fe]/15 px-2 py-0.5 text-[10px] font-medium text-[#b8b2ff]">
                Job Seeker
              </span>
            </div>
          </div>

          <dl className="mt-5 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-[#a0a0ab]">
              <UserRound className="size-3.5 text-[#6e6e78]" />
              Account: {session.user.name || "—"}
            </div>

            <div className="flex items-center gap-2 text-[#a0a0ab]">
              <ShieldCheck className="size-3.5 text-[#6e6e78]" />
              Role: {session.user.role || "seeker"}
            </div>

            <div className="flex items-center gap-2 text-[#a0a0ab]">
              <CreditCard className="size-3.5 text-[#6e6e78]" />
              Member since{" "}
              {formatDate(
                session.user.createdAt as Date | string | undefined
              )}
            </div>
          </dl>

          <Link
            href="/dashboard/seeker/settings"
            className="mt-auto inline-flex w-full items-center justify-center rounded-lg border border-white/10 bg-[#1a1a1f] px-3.5 py-2 text-[13px] font-medium text-[#d4d4d8] transition hover:border-white/20 hover:bg-[#222228]"
          >
            Manage account
          </Link>
        </DashboardCard>

        <SectionCard
          title="Subscription"
          description="Plan and renewal information"
          bodyClassName="p-5"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#5c53fe]/15 text-[#b8b2ff]">
              <CreditCard className="size-5" />
            </span>

            <div>
              <p className="text-[13px] font-medium text-[#ededef]">
                Not available
              </p>
              <p className="text-[11px] text-[#6e6e78]">
                No subscription endpoint
              </p>
            </div>
          </div>

          <p className="mt-4 text-[12px] leading-relaxed text-[#7c7c86]">
            HireLoop does not store a plan, price, renewal date, or usage limit
            for this account. Nothing is shown here because the backend cannot
            confirm it.
          </p>
        </SectionCard>

        <SectionCard
          title="Payment methods"
          description="Cards and billing details"
          bodyClassName="p-5"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#22c55e]/15 text-[#86efac]">
              <Wallet className="size-5" />
            </span>

            <div>
              <p className="text-[13px] font-medium text-[#ededef]">
                Not available
              </p>
              <p className="text-[11px] text-[#6e6e78]">
                No payment method endpoint
              </p>
            </div>
          </div>

          <p className="mt-4 text-[12px] leading-relaxed text-[#7c7c86]">
            No saved cards, billing addresses, or payment methods are exposed by
            the current API.
          </p>
        </SectionCard>
      </div>

      <SectionCard
        title="Invoices and payment history"
        description="Receipts and transaction records"
        bodyClassName="p-5"
      >
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/10 bg-[#0f0f13] px-6 py-10 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-white/[0.05] text-[#a0a0ab]">
            <ReceiptText className="size-5" />
          </span>

          <p className="mt-3 text-sm font-semibold text-[#ededef]">
            No invoice data available
          </p>

          <p className="mt-1 max-w-md text-xs leading-relaxed text-[#7c7c86]">
            The backend has no invoice or transaction collection/endpoint. When
            billing is added, real receipts and payment history can be listed
            here.
          </p>
        </div>
      </SectionCard>
    </div>
  )
}

"use client"

import { useMemo, useState } from "react"
import {
  Building2,
  DollarSign,
  Download,
  Filter,
  Search,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react"
import { adminPayments } from "@/app/lib/dashboard-data"
import {
  EmptyState,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  TableShell,
  Td,
  Th,
  inputClass,
  secondaryButton,
} from "@/components/dashboard/ui"
import { cn } from "@/lib/utils"

export default function AdminPaymentsPage() {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("All")

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase()

    return adminPayments.filter((payment) => {
      const matchesStatus = status === "All" || payment.status === status
      const matchesQuery =
        !term ||
        payment.email.toLowerCase().includes(term) ||
        payment.id.toLowerCase().includes(term) ||
        payment.plan.toLowerCase().includes(term)

      return matchesStatus && matchesQuery
    })
  }, [query, status])

  const exportCsv = () => {
    const header = ["User Email", "Plan", "Amount", "Date", "Transaction ID", "Status"]
    const lines = rows.map((payment) =>
      [
        payment.email,
        payment.plan,
        payment.amount,
        `${payment.date} (${payment.relative})`,
        payment.id,
        payment.status,
      ]
        .map((value) => `"${value.replaceAll('"', '""')}"`)
        .join(",")
    )
    const blob = new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8;",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "hireloop-payments.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments & Subscriptions"
        description="Comprehensive overview of platform revenue and active subscriptions."
        actions={
          <button type="button" onClick={exportCsv} className={secondaryButton}>
            <Download className="size-3.5" />
            Export CSV
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value="$1,284,500"
          hint="+12.4% vs last year"
          icon={DollarSign}
          accent="green"
        />
        <StatCard
          label="Monthly Revenue"
          value="$94,210"
          hint="+8.1% vs last month"
          icon={Wallet}
          accent="violet"
        />
        <StatCard
          label="Active Pro Users"
          value="12,408"
          hint="+2.3% vs last month"
          icon={Users}
          accent="blue"
        />
        <StatCard
          label="Active Enterprise Users"
          value="842"
          hint="+15.7% vs last month"
          icon={Building2}
          accent="amber"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#6e6e78]" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search transactions, users, or IDs..."
            className={cn(inputClass, "pl-9")}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-3.5 text-[#6e6e78]" />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-lg border border-white/10 bg-[#0f0f13] px-3 py-2.5 text-xs text-[#d4d4d8] outline-none focus:border-[#5c53fe]"
          >
            <option value="All">All statuses</option>
            <option value="Success">Success</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
        <span className="text-[11px] text-[#6e6e78] sm:ml-auto">
          {rows.length} transactions
        </span>
      </div>

      <SectionCard
        title="Recent transactions"
        action={
          <span className="inline-flex items-center gap-1 text-[11px] text-[#6e6e78]">
            <Sparkles className="size-3.5 text-[#b8b2ff]" />
            Updated live
          </span>
        }
      >
        {rows.length > 0 ? (
          <TableShell>
            <thead>
              <tr>
                <Th>User email</Th>
                <Th>Plan</Th>
                <Th>Amount</Th>
                <Th>Date</Th>
                <Th>Transaction id</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((payment) => (
                <tr key={payment.id} className="hover:bg-white/[0.02]">
                  <Td className="font-medium text-[#ededef]">{payment.email}</Td>
                  <Td>
                    <span className="rounded-full border border-white/10 bg-[#1a1a1f] px-2 py-0.5 text-[11px]">
                      {payment.plan}
                    </span>
                  </Td>
                  <Td className="font-medium text-[#ededef]">{payment.amount}</Td>
                  <Td>
                    <p className="text-[#d4d4d8]">{payment.date}</p>
                    <p className="text-[11px] text-[#6e6e78]">
                      · {payment.relative}
                    </p>
                  </Td>
                  <Td className="font-mono text-[11px]">{payment.id}</Td>
                  <Td>
                    <StatusBadge status={payment.status} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        ) : (
          <EmptyState
            title="No transactions found"
            description="No payments match this search or status filter."
            action={
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  setStatus("All")
                }}
                className={secondaryButton}
              >
                Clear filters
              </button>
            }
          />
        )}
      </SectionCard>
    </div>
  )
}

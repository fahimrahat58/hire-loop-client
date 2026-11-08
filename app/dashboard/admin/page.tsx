import Link from "next/link"
import {
  Building2,
  BriefcaseBusiness,
  CalendarDays,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react"
import {
  adminJobsByCategory,
  adminRegistrations,
  adminStats,
  adminTransactions,
} from "@/app/lib/dashboard-data"
import {
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  TableShell,
  Td,
  Th,
  secondaryButton,
} from "@/components/dashboard/ui"
import {
  JobsByCategoryChart,
  RegistrationsChart,
} from "@/components/dashboard/charts"
import { PrintButton } from "@/components/dashboard/print-button"

const statIcons = [Users, TrendingUp, Building2, BriefcaseBusiness, DollarSign]
const statAccents = ["blue", "violet", "amber", "green", "red"] as const

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Overview"
        description="Real-time platform performance and growth metrics."
        actions={
          <>
            <span className={secondaryButton}>
              <CalendarDays className="size-3.5" />
              Last 30 days
            </span>
            <PrintButton label="Export report" />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {adminStats.map((stat, index) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            hint={
              stat.tone === "neutral"
                ? "No change vs last period"
                : `${stat.trend} vs last period`
            }
            icon={statIcons[index] ?? Users}
            accent={statAccents[index] ?? "violet"}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Job posts by category"
          description="Distribution across the platform this month"
          bodyClassName="p-4"
        >
          <JobsByCategoryChart data={adminJobsByCategory} />
        </SectionCard>
        <SectionCard
          title="New user registrations"
          description="Daily signups over the last 30 days"
          bodyClassName="p-4"
        >
          <RegistrationsChart data={adminRegistrations} />
        </SectionCard>
      </div>

      <SectionCard
        title="Recent subscription transactions"
        action={
          <Link
            href="/dashboard/admin/payments"
            className="text-xs font-medium text-[#b8b2ff] transition hover:text-white"
          >
            View all activity
          </Link>
        }
      >
        <TableShell>
          <thead>
            <tr>
              <Th>User / Recruiter</Th>
              <Th>Plan type</Th>
              <Th>Transaction id</Th>
              <Th>Amount</Th>
              <Th>Date</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {adminTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-white/[0.02]">
                <Td>
                  <p className="font-medium text-[#ededef]">{transaction.user}</p>
                  <p className="text-[11px] text-[#6e6e78]">
                    {transaction.company}
                  </p>
                </Td>
                <Td>{transaction.plan}</Td>
                <Td className="font-mono text-[11px]">{transaction.id}</Td>
                <Td className="font-medium text-[#ededef]">
                  {transaction.amount}
                </Td>
                <Td>{transaction.date}</Td>
                <Td>
                  <StatusBadge status={transaction.status} />
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </SectionCard>
    </div>
  )
}

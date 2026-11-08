"use client"

import { useMemo, useState } from "react"
import {
  Building2,
  CircleCheckBig,
  CircleX,
  Clock3,
  FileDown,
  Search,
} from "lucide-react"
import {
  adminCompanies,
  type AdminCompany,
  type CompanyStatus,
} from "@/app/lib/dashboard-data"
import {
  Avatar,
  DashboardCard,
  EmptyState,
  PageHeader,
  StatCard,
  StatusBadge,
  TableShell,
  Td,
  Th,
  ghostButton,
  inputClass,
  secondaryButton,
} from "@/components/dashboard/ui"
import { cn } from "@/lib/utils"

export default function AdminCompaniesPage() {
  const [rows, setRows] = useState<AdminCompany[]>(adminCompanies)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("All statuses")

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()

    return rows.filter((company) => {
      const matchesStatus =
        status === "All statuses" || company.status === status
      const matchesQuery =
        !term ||
        company.name.toLowerCase().includes(term) ||
        company.recruiterEmail.toLowerCase().includes(term) ||
        company.industry.toLowerCase().includes(term)

      return matchesStatus && matchesQuery
    })
  }, [rows, query, status])

  const setCompanyStatus = (id: string, nextStatus: CompanyStatus) => {
    setRows((current) =>
      current.map((company) =>
        company.id === id ? { ...company, status: nextStatus } : company
      )
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Companies"
        description="Approve or reject company registrations. Approved companies are visible in the public directory."
        actions={
          <button type="button" onClick={() => window.print()} className={secondaryButton}>
            <FileDown className="size-3.5" />
            Export list
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Registered Companies"
          value="4,281"
          hint="+24% vs last month"
          icon={Building2}
          accent="blue"
        />
        <StatCard
          label="Pending Review"
          value={String(rows.filter((row) => row.status === "Pending").length)}
          hint="Needs admin action"
          icon={Clock3}
          accent="amber"
        />
        <StatCard
          label="Approved"
          value={String(rows.filter((row) => row.status === "Approved").length)}
          hint="Publicly visible"
          icon={CircleCheckBig}
          accent="green"
        />
        <StatCard
          label="Rejected"
          value={String(rows.filter((row) => row.status === "Rejected").length)}
          hint="Removed from listing"
          icon={CircleX}
          accent="red"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#6e6e78]" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search companies or recruiters..."
            className={cn(inputClass, "pl-9")}
          />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="w-full rounded-lg border border-white/10 bg-[#0f0f13] px-3 py-2.5 text-xs text-[#d4d4d8] outline-none focus:border-[#5c53fe] sm:w-auto"
        >
          <option>All statuses</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
        <span className="text-[11px] text-[#6e6e78] sm:ml-auto">
          {visible.length} of {rows.length} registrations
        </span>
      </div>

      <DashboardCard className="overflow-hidden">
        {visible.length > 0 ? (
          <TableShell>
            <thead>
              <tr>
                <Th>Company name</Th>
                <Th>Recruiter email</Th>
                <Th>Industry</Th>
                <Th>Status</Th>
                <Th>Date submitted</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {visible.map((company) => (
                <tr key={company.id} className="hover:bg-white/[0.02]">
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={company.name} size="sm" />
                      <span className="font-medium text-[#ededef]">
                        {company.name}
                      </span>
                    </div>
                  </Td>
                  <Td>{company.recruiterEmail}</Td>
                  <Td>{company.industry}</Td>
                  <Td>
                    <StatusBadge status={company.status} />
                  </Td>
                  <Td>{company.submitted}</Td>
                  <Td>
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      {company.status !== "Approved" ? (
                        <button
                          type="button"
                          onClick={() => setCompanyStatus(company.id, "Approved")}
                          className={cn(ghostButton, "hover:text-[#86efac]")}
                        >
                          Approve
                        </button>
                      ) : null}
                      {company.status !== "Rejected" ? (
                        <button
                          type="button"
                          onClick={() => setCompanyStatus(company.id, "Rejected")}
                          className={cn(ghostButton, "hover:text-red-400")}
                        >
                          Reject
                        </button>
                      ) : null}
                      {company.status === "Rejected" ? (
                        <button
                          type="button"
                          onClick={() => setCompanyStatus(company.id, "Pending")}
                          className={ghostButton}
                        >
                          Reset
                        </button>
                      ) : null}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        ) : (
          <EmptyState
            title="No companies found"
            description="No company registrations match this filter."
            action={
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  setStatus("All statuses")
                }}
                className={secondaryButton}
              >
                Clear filters
              </button>
            }
          />
        )}
      </DashboardCard>
    </div>
  )
}

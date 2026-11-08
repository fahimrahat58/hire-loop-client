"use client"

import { useMemo, useState } from "react"
import {
  Ban,
  CircleCheckBig,
  FileDown,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  UserRoundPlus,
  Users,
} from "lucide-react"
import { adminUsers, type AdminUser } from "@/app/lib/dashboard-data"
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

export default function AdminUsersPage() {
  const [rows, setRows] = useState<AdminUser[]>(adminUsers)
  const [query, setQuery] = useState("")
  const [role, setRole] = useState("All Roles")

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()

    return rows.filter((user) => {
      const matchesRole = role === "All Roles" || user.role === role
      const matchesQuery =
        !term ||
        user.email.toLowerCase().includes(term) ||
        user.name.toLowerCase().includes(term)

      return matchesRole && matchesQuery
    })
  }, [rows, query, role])

  const toggleRole = (user: AdminUser) => {
    const nextRole = user.role === "Seeker" ? "Recruiter" : "Seeker"
    if (
      !window.confirm(
        `Change ${user.name}'s role from ${user.role} to ${nextRole}?`
      )
    ) {
      return
    }

    setRows((current) =>
      current.map((item) =>
        item.id === user.id ? { ...item, role: nextRole } : item
      )
    )
  }

  const toggleStatus = (user: AdminUser) => {
    setRows((current) =>
      current.map((item) =>
        item.id === user.id
          ? {
              ...item,
              status: item.status === "Active" ? "Suspended" : "Active",
            }
          : item
      )
    )
  }

  const remove = (user: AdminUser) => {
    if (!window.confirm(`Permanently delete ${user.name}'s account?`)) return
    setRows((current) => current.filter((item) => item.id !== user.id))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Review, filter, and manage platform access for all users."
        actions={
          <>
            <span className={secondaryButton}>
              <UserCog className="size-3.5" />
              Manage roles
            </span>
            <button type="button" onClick={() => window.print()} className={secondaryButton}>
              <FileDown className="size-3.5" />
              Export list
            </button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Active Users"
          value="12,842"
          hint="+12% vs last month"
          icon={Users}
          accent="blue"
        />
        <StatCard
          label="Recruiter Growth"
          value="843"
          hint="High demand"
          icon={UserRoundPlus}
          accent="violet"
        />
        <StatCard
          label="Suspended Accounts"
          value="124"
          hint="0.8% of total"
          icon={Ban}
          accent="red"
        />
        <StatCard
          label="New Signups (24h)"
          value="42"
          hint="Steady activity"
          icon={CircleCheckBig}
          accent="green"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#6e6e78]" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by email or name..."
            className={cn(inputClass, "pl-9")}
          />
        </div>
        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className="w-full rounded-lg border border-white/10 bg-[#0f0f13] px-3 py-2.5 text-xs text-[#d4d4d8] outline-none focus:border-[#5c53fe] sm:w-auto"
        >
          <option>All Roles</option>
          <option>Seeker</option>
          <option>Recruiter</option>
        </select>
        <span className="text-[11px] text-[#6e6e78] sm:ml-auto">
          {visible.length} of {rows.length} users
        </span>
      </div>

      <DashboardCard className="overflow-hidden">
        {visible.length > 0 ? (
          <TableShell>
            <thead>
              <tr>
                <Th>User name</Th>
                <Th>Email address</Th>
                <Th>Role</Th>
                <Th>Join date</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {visible.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02]">
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={user.name} size="sm" />
                      <span className="font-medium text-[#ededef]">
                        {user.name}
                      </span>
                    </div>
                  </Td>
                  <Td>{user.email}</Td>
                  <Td>
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5 text-[#6e6e78]" />
                      {user.role}
                    </span>
                  </Td>
                  <Td>{user.joined}</Td>
                  <Td>
                    <StatusBadge status={user.status} />
                  </Td>
                  <Td>
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => toggleRole(user)}
                        className={ghostButton}
                      >
                        Make {user.role === "Seeker" ? "Recruiter" : "Seeker"}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleStatus(user)}
                        className={cn(
                          ghostButton,
                          user.status === "Active"
                            ? "hover:text-red-400"
                            : "hover:text-[#86efac]"
                        )}
                      >
                        {user.status === "Active" ? "Suspend" : "Activate"}
                      </button>
                      {user.status === "Suspended" ? (
                        <button
                          type="button"
                          onClick={() => remove(user)}
                          aria-label={`Delete ${user.name}`}
                          className={cn(ghostButton, "hover:text-red-400")}
                        >
                          <Trash2 className="size-3.5" />
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
            title="No users found"
            description="No accounts match this search or role filter."
            action={
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  setRole("All Roles")
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

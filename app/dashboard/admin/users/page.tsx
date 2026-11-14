"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  AlertCircle,
  BadgeCheck,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react"

import { authClient } from "@/app/lib/auth-client"
import {
  getAdminErrorMessage,
  getAdminUsers,
  updateAdminUserRole,
  type AdminUser,
  type AdminUserCounts,
  type AdminUserPagination,
  type AdminUserRole,
  type AdminUserRoleFilter,
} from "@/app/lib/admin-api"
import {
  Avatar,
  DashboardCard,
  EmptyState,
  PageHeader,
  StatCard,
  TableShell,
  Td,
  Th,
  inputClass,
  primaryButton,
  secondaryButton,
} from "@/components/dashboard/ui"
import { cn } from "@/lib/utils"

const PAGE_SIZE_OPTIONS = [10, 25, 50]

const ROLE_LABELS: Record<AdminUserRole, string> = {
  seeker: "Seeker",
  recruiter: "Recruiter",
  admin: "Admin",
}

const ROLE_BADGE_STYLES: Record<AdminUserRole, string> = {
  seeker: "border-[#60a5fa]/30 bg-[#60a5fa]/14 text-[#93c5fd]",
  recruiter: "border-[#5c53fe]/30 bg-[#5c53fe]/16 text-[#b8b2ff]",
  admin: "border-[#22c55e]/30 bg-[#22c55e]/14 text-[#86efac]",
}

const ROLE_OPTIONS: AdminUserRole[] = ["seeker", "recruiter", "admin"]

const ROLE_FILTERS: { value: AdminUserRoleFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "seeker", label: "Seeker" },
  { value: "recruiter", label: "Recruiter" },
  { value: "admin", label: "Admin" },
]

function formatDate(value?: string | null) {
  if (!value) return "—"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "—"

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function RoleBadge({ role }: { role: AdminUserRole }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap",
        ROLE_BADGE_STYLES[role]
      )}
    >
      {role === "admin" ? (
        <ShieldCheck className="size-3" />
      ) : role === "recruiter" ? (
        <BriefcaseBusiness className="size-3" />
      ) : (
        <UserRound className="size-3" />
      )}
      {ROLE_LABELS[role]}
    </span>
  )
}

function filterCount(
  filter: AdminUserRoleFilter,
  counts: AdminUserCounts | null
) {
  if (!counts) return 0

  if (filter === "all") return counts.total
  if (filter === "seeker") return counts.seekers
  if (filter === "recruiter") return counts.recruiters

  return counts.admins
}

export default function AdminUsersPage() {
  const { data: session, isPending } = authClient.useSession()

  const sessionUserId = session?.user?.id
  const sessionUserRole = session?.user?.role

  const [users, setUsers] = useState<AdminUser[]>([])
  const [pagination, setPagination] = useState<AdminUserPagination | null>(null)
  const [counts, setCounts] = useState<AdminUserCounts | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [search, setSearch] = useState("")
  const [appliedSearch, setAppliedSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<AdminUserRoleFilter>("all")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const [draftRoles, setDraftRoles] = useState<Record<string, AdminUserRole>>(
    {}
  )
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const requestIdRef = useRef(0)

  // Debounce typing so the API is not hit on every keystroke.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextSearch = search.trim()

      if (nextSearch === appliedSearch) return

      setAppliedSearch(nextSearch)
      setPage(1)
    }, 350)

    return () => window.clearTimeout(timer)
  }, [search, appliedSearch])

  const loadUsers = useCallback(
    async (options?: { signal?: AbortSignal; silent?: boolean }) => {
      if (!sessionUserId || sessionUserRole !== "admin") return

      const requestId = ++requestIdRef.current

      if (!options?.silent) {
        setLoading(true)
      }

      setError("")

      try {
        const result = await getAdminUsers({
          page,
          limit,
          search: appliedSearch,
          role: roleFilter,
          signal: options?.signal,
        })

        if (requestId !== requestIdRef.current) return

        setUsers(result.users)
        setPagination(result.pagination)
        setCounts(result.counts)
        setDraftRoles(
          Object.fromEntries(
            result.users.map((user) => [user.id, user.role])
          ) as Record<string, AdminUserRole>
        )
      } catch (requestError) {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return
        }

        if (requestId !== requestIdRef.current) return

        setError(
          getAdminErrorMessage(
            requestError,
            "Failed to load users from the server."
          )
        )
      } finally {
        if (requestId === requestIdRef.current && !options?.silent) {
          setLoading(false)
        }
      }
    },
    [sessionUserId, sessionUserRole, page, limit, appliedSearch, roleFilter]
  )

  useEffect(() => {
    if (isPending) return

    if (!sessionUserId || sessionUserRole !== "admin") {
      setLoading(false)

      return
    }

    const controller = new AbortController()

    void loadUsers({ signal: controller.signal })

    return () => controller.abort()
  }, [isPending, sessionUserId, sessionUserRole, loadUsers])

  const totalPages = pagination?.totalPages ?? 1

  const pageStart =
    pagination && pagination.total > 0
      ? (pagination.page - 1) * pagination.limit + 1
      : 0

  const pageEnd = pagination
    ? Math.min(pagination.page * pagination.limit, pagination.total)
    : 0

  const totalUsers = counts?.total ?? 0

  const isRefreshing = loading && users.length > 0

  const roleSummary = useMemo(
    () => [
      {
        label: "Total users",
        value: counts?.total ?? 0,
        hint: "Every registered account",
        icon: Users,
        accent: "blue" as const,
      },
      {
        label: "Seekers",
        value: counts?.seekers ?? 0,
        hint: "Job seeker accounts",
        icon: UserRound,
        accent: "violet" as const,
      },
      {
        label: "Recruiters",
        value: counts?.recruiters ?? 0,
        hint: "Recruiter accounts",
        icon: BriefcaseBusiness,
        accent: "green" as const,
      },
      {
        label: "Admins",
        value: counts?.admins ?? 0,
        hint: "Full console access",
        icon: ShieldCheck,
        accent: "amber" as const,
      },
    ],
    [counts]
  )

  const handleRoleUpdate = async (user: AdminUser) => {
    const nextRole = draftRoles[user.id] ?? user.role

    if (user.id === sessionUserId) {
      toast.error("You cannot change your own admin role.")

      return
    }

    if (nextRole === user.role) {
      toast.info(`${user.name} already has the ${ROLE_LABELS[user.role]} role.`)

      return
    }

    const confirmed = window.confirm(
      `Change ${user.name}'s role from ${ROLE_LABELS[user.role]} to ${ROLE_LABELS[nextRole]}?`
    )

    if (!confirmed) return

    setUpdatingId(user.id)

    try {
      const updated = await updateAdminUserRole(user.id, nextRole)

      toast.success(
        `${updated.name}'s role was updated to ${ROLE_LABELS[updated.role]}.`
      )

      await loadUsers({ silent: true })
    } catch (updateError) {
      toast.error(
        getAdminErrorMessage(updateError, "Failed to update the user role.")
      )

      setDraftRoles((current) => ({ ...current, [user.id]: user.role }))
    } finally {
      setUpdatingId(null)
    }
  }

  if (!isPending && !session?.user) {
    return (
      <DashboardCard>
        <EmptyState
          title="Sign in required"
          description="The admin console is only available to authenticated administrators."
          action={
            <Link href="/sign-in" className={primaryButton}>
              Sign in
            </Link>
          }
        />
      </DashboardCard>
    )
  }

  if (!isPending && session?.user && sessionUserRole !== "admin") {
    return (
      <DashboardCard>
        <EmptyState
          title="Admins only"
          description="Your account does not have administrator access. The server rejects admin API requests from non-admin accounts."
          action={
            <Link href={`/dashboard/${sessionUserRole || "seeker"}`} className={primaryButton}>
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
        title="User Management"
        description="Every account registered in HireLoop. Roles are verified and updated by the server on each request."
        actions={
          <button
            type="button"
            onClick={() => void loadUsers()}
            disabled={loading}
            className={secondaryButton}
          >
            <RefreshCw className={cn("size-3.5", isRefreshing && "animate-spin")} />
            Refresh
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {roleSummary.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={loading && !counts ? "…" : String(stat.value)}
            hint={stat.hint}
            icon={stat.icon}
            accent={stat.accent}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#6e6e78]" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or email..."
              aria-label="Search users by name or email"
              className={cn(inputClass, "pl-9")}
            />
          </div>

          <span className="text-[11px] text-[#6e6e78] sm:ml-auto">
            {pagination
              ? `${pagination.total} ${
                  pagination.total === 1 ? "user" : "users"
                } matched`
              : "Loading users…"}
          </span>
        </div>

        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Filter users by role"
        >
          {ROLE_FILTERS.map((filter) => {
            const active = roleFilter === filter.value

            return (
              <button
                key={filter.value}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setRoleFilter(filter.value)
                  setPage(1)
                }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                  active
                    ? "border-[#5c53fe]/40 bg-[#5c53fe]/15 text-[#c7c2ff]"
                    : "border-white/10 bg-[#1a1a1f] text-[#a0a0ab] hover:border-white/20 hover:text-white"
                )}
              >
                {filter.label}
                <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-[#a0a0ab]">
                  {loading && !counts
                    ? "…"
                    : filterCount(filter.value, counts)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {error && users.length > 0 ? (
        <div className="flex gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-sm text-red-300">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Unable to refresh users</p>
            <p className="mt-1 text-xs text-red-300/80">{error}</p>
          </div>
        </div>
      ) : null}

      <DashboardCard className="overflow-hidden">
        {loading && users.length === 0 ? (
          <TableShell>
            <thead>
              <tr>
                <Th>User</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Joined</Th>
                <Th>Status</Th>
                <Th className="text-right">Change role</Th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, index) => (
                <tr key={index}>
                  {Array.from({ length: 6 }).map((__, cell) => (
                    <Td key={cell}>
                      <span className="block h-3 w-full max-w-[120px] animate-pulse rounded bg-white/[0.06]" />
                    </Td>
                  ))}
                </tr>
              ))}
            </tbody>
          </TableShell>
        ) : users.length > 0 ? (
          <TableShell>
            <thead>
              <tr>
                <Th>User</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Joined</Th>
                <Th>Status</Th>
                <Th className="text-right">Change role</Th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelf = user.id === sessionUserId
                const draftRole = draftRoles[user.id] ?? user.role
                const isUpdating = updatingId === user.id
                const hasChange = draftRole !== user.role

                return (
                  <tr key={user.id} className="hover:bg-white/[0.02]">
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={user.name} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-[#ededef]">
                            {user.name}
                          </p>
                          {isSelf ? (
                            <p className="text-[10px] text-[#6e6e78]">
                              You
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <span className="break-all">{user.email}</span>
                    </Td>
                    <Td>
                      <RoleBadge role={user.role} />
                    </Td>
                    <Td>{formatDate(user.createdAt)}</Td>
                    <Td>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-[11px]",
                          user.emailVerified
                            ? "text-[#86efac]"
                            : "text-[#7c7c86]"
                        )}
                      >
                        <BadgeCheck className="size-3.5" />
                        {user.emailVerified ? "Verified" : "Unverified"}
                      </span>
                    </Td>
                    <Td>
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        <select
                          value={draftRole}
                          onChange={(event) =>
                            setDraftRoles((current) => ({
                              ...current,
                              [user.id]: event.target.value as AdminUserRole,
                            }))
                          }
                          disabled={isSelf || isUpdating}
                          aria-label={`New role for ${user.name}`}
                          title={
                            isSelf
                              ? "You cannot change your own admin role"
                              : undefined
                          }
                          className="rounded-lg border border-white/10 bg-[#0f0f13] px-2.5 py-1.5 text-xs text-[#d4d4d8] outline-none focus:border-[#5c53fe] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {ROLE_OPTIONS.map((role) => (
                            <option key={role} value={role}>
                              {ROLE_LABELS[role]}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => void handleRoleUpdate(user)}
                          disabled={isSelf || isUpdating || !hasChange}
                          title={
                            isSelf
                              ? "You cannot change your own admin role"
                              : undefined
                          }
                          className={cn(
                            primaryButton,
                            "px-3 py-1.5 text-xs"
                          )}
                        >
                          {isUpdating ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : null}
                          {isUpdating ? "Updating" : "Update"}
                        </button>
                      </div>
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </TableShell>
        ) : error ? (
          <EmptyState
            title="Unable to load users"
            description={error}
            action={
              <button
                type="button"
                onClick={() => void loadUsers()}
                className={secondaryButton}
              >
                <RefreshCw className="size-3.5" />
                Try again
              </button>
            }
          />
        ) : (
          <EmptyState
            title="No users found"
            description="No accounts match this search or role filter."
            action={
              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  setAppliedSearch("")
                  setRoleFilter("all")
                  setPage(1)
                }}
                className={secondaryButton}
              >
                Clear filters
              </button>
            }
          />
        )}

        {pagination && users.length > 0 ? (
          <div className="flex flex-col gap-3 border-t border-white/[0.07] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-[#6e6e78]">
              Showing {pageStart}–{pageEnd} of {totalUsers || pagination.total}{" "}
              users
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1.5 text-[11px] text-[#6e6e78]">
                Rows
                <select
                  value={limit}
                  onChange={(event) => {
                    setLimit(Number(event.target.value))
                    setPage(1)
                  }}
                  aria-label="Users per page"
                  className="rounded-lg border border-white/10 bg-[#0f0f13] px-2 py-1 text-[11px] text-[#d4d4d8] outline-none focus:border-[#5c53fe]"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={loading || page <= 1}
                className={cn(secondaryButton, "px-2.5 py-1.5 text-xs")}
              >
                <ChevronLeft className="size-3.5" />
                Previous
              </button>

              <span className="text-[11px] text-[#a0a0ab]">
                Page {pagination.page} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={loading || page >= totalPages}
                className={cn(secondaryButton, "px-2.5 py-1.5 text-xs")}
              >
                Next
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        ) : null}
      </DashboardCard>
    </div>
  )
}

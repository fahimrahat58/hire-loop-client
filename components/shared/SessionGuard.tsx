"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { authClient } from "@/app/lib/auth-client"
import {
  dashboardPathForRole,
  getDashboardRole,
  type DashboardRole,
} from "@/app/lib/roles"

const SIGN_IN_PATH = "/sign-in"

/**
 * Protects a dashboard area using the role from the authenticated Better Auth
 * session. Nothing is rendered until the session has been checked, and the
 * children are only mounted when the session role matches `requiredRole`.
 *
 * Passing an array allows a shared area (for example a job details page) to be
 * opened by more than one role. Omitting `requiredRole` only requires a valid
 * dashboard role.
 *
 * The role always comes from `authClient.useSession()`. URL parameters, form
 * input, local storage and custom headers are never consulted.
 *
 * A signed-in account with a missing or unrecognised role is denied dashboard
 * access instead of being treated as a seeker.
 */
export function SessionGuard({
  requiredRole,
  children,
}: {
  requiredRole?: DashboardRole | DashboardRole[]
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const { data: session, isPending } = authClient.useSession()

  // Session state only exists in the browser. The server renders the loading
  // state as well, so the first client render matches and hydration is stable.
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  const user = session?.user
  const isAuthenticated = Boolean(user)
  const role = getDashboardRole(user?.role)
  const allowedRoles = requiredRole
    ? Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole]
    : null
  const isAuthorized = Boolean(
    isAuthenticated && role && (!allowedRoles || allowedRoles.includes(role))
  )
  const ownDashboard = dashboardPathForRole(user?.role)

  // Signed-out visitors go to sign-in; signed-in visitors who opened a
  // different role's area go to their own dashboard. `null` means no redirect.
  const redirectTo = !isAuthenticated
    ? SIGN_IN_PATH
    : isAuthorized
      ? null
      : ownDashboard

  useEffect(() => {
    if (!hydrated || isPending || !redirectTo) return

    // Never replace the current URL with itself; this also keeps a stale link
    // or a bad role from creating a redirect loop.
    if (redirectTo === pathname) return

    router.replace(redirectTo)
  }, [hydrated, isPending, redirectTo, pathname, router])

  if (!hydrated || isPending) {
    return <GuardStatus message="Checking your session…" />
  }

  if (!isAuthenticated || !isAuthorized) {
    if (isAuthenticated && !role) {
      return (
        <GuardStatus message="We could not verify a valid dashboard role for this account. Sign in again or contact an administrator.">
          <button
            type="button"
            onClick={() => {
              void authClient
                .signOut()
                .then(() => router.replace(SIGN_IN_PATH))
            }}
            className="rounded-lg bg-[#5c53fe] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4b43e8]"
          >
            Sign out and sign in
          </button>
        </GuardStatus>
      )
    }

    return (
      <GuardStatus
        message={
          !isAuthenticated
            ? "Redirecting to sign in…"
            : "Redirecting to your dashboard…"
        }
      />
    )
  }

  return <>{children}</>
}

function GuardStatus({
  message,
  children,
}: {
  message: string
  children?: React.ReactNode
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-[#08080a] px-6 text-center text-white"
    >
      <Loader2 className="size-6 animate-spin text-[#5c53fe]" />
      <p className="max-w-md text-sm text-[#a0a0ab]">{message}</p>
      {children}
    </div>
  )
}

export { dashboardPathForRole, getDashboardRole }
export type { DashboardRole }

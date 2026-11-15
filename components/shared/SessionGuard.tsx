"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { authClient } from "@/app/lib/auth-client"

export type DashboardRole = "seeker" | "recruiter" | "admin"

const SIGN_IN_PATH = "/sign-in"

/**
 * Dashboard areas are limited to the three roles stored on the Better Auth user
 * document. A missing or unrecognised role is treated as "seeker", which is the
 * same default used when an account is created, so a bad value can never grant
 * recruiter or admin access.
 */
export function resolveDashboardRole(role: unknown): DashboardRole {
  return role === "admin" || role === "recruiter" ? role : "seeker"
}

/**
 * Protects a dashboard area using the role from the authenticated Better Auth
 * session. Nothing is rendered until the session has been checked, and the
 * children are only mounted when the session role matches `requiredRole`.
 *
 * The role always comes from `authClient.useSession()`. URL parameters, form
 * input, local storage and custom headers are never consulted.
 */
export function SessionGuard({
  requiredRole,
  children,
}: {
  requiredRole: DashboardRole
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
  const role = resolveDashboardRole(user?.role)
  const isAuthorized = isAuthenticated && role === requiredRole

  // Signed-out visitors go to sign-in; signed-in visitors who opened a
  // different role's area go to their own dashboard. `null` means no redirect.
  const redirectTo = !isAuthenticated
    ? SIGN_IN_PATH
    : isAuthorized
      ? null
      : `/dashboard/${role}`

  useEffect(() => {
    if (!hydrated || isPending || !redirectTo) return

    // Never replace the current URL with itself; this also keeps a stale link
    // or a bad role from creating a redirect loop.
    if (redirectTo === pathname) return

    router.replace(redirectTo)
  }, [hydrated, isPending, redirectTo, pathname, router])

  if (!hydrated || isPending || !isAuthorized) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-[#08080a] text-white"
      >
        <Loader2 className="size-6 animate-spin text-[#5c53fe]" />
        <p className="text-sm text-[#a0a0ab]">
          {!hydrated || isPending ? "Checking your session…" : "Redirecting…"}
        </p>
      </div>
    )
  }

  return <>{children}</>
}

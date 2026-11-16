"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { authClient } from "@/app/lib/auth-client"
import { DASHBOARD_HOME, getDashboardRole } from "@/app/lib/roles"

export default function DashboardIndexPage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  const role = getDashboardRole(session?.user?.role)

  useEffect(() => {
    if (isPending) return

    if (!session?.user) {
      router.replace("/sign-in")

      return
    }

    if (role) {
      router.replace(DASHBOARD_HOME[role])
    }
  }, [isPending, session, role, router])

  if (!isPending && session?.user && !role) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center text-[#a0a0ab]">
        <p className="text-sm">
          Your account does not have a valid dashboard role. Sign in again or
          contact an administrator.
        </p>

        <button
          type="button"
          onClick={() => {
            void authClient
              .signOut()
              .then(() => router.replace("/sign-in"))
          }}
          className="rounded-lg bg-[#5c53fe] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4b43e8]"
        >
          Sign out and sign in
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-[#a0a0ab]">
      <Loader2 className="size-6 animate-spin text-[#5c53fe]" />
      <p className="text-sm">Taking you to your dashboard…</p>
    </div>
  )
}

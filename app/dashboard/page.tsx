"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { authClient } from "@/app/lib/auth-client"
import { resolveDashboardRole } from "@/components/shared/SessionGuard"

export default function DashboardIndexPage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    if (isPending) return

    router.replace(`/dashboard/${resolveDashboardRole(session?.user?.role)}`)
  }, [isPending, session, router])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-[#a0a0ab]">
      <Loader2 className="size-6 animate-spin text-[#5c53fe]" />
      <p className="text-sm">Taking you to your dashboard…</p>
    </div>
  )
}

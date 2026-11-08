"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { authClient } from "@/app/lib/auth-client"

export default function DashboardIndexPage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    if (isPending) return

    const role = session?.user?.role
    const destination =
      role === "admin" || role === "recruiter" ? role : "seeker"

    router.replace(`/dashboard/${destination}`)
  }, [isPending, session, router])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-[#a0a0ab]">
      <Loader2 className="size-6 animate-spin text-[#5c53fe]" />
      <p className="text-sm">Taking you to your dashboard…</p>
    </div>
  )
}

"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

import { authClient } from "@/app/lib/auth-client"
import { getDashboardRole } from "@/app/lib/roles"

function BillingRedirectFallback() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-[#a0a0ab]">
      <Loader2 className="size-6 animate-spin text-[#5c53fe]" />
      <p className="text-sm">Taking you to billing…</p>
    </div>
  )
}

function BillingRedirectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    if (isPending) return

    const plan = searchParams.get("plan")
    const planQuery = plan ? `?plan=${encodeURIComponent(plan)}` : ""

    if (!session?.user) {
      const next = `/billing${planQuery}`
      router.replace(`/sign-in?callbackUrl=${encodeURIComponent(next)}`)
      return
    }

    const role = getDashboardRole(session.user.role)

    if (role === "seeker") {
      router.replace(`/dashboard/seeker/billing${planQuery}`)
      return
    }

    if (role === "recruiter") {
      router.replace(`/dashboard/recruiter/billing${planQuery}`)
      return
    }

    router.replace("/dashboard")
  }, [isPending, router, searchParams, session])

  return <BillingRedirectFallback />
}

export default function BillingRedirectPage() {
  return (
    <Suspense fallback={<BillingRedirectFallback />}>
      <BillingRedirectContent />
    </Suspense>
  )
}

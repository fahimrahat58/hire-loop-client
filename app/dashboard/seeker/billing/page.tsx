"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  CreditCard,
  Info,
  ReceiptText,
  ShieldCheck,
  UserRound,
  Wallet,
  Loader2,
  Crown,
  BriefcaseBusiness,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react"

import { authClient } from "@/app/lib/auth-client"
import { getBillingSummary, type BillingSummary } from "@/app/lib/jobs-api"
import {
  Avatar,
  DashboardCard,
  EmptyState,
  PageHeader,
  SectionCard,
  primaryButton,
} from "@/components/dashboard/ui"

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "")

const FREE_APPLICATION_LIMIT = 5

function formatDate(value?: Date | string | null) {
  if (!value) return "—"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "—"

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

async function getAuthToken() {
  const tokenResult = await authClient.token()
  const token = tokenResult.data?.token

  if (!token) {
    throw new Error("Your session has expired. Please sign in again.")
  }

  return token
}

export default function SeekerBillingPage() {
  const { data: session, isPending } = authClient.useSession()

  const [billing, setBilling] = useState<BillingSummary | null>(null)
  const [isLoadingBilling, setIsLoadingBilling] = useState(true)
  const [billingError, setBillingError] = useState("")
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutNotice, setCheckoutNotice] = useState<
    "idle" | "success" | "pending" | "canceled"
  >("idle")

  const checkoutHandledRef = useRef(false)

  useEffect(() => {
    if (isPending) return

    if (!session?.user || session.user.role !== "seeker") {
      setIsLoadingBilling(false)
      return
    }

    let cancelled = false

    const loadBilling = async () => {
      try {
        setIsLoadingBilling(true)
        setBillingError("")

        const data = await getBillingSummary()

        if (!cancelled) {
          setBilling(data)
        }
      } catch (error) {
        if (!cancelled) {
          setBillingError(
            error instanceof Error
              ? error.message
              : "Failed to load billing information."
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoadingBilling(false)
        }
      }
    }

    loadBilling()

    return () => {
      cancelled = true
    }
  }, [isPending, session?.user?.id, session?.user?.role])

  // Stripe redirects back with ?success=true, but that is never treated as
  // proof of payment. Poll the backend (updated by the verified webhook) until
  // it confirms the subscription, then clear the query string.
  useEffect(() => {
    if (checkoutHandledRef.current) return
    if (isPending || isLoadingBilling) return
    if (!session?.user || session.user.role !== "seeker") return
    if (typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)
    const success = params.get("success") === "true"
    const canceled = params.get("canceled") === "true"

    if (!success && !canceled) return

    checkoutHandledRef.current = true

    const clearQuery = () => {
      window.history.replaceState({}, "", window.location.pathname)
    }

    if (canceled) {
      setCheckoutNotice("canceled")
      toast.info("Checkout canceled. You have not been charged.")
      clearQuery()
      return
    }

    let cancelled = false

    const confirmSubscription = async () => {
      if (billing?.plan === "premium") {
        setCheckoutNotice("success")
        toast.success("Premium activated.")
        clearQuery()
        return
      }

      // The Stripe webhook can take a few seconds to reach the backend.
      for (let attempt = 0; attempt < 5; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000))

        if (cancelled) return

        try {
          const data = await getBillingSummary()

          if (cancelled) return

          setBilling(data)

          if (data.plan === "premium") {
            setCheckoutNotice("success")
            toast.success("Premium activated.")
            clearQuery()
            return
          }
        } catch {
          // Keep polling; the regular load flow surfaces network errors.
        }
      }

      if (!cancelled) {
        setCheckoutNotice("pending")
        clearQuery()
      }
    }

    void confirmSubscription()

    return () => {
      cancelled = true
    }
  }, [
    isPending,
    isLoadingBilling,
    billing?.plan,
    session?.user?.id,
    session?.user?.role,
  ])

  const handleUpgrade = async () => {
    try {
      setCheckoutLoading(true)
      setBillingError("")

      const token = await getAuthToken()

      const response = await fetch(
        `${API_URL}/api/billing/create-checkout-session`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({}),
        }
      )

      const body = await response.json().catch(() => null)

      if (!response.ok || !body?.success) {
        throw new Error(
          body?.message || "Unable to create Stripe checkout session."
        )
      }

      const checkoutUrl = body.data?.url || body.url

      if (!checkoutUrl) {
        throw new Error("Stripe checkout URL was not returned by the server.")
      }

      window.location.assign(checkoutUrl)
    } catch (error) {
      setBillingError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      )
      setCheckoutLoading(false)
    }
  }

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-white/[0.06]" />

        <div className="grid gap-4 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-48 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.03]"
            />
          ))}
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <DashboardCard>
        <EmptyState
          title="Sign in to view billing"
          description="Billing information is tied to your HireLoop account."
          action={
            <Link href="/sign-in" className={primaryButton}>
              Sign in
            </Link>
          }
        />
      </DashboardCard>
    )
  }

  if (session.user.role !== "seeker") {
    return (
      <DashboardCard>
        <EmptyState
          title="Billing is for job seeker accounts"
          description="Sign in with a job seeker account to view this page."
          action={
            <Link href="/dashboard" className={primaryButton}>
              Go to dashboard
            </Link>
          }
        />
      </DashboardCard>
    )
  }

  // Premium is granted only by the backend summary. A subscription that is
  // canceled at period end still counts until the paid period expires.
  const isPremium = billing?.plan === "premium"

  const subscriptionStatus = billing?.subscriptionStatus || "inactive"

  const statusLabel =
    subscriptionStatus === "inactive"
      ? "Free"
      : subscriptionStatus === "active"
        ? "Active"
        : subscriptionStatus === "canceled"
          ? "Canceled"
          : subscriptionStatus === "expired"
            ? "Expired"
            : subscriptionStatus === "past_due"
              ? "Past due"
              : subscriptionStatus

  const applicationLimit = billing?.applicationLimit ?? FREE_APPLICATION_LIMIT

  const applicationsUsed = billing?.applicationsUsed ?? 0

  const remainingApplications = Math.max(
    0,
    billing?.remainingApplications ?? applicationLimit - applicationsUsed
  )

  const hasReachedLimit = !isPremium && applicationsUsed >= applicationLimit

  const usagePercentage = isPremium
    ? 0
    : Math.min((applicationsUsed / applicationLimit) * 100, 100)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Manage your plan and monitor your application usage."
      />

      {billingError && (
        <div className="flex gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-sm text-red-300">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Billing information</p>
            <p className="mt-1 text-xs text-red-300/80">{billingError}</p>
          </div>
        </div>
      )}

      {checkoutNotice === "success" && (
        <div className="flex gap-3 rounded-xl border border-green-500/20 bg-green-500/[0.07] px-4 py-3 text-sm text-green-300">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Premium activated</p>
            <p className="mt-1 text-xs text-green-300/80">
              Your subscription was confirmed by Stripe and your account is now
              on Premium.
            </p>
          </div>
        </div>
      )}

      {checkoutNotice === "pending" && (
        <div className="flex gap-3 rounded-xl border border-[#60a5fa]/20 bg-[#60a5fa]/[0.06] px-4 py-3 text-sm text-[#bfdbfe]">
          <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin" />
          <div>
            <p className="font-medium">Payment received</p>
            <p className="mt-1 text-xs text-[#bfdbfe]/80">
              Stripe is still confirming your subscription. Refresh this page in
              a moment — Premium is activated only after the webhook is
              verified.
            </p>
          </div>
        </div>
      )}

      {isLoadingBilling ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-48 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.03]"
            />
          ))}
        </div>
      ) : (
        <>
          {hasReachedLimit && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.07] p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-400" />

                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-amber-300">
                    Free application limit reached
                  </h3>

                  <p className="mt-1 text-xs leading-relaxed text-amber-200/70">
                    You have used all {applicationLimit} free job applications.
                    Upgrade to Premium to apply for unlimited jobs.
                  </p>

                  <button
                    type="button"
                    onClick={handleUpgrade}
                    disabled={checkoutLoading}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-[#5c53fe] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#4c43ed] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {checkoutLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Crown className="size-4" />
                    )}
                    Upgrade to Premium
                    <ArrowUpRight className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-3">
            <DashboardCard className="flex flex-col p-5">
              <div className="flex items-start gap-3">
                <Avatar name={session.user.name || "User"} size="xl" />

                <div className="min-w-0 pt-1">
                  <h2 className="truncate text-lg font-semibold text-[#ededef]">
                    {session.user.name || "Your profile"}
                  </h2>

                  <p className="truncate text-xs text-[#a0a0ab]">
                    {session.user.email}
                  </p>

                  <span className="mt-2 inline-flex items-center rounded-full border border-[#5c53fe]/40 bg-[#5c53fe]/15 px-2 py-0.5 text-[10px] font-medium text-[#b8b2ff]">
                    Job Seeker
                  </span>
                </div>
              </div>

              <dl className="mt-5 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-[#a0a0ab]">
                  <UserRound className="size-3.5 text-[#6e6e78]" />
                  Account: {session.user.name || "—"}
                </div>

                <div className="flex items-center gap-2 text-[#a0a0ab]">
                  <ShieldCheck className="size-3.5 text-[#6e6e78]" />
                  Role: {session.user.role || "seeker"}
                </div>

                <div className="flex items-center gap-2 text-[#a0a0ab]">
                  <CreditCard className="size-3.5 text-[#6e6e78]" />
                  Member since{" "}
                  {formatDate(
                    session.user.createdAt as Date | string | undefined
                  )}
                </div>
              </dl>

              <Link
                href="/dashboard/seeker/settings"
                className="mt-auto inline-flex w-full items-center justify-center rounded-lg border border-white/10 bg-[#1a1a1f] px-3.5 py-2 text-[13px] font-medium text-[#d4d4d8] transition hover:border-white/20 hover:bg-[#222228]"
              >
                Manage account
              </Link>
            </DashboardCard>

            <SectionCard
              title="Current plan"
              description="Your active HireLoop subscription"
              bodyClassName="p-5"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#5c53fe]/15 text-[#b8b2ff]">
                  {isPremium ? (
                    <Crown className="size-5" />
                  ) : (
                    <CreditCard className="size-5" />
                  )}
                </span>

                <div>
                  <p className="text-[13px] font-semibold text-[#ededef]">
                    {billing?.planName || "Free"}
                  </p>

                  <p className="text-[11px] text-[#a0a0ab]">
                    {isPremium
                      ? subscriptionStatus === "canceled"
                        ? "Canceled — Premium until the period ends"
                        : "Premium subscription"
                      : subscriptionStatus === "canceled"
                        ? "Your subscription was canceled"
                        : subscriptionStatus === "expired"
                          ? "Your subscription has expired"
                          : subscriptionStatus === "past_due"
                            ? "Payment past due"
                            : "Free plan"}
                  </p>
                </div>

                <span
                  className={`ml-auto rounded-full px-2 py-1 text-[10px] font-medium ${
                    isPremium
                      ? subscriptionStatus === "canceled"
                        ? "border border-amber-500/20 bg-amber-500/10 text-amber-400"
                        : "border border-green-500/20 bg-green-500/10 text-green-400"
                      : subscriptionStatus === "expired"
                        ? "border border-red-500/20 bg-red-500/10 text-red-400"
                        : subscriptionStatus === "canceled"
                          ? "border border-amber-500/20 bg-amber-500/10 text-amber-400"
                          : "border border-white/10 bg-white/[0.05] text-[#a0a0ab]"
                  }`}
                >
                  {statusLabel}
                </span>
              </div>

              {isPremium ? (
                <div className="mt-5 rounded-lg border border-white/[0.06] bg-[#0f0f13] p-3">
                  <p className="text-[11px] text-[#7c7c86]">
                    {subscriptionStatus === "canceled"
                      ? "Premium access ends"
                      : "Current period ends"}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#ededef]">
                    {formatDate(billing?.currentPeriodEnd)}
                  </p>
                </div>
              ) : (
                <div className="mt-5">
                  <p className="text-xs leading-relaxed text-[#7c7c86]">
                    {subscriptionStatus === "canceled"
                      ? "Your subscription was canceled. Upgrade again to restore unlimited applications."
                      : subscriptionStatus === "expired"
                        ? "Your previous Premium subscription has expired. Upgrade again to restore unlimited applications."
                        : subscriptionStatus === "past_due"
                          ? "Your last payment could not be completed. Update your payment method to restore Premium."
                          : `Your free plan includes ${FREE_APPLICATION_LIMIT} job applications. Upgrade to Premium for unlimited applications.`}
                  </p>

                  {billing?.currentPeriodEnd &&
                    (subscriptionStatus === "expired" ||
                      subscriptionStatus === "past_due") && (
                      <div className="mt-4 rounded-lg border border-white/[0.06] bg-[#0f0f13] p-3">
                        <p className="text-[11px] text-[#7c7c86]">
                          {subscriptionStatus === "past_due"
                            ? "Payment was due"
                            : "Expired on"}
                        </p>
                        <p className="mt-1 text-sm font-medium text-[#ededef]">
                          {formatDate(billing.currentPeriodEnd)}
                        </p>
                      </div>
                    )}

                  {!hasReachedLimit && (
                    <button
                      type="button"
                      onClick={handleUpgrade}
                      disabled={checkoutLoading}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#5c53fe] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#4c43ed] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {checkoutLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Crown className="size-4" />
                      )}
                      Upgrade to Premium
                    </button>
                  )}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Application usage"
              description="Your job application allowance"
              bodyClassName="p-5"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#22c55e]/15 text-[#86efac]">
                  <BriefcaseBusiness className="size-5" />
                </span>

                <div>
                  <p className="text-[13px] font-semibold text-[#ededef]">
                    {isPremium
                      ? "Unlimited applications"
                      : `${remainingApplications} remaining`}
                  </p>

                  <p className="text-[11px] text-[#a0a0ab]">
                    {isPremium
                      ? "Premium plan allowance"
                      : `${applicationsUsed} of ${applicationLimit} used`}
                  </p>
                </div>
              </div>

              {!isPremium && (
                <>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                    <div
                      className="h-full rounded-full bg-[#5c53fe] transition-all"
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-[10px] text-[#7c7c86]">
                    <span>{applicationsUsed} used</span>
                    <span>{applicationLimit} total</span>
                  </div>

                  {hasReachedLimit && (
                    <p className="mt-4 text-xs font-medium text-amber-400">
                      You have reached your free application limit.
                    </p>
                  )}
                </>
              )}

              {isPremium && (
                <div className="mt-4 flex items-center gap-2 text-xs text-green-400">
                  <CheckCircle2 className="size-4" />
                  No application limit
                </div>
              )}
            </SectionCard>
          </div>

          <SectionCard
            title="Payment methods"
            description="Secure payment processing"
            bodyClassName="p-5"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#22c55e]/15 text-[#86efac]">
                <Wallet className="size-5" />
              </span>

              <div>
                <p className="text-[13px] font-medium text-[#ededef]">
                  Payments secured by Stripe
                </p>
                <p className="text-[11px] text-[#6e6e78]">
                  Your payment details are handled securely by Stripe.
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Invoices and payment history"
            description="Receipts and transaction records"
            bodyClassName="p-5"
          >
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-white/10 bg-[#0f0f13] px-6 py-10 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-white/[0.05] text-[#a0a0ab]">
                <ReceiptText className="size-5" />
              </span>

              <p className="mt-3 text-sm font-semibold text-[#ededef]">
                Invoice history
              </p>

              <p className="mt-1 max-w-md text-xs leading-relaxed text-[#7c7c86]">
                Your subscription invoices are managed through Stripe.
              </p>
            </div>
          </SectionCard>

          <div className="flex items-start gap-3 rounded-xl border border-[#60a5fa]/20 bg-[#60a5fa]/[0.06] px-4 py-3 text-[12px] text-[#bfdbfe]">
            <Info className="mt-0.5 size-4 shrink-0" />
            <p>
              Your application usage and subscription status are loaded from the
              HireLoop backend. Premium access is activated after Stripe
              confirms your subscription through the webhook.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Check,
  CreditCard,
  Crown,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  BriefcaseBusiness,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"

import { authClient } from "@/app/lib/auth-client"
import {
  getBillingSummary,
  type BillingSummary,
  type JobUser,
} from "@/app/lib/jobs-api"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function RecruiterBillingPage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession()

  const [billing, setBilling] = useState<BillingSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [checkoutNotice, setCheckoutNotice] = useState<
    "idle" | "success" | "pending" | "canceled"
  >("idle")

  const checkoutHandledRef = useRef(false)

  const currentUser = session?.user as
    | (NonNullable<typeof session>["user"] & { role?: string })
    | undefined

  const loadBilling = useCallback(async () => {
    if (!currentUser) return

    try {
      setLoading(true)

      const user: JobUser = {
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role || "recruiter",
      }

      const result = await getBillingSummary({ user })
      setBilling(result)
    } catch (error) {
      console.error("Billing fetch error:", error)
      toast.error("Failed to load billing information")
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    if (sessionLoading) return

    if (!currentUser) {
      setLoading(false)
      return
    }

    loadBilling()
  }, [sessionLoading, currentUser, loadBilling])

  // ?success=true is only a hint used to trigger polling. Premium is shown
  // only after the backend (updated by the verified Stripe webhook) confirms it.
  useEffect(() => {
    if (checkoutHandledRef.current) return
    if (sessionLoading || loading) return
    if (!currentUser) return
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

    const user: JobUser = {
      id: currentUser.id,
      email: currentUser.email,
      role: currentUser.role || "recruiter",
    }

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
          const data = await getBillingSummary({ user })

          if (cancelled) return

          setBilling(data)

          if (data.plan === "premium") {
            setCheckoutNotice("success")
            toast.success("Premium activated.")
            clearQuery()
            return
          }
        } catch {
          // Keep polling; the regular load flow surfaces errors.
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
  }, [sessionLoading, loading, billing?.plan, currentUser])

  const handleUpgrade = async () => {
    try {
      setUpgrading(true)

      const tokenResult = await authClient.token()
      const token = tokenResult?.data?.token

      if (!token) {
        toast.error("Authentication token not found. Please sign in again.")
        return
      }

      const response = await fetch(
        `${API_URL}/api/billing/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({}),
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to create Stripe checkout session"
        )
      }

      const checkoutUrl = result.data?.url || result.url

      if (!checkoutUrl) {
        throw new Error("Stripe checkout URL was not returned")
      }

      window.location.assign(checkoutUrl)
    } catch (error) {
      console.error("Upgrade error:", error)
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      )
    } finally {
      setUpgrading(false)
    }
  }

  const isPremium = billing?.plan === "premium"

  const subscriptionStatus = billing?.subscriptionStatus || "inactive"

  const statusLabel =
    subscriptionStatus === "inactive"
      ? "Inactive"
      : subscriptionStatus === "active"
        ? "Active"
        : subscriptionStatus === "canceled"
          ? "Canceled"
          : subscriptionStatus === "expired"
            ? "Expired"
            : subscriptionStatus === "past_due"
              ? "Past due"
              : subscriptionStatus

  const usage = billing?.publishedJobsUsed ?? 0

  const limit = billing?.publishedJobLimit ?? 5

  const remaining =
    billing?.remainingPublishedJobs ?? Math.max(0, limit - usage)

  const usagePercentage = isPremium
    ? 0
    : Math.min((usage / Math.max(limit, 1)) * 100, 100)

  const currentPeriodEnd = billing?.currentPeriodEnd
    ? new Date(billing.currentPeriodEnd).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  const statusDescription = isPremium
    ? subscriptionStatus === "canceled"
      ? `Canceled — Premium access continues until ${currentPeriodEnd || "the end of the billing period"}.`
      : "Your Premium subscription is active and will renew automatically."
    : subscriptionStatus === "canceled"
      ? "Your Premium subscription was canceled."
      : subscriptionStatus === "expired"
        ? "Your Premium subscription has expired."
        : subscriptionStatus === "past_due"
          ? "Your last payment failed. Update your payment method to restore Premium."
          : "You are on the Free plan."

  if (sessionLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
        <ShieldCheck className="h-10 w-10 text-gray-500" />
        <h2 className="text-xl font-semibold text-white">Sign in required</h2>
        <p className="text-sm text-gray-400">
          Please sign in to view your billing information.
        </p>
      </div>
    )
  }

  if (!billing) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <h2 className="text-xl font-semibold text-white">
          Unable to load billing
        </h2>
        <p className="text-sm text-gray-400">
          We couldn't retrieve your billing information.
        </p>
        <button
          onClick={loadBilling}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 pb-12 text-white">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Billing & Subscription
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Manage your recruiter subscription and published job limits.
          </p>
        </div>

        <button
          onClick={loadBilling}
          disabled={loading}
          className="flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-gray-300 transition hover:bg-white/[0.08] disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {checkoutNotice === "success" && (
        <div className="flex items-start gap-3 rounded-xl border border-green-500/20 bg-green-500/[0.07] px-4 py-3 text-sm text-green-300">
          <ShieldCheck size={18} className="mt-0.5 shrink-0" />
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
        <div className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/[0.07] px-4 py-3 text-sm text-blue-200">
          <Loader2 size={18} className="mt-0.5 shrink-0 animate-spin" />
          <div>
            <p className="font-medium">Payment received</p>
            <p className="mt-1 text-xs text-blue-200/80">
              Stripe is still confirming your subscription. Refresh in a moment
              — Premium is activated only after the webhook is verified.
            </p>
          </div>
        </div>
      )}

      {/* Current Plan */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#191919] p-6 sm:p-8">
          <div className="absolute -top-20 -right-16 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />

          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                  {isPremium ? <Crown size={24} /> : <CreditCard size={24} />}
                </div>

                <div>
                  <p className="text-sm text-gray-400">Current Plan</p>
                  <h2 className="mt-1 text-xl font-bold">{billing.planName}</h2>
                </div>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isPremium
                    ? "bg-blue-500/10 text-blue-400"
                    : "bg-white/10 text-gray-300"
                }`}
              >
                {isPremium ? "PREMIUM" : "FREE PLAN"}
              </span>
            </div>

            <div className="my-7 h-px bg-white/10" />

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-400">Subscription Status</p>
                <p className="mt-2 font-semibold">{statusLabel}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {statusDescription}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">
                  {isPremium && subscriptionStatus === "canceled"
                    ? "Premium Access Ends"
                    : "Current Billing Period Ends"}
                </p>
                <p className="mt-2 font-semibold">
                  {currentPeriodEnd || "Not available"}
                </p>
              </div>
            </div>

            {!isPremium && (
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
              >
                {upgrading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Redirecting to Stripe...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Upgrade to Premium
                  </>
                )}
              </button>
            )}

            {isPremium && (
              <div className="mt-8 flex items-center gap-2 text-sm font-medium text-blue-400">
                <ShieldCheck size={18} />
                You have access to unlimited published jobs.
              </div>
            )}
          </div>
        </div>

        {/* Job Usage */}
        <div className="rounded-2xl border border-white/10 bg-[#191919] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-500/10 p-3 text-orange-400">
              <BriefcaseBusiness size={22} />
            </div>
            <div>
              <h2 className="font-semibold">Published Jobs</h2>
              <p className="text-sm text-gray-400">Your current job usage</p>
            </div>
          </div>

          <div className="mt-8 flex items-end gap-2">
            <span className="text-4xl font-bold tabular-nums">{usage}</span>
            <span className="mb-1 text-gray-500">
              / {isPremium ? "Unlimited" : limit}
            </span>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{
                width: `${isPremium ? 100 : usagePercentage}%`,
              }}
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 text-sm">
            <span className="text-gray-400">
              {isPremium ? "Unlimited job slots" : "Remaining slots"}
            </span>
            <span className="font-semibold text-white">
              {isPremium ? "Unlimited" : remaining}
            </span>
          </div>

          <p className="mt-6 text-xs leading-5 text-gray-500">
            Only active published jobs count toward your plan limit. Draft and
            closed jobs do not count.
          </p>
        </div>
      </div>

      {/* Plans */}
      <div>
        <div className="mb-5">
          <h2 className="text-xl font-bold">Available Plan</h2>
          <p className="mt-1 text-sm text-gray-400">
            Choose the plan that fits your hiring needs.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Free Plan */}
          <div
            className={`rounded-2xl border p-6 ${
              !isPremium
                ? "border-blue-500/50 bg-blue-500/[0.04]"
                : "border-white/10 bg-[#191919]"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Free</h3>
              {!isPremium && (
                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                  Current Plan
                </span>
              )}
            </div>

            <div className="mt-5">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-sm text-gray-500"> / forever</span>
            </div>

            <p className="mt-3 text-sm text-gray-400">
              Get started with essential recruiter features.
            </p>

            <div className="my-6 h-px bg-white/10" />

            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex gap-3">
                <Check size={17} className="shrink-0 text-blue-400" />
                Up to 5 active published jobs
              </li>
              <li className="flex gap-3">
                <Check size={17} className="shrink-0 text-blue-400" />
                Manage job postings
              </li>
              <li className="flex gap-3">
                <Check size={17} className="shrink-0 text-blue-400" />
                View job applications
              </li>
              <li className="flex gap-3">
                <Check size={17} className="shrink-0 text-blue-400" />
                Basic recruiter dashboard
              </li>
            </ul>
          </div>

          {/* Premium Plan */}
          <div
            className={`relative overflow-hidden rounded-2xl border p-6 ${
              isPremium
                ? "border-blue-500/50 bg-blue-500/[0.04]"
                : "border-blue-500/30 bg-[#191919]"
            }`}
          >
            <div className="absolute top-0 right-0 rounded-bl-xl bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white">
              RECOMMENDED
            </div>

            <div className="flex items-center justify-between gap-3 pr-24">
              <h3 className="text-lg font-bold">Recruiter Premium</h3>
              {isPremium && (
                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                  Current Plan
                </span>
              )}
            </div>

            <div className="mt-5">
              <span className="text-4xl font-bold">Premium</span>
            </div>

            <p className="mt-3 text-sm text-gray-400">
              Remove job posting limits and grow your hiring.
            </p>

            <div className="my-6 h-px bg-white/10" />

            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex gap-3">
                <Check size={17} className="shrink-0 text-blue-400" />
                Unlimited active published jobs
              </li>
              <li className="flex gap-3">
                <Check size={17} className="shrink-0 text-blue-400" />
                Manage all your job postings
              </li>
              <li className="flex gap-3">
                <Check size={17} className="shrink-0 text-blue-400" />
                Manage job applications
              </li>
              <li className="flex gap-3">
                <Check size={17} className="shrink-0 text-blue-400" />
                Premium recruiter access
              </li>
            </ul>

            {!isPremium && (
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {upgrading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Please wait...
                  </>
                ) : (
                  <>
                    <Crown size={17} />
                    Upgrade Now
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Crown, TrendingUp, Zap, Plus, ArrowRight } from "lucide-react"

interface Plan {
  name: string
  planId: string
  priceMonthly: string
  priceYearly: string
  icon: React.ElementType
  highlighted?: boolean
  features: string[]
}

const plans: Plan[] = [
  {
    name: "Starter",
    planId: "starter",
    priceMonthly: "$0",
    priceYearly: "$0",
    icon: Crown,
    features: [
      "Daily AI match brief (top 5)",
      "Verified salary bands",
      "Company insight dashboards",
      "1-click apply, unlimited",
    ],
  },
  {
    name: "Growth",
    planId: "growth",
    priceMonthly: "$17",
    priceYearly: "$13",
    icon: TrendingUp,
    highlighted: true,
    features: [
      "Daily AI match brief (top 5)",
      "Verified salary bands",
      "Company insight dashboards",
      "1-click apply, unlimited",
    ],
  },
  {
    name: "Premium",
    planId: "premium",
    priceMonthly: "$99",
    priceYearly: "$79",
    icon: Zap,
    features: [
      "Everything in Pro",
      "Multi-profile career portfolios",
      "Shared talent rooms",
      "Recruiter view (read-only)",
    ],
  },
]

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-2 text-[10px] font-semibold tracking-widest text-indigo-400 uppercase sm:text-[11px]">
          <span>◆</span>
          <span>PRICING</span>
          <span>◆</span>
        </div>

        <h2 className="mt-3 text-2xl leading-tight font-bold tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
          Pay for the leverage,
          <br />
          not the listings
        </h2>

        {/* Toggle Switch */}
        <div className="mt-6 flex items-center rounded-full border border-white/10 bg-[#1c1a1d]/80 p-1.5 backdrop-blur-md sm:mt-8">
          <button
            type="button"
            onClick={() => setIsYearly(false)}
            className={`rounded-full px-4 py-2 text-xs font-medium transition-all sm:px-5 ${
              !isYearly
                ? "bg-white text-black shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Monthly
          </button>

          <button
            type="button"
            onClick={() => setIsYearly(true)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all sm:px-5 ${
              isYearly
                ? "bg-white text-black shadow-md"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Yearly
            <span className="rounded-full bg-pink-500/20 px-2 py-0.5 text-[10px] font-bold text-pink-400">
              25%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:mt-14 lg:grid-cols-3">
        {plans.map((plan, idx) => {
          const Icon = plan.icon

          return (
            <div
              key={idx}
              className={`relative flex flex-col justify-between rounded-2xl border p-5 backdrop-blur-md transition-all sm:rounded-3xl sm:p-6 lg:p-8 ${
                plan.highlighted
                  ? "border-white/30 bg-[#251f28]/90 shadow-[0_0_60px_rgba(168,85,247,0.18)] ring-1 ring-white/20"
                  : "border-white/10 bg-[#1c1a1d]/60 hover:border-white/20 hover:bg-[#221f24]/70"
              }`}
            >
              <div>
                {/* Header: Icon, Name & Price */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="rounded-xl bg-white/5 p-2.5 text-pink-400">
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className="text-base font-bold text-white sm:text-lg">
                      {plan.name}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-white sm:text-3xl">
                      {isYearly ? plan.priceYearly : plan.priceMonthly}
                    </span>

                    <span className="text-[10px] text-gray-400 sm:text-xs">
                      /month
                    </span>
                  </div>
                </div>

                {/* Subtitle */}
                <p className="mt-6 text-xs font-medium text-gray-300 sm:mt-8">
                  Start building your insights hub:
                </p>

                {/* Feature List */}
                <ul className="mt-4 space-y-3">
                  {plan.features.map((feature, fIdx) => (
                    <li
                      key={fIdx}
                      className="flex items-start gap-2.5 text-xs leading-relaxed text-gray-400 sm:text-sm"
                    >
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/10 text-gray-300">
                        <Plus className="h-3 w-3" />
                      </span>

                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-8 sm:mt-10">
                <Link
                  href={`/billing?plan=${encodeURIComponent(plan.planId)}`}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-4 py-3.5 text-xs font-semibold transition-all sm:px-5 ${
                    plan.highlighted
                      ? "bg-white text-black shadow-lg hover:bg-gray-100"
                      : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  <span>Choose This Plan</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  Crown,
  TrendingUp,
  Zap,
  Plus,
  ArrowRight,
  Check,
  Sparkles,
  ShieldCheck,
  HelpCircle,
} from "lucide-react"

interface Plan {
  name: string
  priceMonthly: string
  priceYearly: string
  description: string
  icon: React.ElementType
  highlighted?: boolean
  features: string[]
}

const plans: Plan[] = [
  {
    name: "Starter",
    priceMonthly: "$0",
    priceYearly: "$0",
    description: "Everything you need to start your job search.",
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
    priceMonthly: "$17",
    priceYearly: "$13",
    description: "Get more insights and accelerate your career.",
    icon: TrendingUp,
    highlighted: true,
    features: [
      "Everything in Starter",
      "Advanced AI job matching",
      "Priority job recommendations",
      "Detailed company insights",
      "Application tracking",
      "Priority support",
    ],
  },
  {
    name: "Premium",
    priceMonthly: "$99",
    priceYearly: "$79",
    description: "Advanced tools for ambitious professionals.",
    icon: Zap,
    features: [
      "Everything in Growth",
      "Multi-profile career portfolios",
      "Shared talent rooms",
      "Recruiter view (read-only)",
      "Advanced career analytics",
      "Dedicated support",
    ],
  },
]

const faqs = [
  {
    question: "Can I use HireLoop for free?",
    answer:
      "Yes! Our Starter plan is completely free. You can explore jobs, receive AI match briefs, view salary information and apply for jobs.",
  },
  {
    question: "Can I change my plan later?",
    answer:
      "Yes. You can upgrade or change your subscription whenever you need. Your selected plan will determine which features are available.",
  },
  {
    question: "What is the difference between monthly and yearly billing?",
    answer:
      "Monthly billing charges you every month. Yearly billing gives you a lower monthly price when you choose an annual subscription.",
  },
  {
    question: "Can I cancel my subscription?",
    answer:
      "You can manage your subscription and cancellation from your account billing settings.",
  },
]

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <main className="relative overflow-hidden text-white">
      {/* Background Decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-600/10 blur-[130px]"
      />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-10 text-center sm:px-6 sm:pt-24 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-2 text-xs font-semibold tracking-wider text-indigo-300">
          <Sparkles className="size-4" />
          SIMPLE & TRANSPARENT PRICING
        </div>

        <h1 className="mx-auto mt-6 max-w-3xl text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
          Invest in your career.
          <span className="block bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Unlock your potential.
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
          Find better opportunities, discover valuable career insights and make
          smarter career decisions with HireLoop.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-xs text-gray-400 sm:text-sm">
          <span className="flex items-center gap-2">
            <Check className="size-4 text-green-400" />
            No hidden fees
          </span>
          <span className="flex items-center gap-2">
            <Check className="size-4 text-green-400" />
            Flexible plans
          </span>
          <span className="flex items-center gap-2">
            <Check className="size-4 text-green-400" />
            Cancel anytime
          </span>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Choose your perfect plan
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
            Start free and upgrade whenever you're ready for more.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 flex items-center rounded-full border border-white/10 bg-[#1c1a1d]/80 p-1.5 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={`rounded-full px-5 py-2.5 text-xs font-semibold transition-all ${
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
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-all ${
                isYearly
                  ? "bg-white text-black shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Yearly
              <span className="rounded-full bg-pink-500/20 px-2 py-0.5 text-[10px] font-bold text-pink-400">
                SAVE 25%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon

            return (
              <div
                key={plan.name}
                className={`relative flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-md transition-all sm:rounded-3xl sm:p-8 ${
                  plan.highlighted
                    ? "border-purple-400/50 bg-[#251f28]/95 shadow-[0_0_60px_rgba(168,85,247,0.18)] ring-1 ring-purple-400/20"
                    : "border-white/10 bg-[#1c1a1d]/70 hover:border-white/20"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-1.5 text-[10px] font-bold tracking-wider whitespace-nowrap text-white uppercase">
                    Most Popular
                  </div>
                )}

                <div>
                  {/* Plan Header */}
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white/5 p-3 text-pink-400">
                      <Icon className="size-5" />
                    </div>

                    <h3 className="text-xl font-bold">{plan.name}</h3>
                  </div>

                  <p className="mt-5 min-h-10 text-sm leading-6 text-gray-400">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tracking-tight">
                      {isYearly ? plan.priceYearly : plan.priceMonthly}
                    </span>
                    <span className="text-sm text-gray-400">/month</span>
                  </div>

                  {isYearly && plan.priceMonthly !== "$0" && (
                    <p className="mt-2 text-xs text-green-400">
                      Billed annually
                    </p>
                  )}

                  <div className="my-7 border-t border-white/10" />

                  <p className="mb-5 text-xs font-semibold tracking-wider text-gray-300 uppercase">
                    What's included
                  </p>

                  {/* Features */}
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm leading-5 text-gray-400"
                      >
                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                          <Check className="size-3.5" />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plan Button */}
                <Link
                  href="/sign-up"
                  className={`mt-10 flex w-full items-center justify-between rounded-xl px-5 py-4 text-sm font-semibold transition-all ${
                    plan.highlighted
                      ? "bg-white text-black shadow-lg hover:bg-gray-200"
                      : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  <span>Choose {plan.name}</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            )
          })}
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          All prices are displayed in USD. Features and billing are subject to
          the selected subscription plan.
        </p>
      </section>

      {/* Why HireLoop */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            More than just a job board
          </h2>
          <p className="mt-3 text-sm text-gray-400">
            Tools that help you make better career decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <Sparkles className="size-7 text-indigo-400" />
            <h3 className="mt-5 font-bold">AI-powered matching</h3>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Discover opportunities that better match your skills and career
              goals.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <ShieldCheck className="size-7 text-green-400" />
            <h3 className="mt-5 font-bold">Verified insights</h3>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Make informed decisions with company and salary insights.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:col-span-2 lg:col-span-1">
            <TrendingUp className="size-7 text-pink-400" />
            <h3 className="mt-5 font-bold">Career growth</h3>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Organize your applications and move toward your next career
              milestone.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
            <HelpCircle className="size-6" />
          </div>

          <h2 className="mt-5 text-2xl font-bold sm:text-3xl">
            Frequently asked questions
          </h2>

          <p className="mt-3 text-sm text-gray-400">
            Everything you need to know about HireLoop pricing.
          </p>
        </div>

        <div className="mt-10 space-y-3">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group rounded-xl border border-white/10 bg-white/[0.03] p-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-white">
                {faq.question}

                <Plus className="size-4 shrink-0 text-gray-400 transition-transform group-open:rotate-45" />
              </summary>

              <p className="mt-4 text-sm leading-7 text-gray-400">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-5xl px-4 pt-10 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#211d30] to-[#17151c] px-6 py-12 text-center sm:px-10 sm:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-1/2 size-64 -translate-x-1/2 rounded-full bg-purple-500/20 blur-[90px]"
          />

          <div className="relative">
            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
              Ready for your next opportunity?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-400">
              Join HireLoop and take the next step toward building a better
              career.
            </p>

            <Link
              href="/sign-up"
              className="mt-8 inline-flex items-center justify-center gap-3 rounded-xl bg-[#7b61ff] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#6a4fff]"
            >
              Get Started
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

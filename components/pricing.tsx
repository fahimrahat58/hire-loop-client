"use client";

import React, { useState } from "react";
import { Crown, TrendingUp, Zap, Plus, ArrowRight } from "lucide-react";

interface Plan {
  name: string;
  priceMonthly: string;
  priceYearly: string;
  icon: React.ElementType;
  highlighted?: boolean;
  features: string[];
}

const plans: Plan[] = [
  {
    name: "Starter",
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
    priceMonthly: "$17",
    priceYearly: "$13",
    icon: TrendingUp,
    highlighted: true, // 👈 2nd card is highlighted
    features: [
      "Daily AI match brief (top 5)",
      "Verified salary bands",
      "Company insight dashboards",
      "1-click apply, unlimited",
    ],
  },
  {
    name: "Premium",
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
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-indigo-400">
          <span>◆</span>
          <span>PRICING</span>
          <span>◆</span>
        </div>

        <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          Pay for the leverage,
          <br />
          not the listings
        </h2>

        {/* Toggle Switch */}
        <div className="mt-8 flex items-center rounded-full border border-white/10 bg-[#1c1a1d]/80 p-1.5 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setIsYearly(false)}
            className={`rounded-full px-5 py-2 text-xs font-medium transition-all ${
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
            className={`flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-medium transition-all ${
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
      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan, idx) => {
          const Icon = plan.icon;
          return (
            <div
              key={idx}
              className={`relative flex flex-col justify-between rounded-3xl border p-8 backdrop-blur-md transition-all ${
                plan.highlighted
                  ? "border-white/30 bg-[#251f28]/90 shadow-[0_0_60px_rgba(168,85,247,0.18)] ring-1 ring-white/20"
                  : "border-white/10 bg-[#1c1a1d]/60 hover:border-white/20 hover:bg-[#221f24]/70"
              }`}
            >
              <div>
                {/* Header: Icon, Name & Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white/5 p-2.5 text-pink-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-lg font-bold text-white">
                      {plan.name}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">
                      {isYearly ? plan.priceYearly : plan.priceMonthly}
                    </span>
                    <span className="text-xs text-gray-400">/month</span>
                  </div>
                </div>

                {/* Subtitle */}
                <p className="mt-8 text-xs font-medium text-gray-300">
                  Start building your insights hub:
                </p>

                {/* Feature List */}
                <ul className="mt-4 space-y-3">
                  {plan.features.map((feature, fIdx) => (
                    <li
                      key={fIdx}
                      className="flex items-center gap-2.5 text-xs text-gray-400"
                    >
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/10 text-gray-300">
                        <Plus className="h-3 w-3" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-10">
                <button
                  type="button"
                  className={`flex w-full items-center justify-between rounded-xl px-5 py-3.5 text-xs font-semibold transition-all ${
                    plan.highlighted
                      ? "bg-white text-black shadow-lg hover:bg-gray-100"
                      : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  <span>Choose This Plan</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
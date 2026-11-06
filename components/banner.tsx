import React from "react"
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  Users,
  Star,
  Sparkles,
} from "lucide-react"
import { Globe } from "@/components/globe"

const stats = [
  {
    icon: Briefcase,
    value: "50K",
    label: "Active Jobs",
    accent: "text-indigo-300",
  },
  {
    icon: Building2,
    value: "12K",
    label: "Companies",
    accent: "text-violet-300",
  },
  {
    icon: Users,
    value: "2M",
    label: "Job Seekers",
    accent: "text-fuchsia-300",
  },
  {
    icon: Star,
    value: "97%",
    label: "Satisfaction Rate",
    accent: "text-amber-300",
  },
]

export function Banner() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Ambient spotlight behind the hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] bg-[radial-gradient(ellipse_65%_100%_at_50%_0%,rgba(123,97,255,0.22),transparent_70%)]"
      />

      {/* Planet / globe backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_68%,transparent_96%)]"
      >
        <Globe />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pt-16 pb-20 text-center sm:px-6 lg:px-8">
        {/* Top Badge */}
        <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pr-4 pl-2 text-xs font-medium text-gray-300 shadow-[0_0_40px_-12px_rgba(139,92,246,0.6)] backdrop-blur-md">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/15 text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span>
            <span className="font-semibold text-white">50,000+</span>{" "}
            <span className="text-gray-400">NEW JOBS THIS MONTH</span>
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
          Find Your{" "}
          <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">
            Dream Job
          </span>{" "}
          Today
        </h1>

        {/* Subtitle */}
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base">
          HireLoop connects top talent with world-class companies. Browse
          thousands of curated opportunities and land your next role — faster.
        </p>

        {/* Search Bar */}
        <div className="mt-8 w-full max-w-3xl">
          <div className="relative flex flex-col items-center rounded-2xl border border-white/10 bg-[#1e1e1e]/80 p-2 shadow-2xl backdrop-blur-xl transition-colors focus-within:border-indigo-400/40 sm:flex-row sm:rounded-full">
            {/* Input 1: Job Title */}
            <div className="flex w-full items-center gap-3 px-4 py-2.5 sm:w-1/2">
              <Search className="h-5 w-5 shrink-0 text-gray-400" />
              <input
                type="text"
                placeholder="Job title, skill or company"
                className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
              />
            </div>

            {/* Divider */}
            <div className="hidden h-6 w-[1px] bg-white/10 sm:block" />

            {/* Input 2: Location */}
            <div className="flex w-full items-center gap-3 px-4 py-2.5 sm:w-1/2">
              <MapPin className="h-5 w-5 shrink-0 text-gray-400" />
              <input
                type="text"
                placeholder="Location or Remote"
                className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
              />
            </div>

            {/* Search Button */}
            <button
              type="button"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 p-3.5 text-white shadow-lg shadow-indigo-950/40 transition-all hover:bg-indigo-500 sm:mt-0 sm:w-auto sm:rounded-full"
              aria-label="Search jobs"
            >
              <Search className="h-5 w-5" />
              <span className="text-sm font-semibold sm:hidden">
                Search jobs
              </span>
            </button>
          </div>

          {/* Trending Tags */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400">
            <span className="font-medium text-gray-400">Trending Position</span>
            {["Product Designer", "AI Engineering", "DevOps Engineer"].map(
              (tag) => (
                <button
                  key={tag}
                  type="button"
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-medium text-gray-300 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  {tag}
                </button>
              )
            )}
          </div>
        </div>

        {/* Globe Overlay Text */}
        <div className="mt-52 max-w-xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Assisting over{" "}
            <span className="bg-gradient-to-r from-indigo-300 to-pink-300 bg-clip-text font-bold text-transparent">
              15,000 job seekers
            </span>
            <br />
            find their dream positions.
          </h2>
        </div>

        {/* Stat Cards Grid */}
        <div className="mt-24 grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="group flex flex-col items-start justify-between rounded-2xl border border-white/10 bg-[#1a1818]/60 p-6 text-left backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#1f1c20]/70"
              >
                <div
                  className={`rounded-lg border border-white/5 bg-white/5 p-2 transition-colors group-hover:bg-white/10 ${stat.accent}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-8">
                  <span className="text-3xl font-bold tracking-tight text-white">
                    {stat.value}
                  </span>
                  <p className="mt-1 text-xs text-gray-400">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

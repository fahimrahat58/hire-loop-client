import React from "react"
import {
  Search,
  TrendingUp,
  Building2,
  Bookmark,
  Sparkles,
  FileText,
  ShieldCheck,
  LineChart,
} from "lucide-react"

interface FeatureItem {
  icon: React.ElementType
  title: string
  description: string
}

const features: FeatureItem[] = [
  {
    icon: Search,
    title: "Smart Search",
    description: "Find your ideal job with advanced filters.",
  },
  {
    icon: LineChart,
    title: "Salary Insights",
    description: "Get real salary data to negotiate confidently.",
  },
  {
    icon: Building2,
    title: "Top Companies",
    description: "Apply to vetted companies that are hiring.",
  },
  {
    icon: Bookmark,
    title: "Saved Jobs",
    description: "Manage apps & favorites on your dashboard.",
  },
  {
    icon: Sparkles,
    title: "One-Click Apply",
    description: "Simplify your job applications for an easier process!",
  },
  {
    icon: FileText,
    title: "Resume Builder",
    description: "Create professional resumes with modern templates.",
  },
  {
    icon: ShieldCheck,
    title: "Skill-Based Matching",
    description: "Discover jobs that match your skills and experience.",
  },
  {
    icon: TrendingUp,
    title: "Career Growth Resources",
    description: "Boost your career with quick interview tips.",
  },
]

export default function Feature() {
  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      {/* Section Header */}
      <div className="flex flex-col items-center px-2 text-center">
        <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.15em] text-indigo-400 uppercase sm:text-[11px] sm:tracking-widest">
          <span>◆</span>
          <span>FEATURES JOB</span>
          <span>◆</span>
        </div>

        <h2 className="mt-3 text-2xl leading-tight font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          Everything you need
          <br />
          to succeed
        </h2>
      </div>

      {/* Features Grid */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:mt-14 lg:grid-cols-4 lg:gap-6">
        {features.map((feature, idx) => {
          const Icon = feature.icon

          return (
            <div
              key={idx}
              className="flex min-w-0 flex-col items-start rounded-xl border border-white/10 bg-[#1c1a1d]/60 p-5 backdrop-blur-md transition-all hover:border-white/20 hover:bg-[#221f24]/70 sm:rounded-2xl sm:p-6"
            >
              {/* Icon Box */}
              <div className="rounded-xl bg-white/5 p-3 text-indigo-400">
                <Icon className="size-5" />
              </div>

              {/* Title & Description */}
              <div className="mt-5 sm:mt-6">
                <h3 className="text-sm leading-snug font-bold text-white sm:text-base">
                  {feature.title}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-gray-400 sm:text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

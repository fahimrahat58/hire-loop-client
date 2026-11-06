import React from "react";
import {
  Search,
  TrendingUp,
  Building2,
  Bookmark,
  Sparkles,
  FileText,
  ShieldCheck,
  LineChart,
} from "lucide-react";

interface FeatureItem {
  icon: React.ElementType;
  title: string;
  description: string;
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
];

export default function Feature() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-indigo-400">
          <span>◆</span>
          <span>FEATURES JOB</span>
          <span>◆</span>
        </div>

        <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          Everything you need
          <br />
          to succeed
        </h2>
      </div>

      {/* Features Grid (4 columns x 2 rows layout matching the screenshot) */}
      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div
              key={idx}
              className="flex flex-col items-start rounded-2xl border border-white/10 bg-[#1c1a1d]/60 p-6 backdrop-blur-md transition-all hover:border-white/20 hover:bg-[#221f24]/70"
            >
              {/* Icon Box */}
              <div className="rounded-xl bg-white/5 p-3 text-indigo-400">
                <Icon className="h-5 w-5" />
              </div>

              {/* Title & Description */}
              <div className="mt-6">
                <h3 className="text-base font-bold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-400">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
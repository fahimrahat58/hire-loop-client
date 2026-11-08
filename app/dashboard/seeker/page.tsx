import Link from "next/link"
import {
  ArrowUpRight,
  BellRing,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  MessageSquare,
  Pencil,
  Sparkles,
  Trophy,
} from "lucide-react"
import {
  seekerActivity,
  seekerProfile,
  seekerStats,
  seekerStatusData,
} from "@/app/lib/dashboard-data"
import {
  Avatar,
  DashboardCard,
  PageHeader,
  ProgressBar,
  SectionCard,
  StatCard,
  primaryButton,
  secondaryButton,
} from "@/components/dashboard/ui"
import { ApplicationStatusChart } from "@/components/dashboard/charts"

const statIcons = [Bookmark, FileText, CalendarDays, Trophy]
const statAccents = ["violet", "blue", "amber", "green"] as const

const activityIcon = {
  info: FileText,
  accent: Sparkles,
  success: MessageSquare,
}

const activityTone = {
  info: "bg-[#60a5fa]/12 text-[#93c5fd]",
  accent: "bg-[#5c53fe]/15 text-[#b8b2ff]",
  success: "bg-[#22c55e]/12 text-[#86efac]",
}

export default function SeekerDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Welcome back, Alex Rivera"
        description="Here is a snapshot of your job search. Keep the momentum going — you have 3 interviews lined up."
        actions={
          <>
            <Link href="/dashboard/seeker/jobs" className={primaryButton}>
              Browse jobs
              <ArrowUpRight className="size-3.5" />
            </Link>
            <Link href="/dashboard/seeker/settings" className={secondaryButton}>
              <Pencil className="size-3.5" />
              Edit profile
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {seekerStats.map((stat, index) => {
          const Icon = statIcons[index] ?? FileText
          return (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              hint={stat.hint}
              icon={Icon}
              accent={statAccents[index] ?? "violet"}
            />
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardCard className="flex flex-col p-5">
          <div className="flex items-start gap-3">
            <Avatar name={seekerProfile.name} size="xl" />
            <div className="min-w-0 pt-1">
              <h2 className="truncate text-lg font-semibold text-[#ededef]">
                {seekerProfile.name}
              </h2>
              <p className="text-xs text-[#a0a0ab]">{seekerProfile.headline}</p>
              <span className="mt-2 inline-flex items-center rounded-full border border-[#5c53fe]/40 bg-[#5c53fe]/15 px-2 py-0.5 text-[10px] font-medium text-[#b8b2ff]">
                {seekerProfile.plan}
              </span>
            </div>
          </div>

          <dl className="mt-5 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-[#a0a0ab]">
              <Mail className="size-3.5 text-[#6e6e78]" />
              <span className="truncate">{seekerProfile.email}</span>
            </div>
            <div className="flex items-center gap-2 text-[#a0a0ab]">
              <MapPin className="size-3.5 text-[#6e6e78]" />
              {seekerProfile.location}
            </div>
            <div className="flex items-center gap-2 text-[#a0a0ab]">
              <CheckCircle2 className="size-3.5 text-[#6e6e78]" />
              Member since {seekerProfile.memberSince}
            </div>
          </dl>

          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between text-[11px]">
              <span className="text-[#7c7c86]">Profile strength</span>
              <span className="font-semibold text-[#ededef]">82%</span>
            </div>
            <ProgressBar value={82} max={100} />
            <p className="mt-2 text-[11px] text-[#6e6e78]">
              Add two more skills to reach 100% and appear higher in recruiter
              search.
            </p>
          </div>

          <Link
            href="/dashboard/seeker/settings"
            className={`${secondaryButton} mt-auto w-full`}
          >
            <Pencil className="size-3.5" />
            Edit profile
          </Link>
        </DashboardCard>

        <SectionCard
          title="Application status"
          description="Distribution across all 24 submitted applications"
          className="lg:col-span-2"
          bodyClassName="p-5"
        >
          <ApplicationStatusChart data={seekerStatusData} />
        </SectionCard>
      </div>

      <SectionCard
        title="Recent activity"
        action={
          <Link
            href="/dashboard/seeker/applications"
            className="text-xs font-medium text-[#b8b2ff] transition hover:text-white"
          >
            View all activity
          </Link>
        }
        bodyClassName="divide-y divide-white/[0.05]"
      >
        {seekerActivity.map((item) => {
          const Icon = activityIcon[item.tone] ?? BellRing
          return (
            <div
              key={item.id}
              className="flex items-start gap-3 px-5 py-4 transition hover:bg-white/[0.02]"
            >
              <span
                className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${activityTone[item.tone]}`}
              >
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-[#d4d4d8]">{item.title}</p>
                <p className="mt-0.5 text-[11px] text-[#6e6e78]">{item.time}</p>
              </div>
            </div>
          )
        })}
      </SectionCard>
    </div>
  )
}

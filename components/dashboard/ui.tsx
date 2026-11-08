import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/* ------------------------------- primitives ------------------------------- */

export function DashboardCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.07] bg-[#141418] shadow-[0_1px_2px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.035)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: React.ReactNode
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <div className="mb-2">{eyebrow}</div> : null}
        <h1 className="text-[22px] leading-tight font-semibold tracking-tight text-[#ededef] sm:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm text-[#a0a0ab]">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}

export function SectionCard({
  title,
  description,
  action,
  className,
  bodyClassName,
  children,
}: {
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
  bodyClassName?: string
  children: React.ReactNode
}) {
  return (
    <DashboardCard className={cn("overflow-hidden", className)}>
      {title || action ? (
        <div className="flex flex-col gap-3 border-b border-white/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title ? (
              <h2 className="text-base font-semibold text-[#ededef]">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-xs text-[#7c7c86]">{description}</p>
            ) : null}
          </div>
          {action}
        </div>
      ) : null}
      <div className={cn(bodyClassName)}>{children}</div>
    </DashboardCard>
  )
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "violet",
}: {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  accent?: "violet" | "blue" | "green" | "amber" | "red"
}) {
  const accents: Record<string, string> = {
    violet: "bg-[#5c53fe]/15 text-[#a79fff]",
    blue: "bg-[#60a5fa]/15 text-[#93c5fd]",
    green: "bg-[#22c55e]/15 text-[#86efac]",
    amber: "bg-[#f59e0b]/15 text-[#fcd34d]",
    red: "bg-[#ef4444]/15 text-[#fca5a5]",
  }

  return (
    <DashboardCard className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-[#a0a0ab]">{label}</p>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg",
            accents[accent]
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-[#ededef]">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-[#7c7c86]">{hint}</p> : null}
    </DashboardCard>
  )
}

/* --------------------------------- badges --------------------------------- */

const badgeStyles: Record<string, string> = {
  Applied: "bg-[#60a5fa]/14 text-[#93c5fd] border-[#60a5fa]/30",
  "Under Review": "bg-[#f59e0b]/14 text-[#fcd34d] border-[#f59e0b]/30",
  Review: "bg-[#f59e0b]/14 text-[#fcd34d] border-[#f59e0b]/30",
  Shortlisted: "bg-[#5c53fe]/16 text-[#b8b2ff] border-[#8f88ff]/30",
  Rejected: "bg-[#ef4444]/14 text-[#fca5a5] border-[#ef4444]/30",
  Offered: "bg-[#22c55e]/14 text-[#86efac] border-[#22c55e]/30",
  Active: "bg-[#22c55e]/14 text-[#86efac] border-[#22c55e]/30",
  Approved: "bg-[#22c55e]/14 text-[#86efac] border-[#22c55e]/30",
  Success: "bg-[#22c55e]/14 text-[#86efac] border-[#22c55e]/30",
  Paid: "bg-[#22c55e]/14 text-[#86efac] border-[#22c55e]/30",
  Closed: "bg-white/[0.06] text-[#a0a0ab] border-white/10",
  Draft: "bg-[#f59e0b]/14 text-[#fcd34d] border-[#f59e0b]/30",
  Pending: "bg-[#f59e0b]/14 text-[#fcd34d] border-[#f59e0b]/30",
  Suspended: "bg-[#ef4444]/14 text-[#fca5a5] border-[#ef4444]/30",
  Failed: "bg-[#ef4444]/14 text-[#fca5a5] border-[#ef4444]/30",
  Refunded: "bg-white/[0.06] text-[#a0a0ab] border-white/10",
}

export function StatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap",
        badgeStyles[status] ?? "border-white/10 bg-white/[0.06] text-[#a0a0ab]",
        className
      )}
    >
      {status}
    </span>
  )
}

/* --------------------------------- helpers -------------------------------- */

export const primaryButton =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#5c53fe] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#4d44f0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c53fe] disabled:cursor-not-allowed disabled:opacity-50"

export const secondaryButton =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-[#1a1a1f] px-3.5 py-2 text-[13px] font-medium text-[#d4d4d8] transition hover:border-white/20 hover:bg-[#222228] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c53fe] disabled:cursor-not-allowed disabled:opacity-50"

export const ghostButton =
  "inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-[#a0a0ab] transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5c53fe]"

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}) {
  const sizes = {
    sm: "size-8 text-[11px]",
    md: "size-9 text-xs",
    lg: "size-12 text-sm",
    xl: "size-20 text-xl",
  }

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#5c53fe] to-[#8f88ff] font-semibold text-white ring-2 ring-white/10",
        sizes[size],
        className
      )}
      aria-hidden="true"
    >
      {initials || "HL"}
    </span>
  )
}

export function ProgressBar({
  value,
  max,
  className,
}: {
  value: number
  max: number
  className?: string
}) {
  const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100))

  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-white/[0.07]", className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemax={max}
      aria-valuemin={0}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#5c53fe] to-[#8f88ff] transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function FieldLabel({
  children,
  htmlFor,
}: {
  children: React.ReactNode
  htmlFor?: string
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-medium text-[#a0a0ab]"
    >
      {children}
    </label>
  )
}

export const inputClass =
  "w-full rounded-lg border border-white/10 bg-[#0f0f13] px-3 py-2.5 text-sm text-[#ededef] transition outline-none placeholder:text-[#5e5e68] focus:border-[#5c53fe] focus:ring-2 focus:ring-[#5c53fe]/20"

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <p className="text-sm font-semibold text-[#ededef]">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-[#7c7c86]">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

export function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">
        {children}
      </table>
    </div>
  )
}

export function Th({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <th
      scope="col"
      className={cn(
        "border-b border-white/[0.07] bg-[#1a1a1f] px-4 py-2.5 text-[10px] font-semibold tracking-[0.08em] text-[#6e6e78] uppercase",
        className
      )}
    >
      {children}
    </th>
  )
}

export function Td({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <td className={cn("border-b border-white/[0.05] px-4 py-3 text-[13px] text-[#a0a0ab]", className)}>
      {children}
    </td>
  )
}

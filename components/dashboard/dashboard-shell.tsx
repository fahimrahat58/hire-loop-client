"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Bell, ChevronRight, Menu, Search, Sparkles, X } from "lucide-react"

import { authClient } from "@/app/lib/auth-client"
import { roleMeta, type Role } from "@/app/lib/dashboard-data"
import { dashboardNav } from "./nav-config"
import { Avatar } from "./ui"
import { cn } from "@/lib/utils"

function resolveRole(
  pathname: string | null,
  sessionRole?: string | null
): Role {
  if (pathname?.startsWith("/dashboard/seeker")) return "seeker"
  if (pathname?.startsWith("/dashboard/recruiter")) return "recruiter"
  if (pathname?.startsWith("/dashboard/admin")) return "admin"

  if (pathname?.startsWith("/dashboard/jobs")) {
    return sessionRole === "admin" ? "admin" : "recruiter"
  }

  if (sessionRole === "recruiter" || sessionRole === "admin") {
    return sessionRole
  }

  return "seeker"
}

const roleSwitch: { role: Role; label: string }[] = [
  { role: "seeker", label: "Seeker" },
  { role: "recruiter", label: "Recruiter" },
  { role: "admin", label: "Admin" },
]

const sidebarCta: Record<Role, { label: string; href: string }> = {
  seeker: {
    label: "Complete your profile",
    href: "/dashboard/seeker/settings",
  },
  recruiter: {
    label: "Post a new job",
    href: "/dashboard/recruiter/jobs/new",
  },
  admin: {
    label: "Review platform revenue",
    href: "/dashboard/admin/payments",
  },
}

function UserAvatar({
  name,
  image,
  size = "sm",
}: {
  name: string
  image?: string | null
  size?: "sm" | "md"
}) {
  const sizeClass = size === "md" ? "size-10" : "size-8"

  if (!image) {
    return <Avatar name={name} size={size} />
  }

  return (
    <img
      src={image}
      alt={`${name}'s profile`}
      referrerPolicy="no-referrer"
      className={cn(
        sizeClass,
        "shrink-0 rounded-full border border-white/10 object-cover"
      )}
    />
  )
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const { data: session, isPending } = authClient.useSession()

  const [openPath, setOpenPath] = useState<string | null>(null)

  const mobileOpen = openPath !== null && openPath === pathname

  const sessionRole = session?.user?.role
  const role = resolveRole(pathname, sessionRole)

  const name = session?.user?.name?.trim() || roleMeta[role].demoName
  const email = session?.user?.email || roleMeta[role].demoEmail
  const image = session?.user?.image || null

  const closeMobileNav = () => setOpenPath(null)
  const openMobileNav = () => setOpenPath(pathname)

  useEffect(() => {
    if (isPending || !session?.user) return

    const userRole = session.user.role

    if (userRole === "admin" || !userRole) return

    if (userRole !== role) {
      router.replace(`/dashboard/${userRole}`)
    }
  }, [isPending, session, role, router])

  const handleLogout = async () => {
    await authClient.signOut()
    router.push("/")
    router.refresh()
  }

  const sidebar = (
    <SidebarContent
      role={role}
      pathname={pathname}
      name={name}
      email={email}
      image={image}
      onNavigate={closeMobileNav}
    />
  )

  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-white/[0.06] bg-[#08080a] lg:flex lg:flex-col">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeMobileNav}
          className={cn(
            "absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
        />

        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col border-r border-white/10 bg-[#08080a] shadow-2xl transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <button
            type="button"
            aria-label="Close navigation"
            onClick={closeMobileNav}
            className="absolute top-4 right-3 z-10 rounded-lg p-2 text-[#a0a0ab] transition hover:bg-white/[0.06] hover:text-white"
          >
            <X className="size-4" />
          </button>

          {sidebar}
        </aside>
      </div>

      {/* Main column */}
      <div className="flex min-h-screen flex-col lg:pl-[248px]">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-white/[0.06] bg-[#0e0e11]/95 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={openMobileNav}
            aria-label="Open navigation"
            className="rounded-lg border border-white/10 p-2 text-[#a0a0ab] transition hover:bg-white/[0.06] hover:text-white lg:hidden"
          >
            <Menu className="size-4" />
          </button>

          {/* Search */}
          <form
            className="relative hidden max-w-sm flex-1 sm:block"
            onSubmit={(event) => event.preventDefault()}
          >
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#6e6e78]" />

            <input
              type="search"
              aria-label="Search"
              placeholder={roleMeta[role].search}
              className="h-9 w-full rounded-lg border border-white/[0.07] bg-[#141418] pr-3 pl-9 text-[13px] text-[#ededef] transition outline-none placeholder:text-[#6e6e78] focus:border-[#5c53fe] focus:ring-2 focus:ring-[#5c53fe]/20"
            />
          </form>

          <div className="ml-auto flex items-center gap-2">
            {!isPending && !session?.user ? (
              <div className="hidden items-center gap-1 rounded-lg border border-white/[0.07] bg-[#141418] p-1 md:flex">
                <span className="px-1.5 text-[10px] font-semibold tracking-wider text-[#6e6e78] uppercase">
                  Preview
                </span>

                {roleSwitch.map((item) => (
                  <Link
                    key={item.role}
                    href={`/dashboard/${item.role}`}
                    className={cn(
                      "rounded-md px-2 py-1 text-[11px] font-medium transition",
                      role === item.role
                        ? "bg-[#232327] text-[#f4f4f5]"
                        : "text-[#a0a0ab] hover:bg-white/[0.05] hover:text-white"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              aria-label="Notifications"
              className="relative rounded-lg border border-white/[0.07] bg-[#141418] p-2 text-[#a0a0ab] transition hover:border-white/20 hover:text-white"
            >
              <Bell className="size-4" />
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[#5c53fe]" />
            </button>

            {/* Header profile */}
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.07] bg-[#141418] py-1 pr-2 pl-1">
              <UserAvatar name={name} image={image} />

              <div className="hidden pr-1 leading-tight sm:block">
                <p className="max-w-[120px] truncate text-xs font-semibold text-[#ededef]">
                  {name}
                </p>

                <p className="text-[10px] text-[#6e6e78]">
                  {roleMeta[role].label}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 bg-[#0e0e11] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto w-full max-w-[1280px]">{children}</div>
        </main>
      </div>
    </div>
  )
}

function SidebarContent({
  role,
  pathname,
  name,
  email,
  image,
  onNavigate,
}: {
  role: Role
  pathname: string | null
  name: string
  email: string
  image?: string | null
  onNavigate: () => void
}) {
  const meta = roleMeta[role]
  const dashboardRoot = `/dashboard/${role}`

  const isActive = (href: string) => {
    if (href === dashboardRoot) {
      return pathname === href || pathname === `${href}/`
    }

    return pathname === href || Boolean(pathname?.startsWith(`${href}/`))
  }

  const visibleNavItems = dashboardNav[role].filter(
    (item) =>
      item.label.toLowerCase() !== "my company" &&
      item.label.toLowerCase() !== "billing"
  )

  return (
    <div className="flex h-full min-h-0 flex-col px-4 pt-5 pb-4">
      {/* Logo */}
      <div className="px-1">
        <Link
          href="/"
          onClick={onNavigate}
          className="inline-flex items-center gap-2"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-[#5c53fe] text-white shadow-lg shadow-[#5c53fe]/25">
            <Sparkles className="size-4" />
          </span>

          <span className="text-[20px] font-extrabold tracking-tight">
            <span className="text-blue-500">hire</span>
            <span className="text-orange-500">loop</span>
          </span>
        </Link>

        <p className="mt-2 pl-1 text-[10px] font-semibold tracking-[0.18em] text-[#6e6e78] uppercase">
          {meta.subtitle}
        </p>
      </div>

      {/* User profile */}
      <div className="mt-5 rounded-xl border border-white/[0.07] bg-[#141416] p-3">
        <div className="flex items-center gap-2.5">
          <UserAvatar name={name} image={image} size="md" />

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-[#ededef]">
              {name}
            </p>

            <p className="truncate text-[11px] text-[#7c7c86]">{meta.label}</p>
          </div>
        </div>

        <p className="mt-2 truncate text-[11px] text-[#6e6e78]">{email}</p>

        <span className="mt-2 inline-flex items-center rounded-full border border-[#5c53fe]/40 bg-[#5c53fe]/15 px-2 py-0.5 text-[10px] font-medium text-[#b8b2ff]">
          {meta.badge}
        </span>
      </div>

      {/* Dashboard Navigation */}
      <nav className="mt-5 space-y-1" aria-label="Dashboard">
        {visibleNavItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition",
                active
                  ? "bg-[#232327] text-[#f4f4f5]"
                  : "text-[#a1a4aa] hover:bg-white/[0.04] hover:text-white"
              )}
            >
              {active && (
                <span className="absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r bg-[#5c53fe]" />
              )}

              <Icon className="size-4 shrink-0" />

              <span className="flex-1 truncate">{item.label}</span>

              {active && <ChevronRight className="size-3.5 text-[#6e6e78]" />}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

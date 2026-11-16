"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { UserRound, Menu, X } from "lucide-react"

import { authClient } from "@/app/lib/auth-client"

export function Navbar() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const { data: session, isPending } = authClient.useSession()

  const handleLogout = async () => {
    await authClient.signOut()
    setIsMenuOpen(false)
    router.push("/")
    router.refresh()
  }

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="relative z-20 mx-auto w-[95%] max-w-7xl rounded-xl border border-white/[0.06] bg-white/[0.02] shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-5 sm:py-4 lg:px-10">
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="shrink-0 text-xl font-extrabold tracking-tight sm:text-[22px]"
        >
          <span className="text-blue-500">hire</span>
          <span className="text-orange-500">loop</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-5 text-sm font-medium text-gray-200 md:flex lg:gap-9">
          <Link href="/jobs" className="transition hover:text-white">
            Browse Jobs
          </Link>
          <Link href="/company" className="transition hover:text-white">
            Company
          </Link>
          <Link href="/pricing" className="transition hover:text-white">
            Pricing
          </Link>
          <Link href="/dashboard" className="transition hover:text-white">
            Dashboard
          </Link>
        </nav>

        {/* Auth Actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          {!isPending && session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="flex min-w-0 items-center gap-2 text-sm font-medium text-gray-200 transition hover:text-white"
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={`${session.user.name || "User"}'s profile`}
                    referrerPolicy="no-referrer"
                    className="size-8 shrink-0 rounded-full border border-white/10 object-cover sm:size-9"
                  />
                ) : (
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-gray-300 sm:size-9">
                    <UserRound className="size-4" />
                  </span>
                )}

                <span className="hidden max-w-28 truncate font-semibold text-white sm:block lg:max-w-none">
                  {session.user.name}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 sm:px-4 sm:text-sm"
              >
                Logout
              </button>
            </>
          ) : !isPending ? (
            <>
              <Link
                href="/sign-in"
                className="rounded-md border border-white/10 px-3 py-2 text-xs font-medium whitespace-nowrap text-gray-200 transition hover:bg-white/10 hover:text-white sm:px-4 sm:text-sm"
              >
                Sign in
              </Link>

              <Link
                href="/sign-up"
                className="rounded-md bg-[#7b61ff] px-3 py-2 text-xs font-semibold whitespace-nowrap text-white transition hover:bg-[#6a4fff] sm:px-4 sm:text-sm"
              >
                Get Started
              </Link>
            </>
          ) : null}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex size-9 items-center justify-center rounded-md border border-white/10 text-white transition hover:bg-white/10 md:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="flex flex-col gap-1 border-t border-white/[0.08] px-4 py-3 text-sm font-medium text-gray-200 md:hidden">
          <Link
            href="/jobs"
            onClick={closeMenu}
            className="rounded-lg px-3 py-3 transition hover:bg-white/[0.06] hover:text-white"
          >
            Browse Jobs
          </Link>

          <Link
            href="/company"
            onClick={closeMenu}
            className="rounded-lg px-3 py-3 transition hover:bg-white/[0.06] hover:text-white"
          >
            Company
          </Link>

          <Link
            href="/pricing"
            onClick={closeMenu}
            className="rounded-lg px-3 py-3 transition hover:bg-white/[0.06] hover:text-white"
          >
            Pricing
          </Link>

          <Link
            href="/dashboard"
            onClick={closeMenu}
            className="rounded-lg px-3 py-3 transition hover:bg-white/[0.06] hover:text-white"
          >
            Dashboard
          </Link>
        </nav>
      )}
    </header>
  )
}

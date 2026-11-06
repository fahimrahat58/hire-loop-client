"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/app/lib/auth-client"

export function Navbar() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  const handleLogout = async () => {
    await authClient.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header className="relative z-20 mx-auto flex w-[95%] max-w-7xl items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-5 shadow-lg backdrop-blur-sm lg:px-10">
      <Link href="/" className="text-[22px] font-extrabold tracking-tight">
        <span className="text-blue-500">hire</span>
        <span className="text-orange-500">loop</span>
      </Link>

      <nav className="hidden items-center gap-9 text-sm font-medium text-gray-200 md:flex">
        <Link href="#" className="transition hover:text-white">
          Browse Jobs
        </Link>
        <Link href="#" className="transition hover:text-white">
          Company
        </Link>
        <Link href="#" className="transition hover:text-white">
          Pricing
        </Link>
      </nav>

      <div className="flex items-center gap-4">
        {!isPending && session?.user ? (
          <>
            <span className="hidden text-sm font-medium text-gray-200 sm:block">
              Welcome,{" "}
              <span className="font-semibold text-white">
                {session.user.name}
              </span>
            </span>

            <button
              onClick={handleLogout}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Logout
            </button>
          </>
        ) : !isPending ? (
          <>
            <Link
              href="/sign-in"
              className="hidden text-sm font-medium text-gray-200 transition hover:text-white sm:block"
            >
              Sign in
            </Link>

            <Link
              href="/sign-up"
              className="rounded-md bg-[#7b61ff] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6a4fff]"
            >
              Get Started
            </Link>
          </>
        ) : null}
      </div>
    </header>
  )
}

"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"

/**
 * The public site chrome (navbar, footer and the decorative background
 * columns) is hidden on dashboard routes so the dashboard can own the whole
 * viewport.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith("/dashboard")

  if (isDashboard) {
    return <>{children}</>
  }

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "repeating-linear-gradient(to right, #3a2a21 0px, #3a2a21 80px, #141414 80px, #141414 160px)",
        }}
      />

      <Navbar />

      <div className="relative z-10">
        {children}
        <Footer />
      </div>
    </>
  )
}

"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"

/**
 * The public site chrome (navbar, footer and decorative background
 * columns) is hidden on dashboard routes.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith("/dashboard")

  if (isDashboard) {
    return <>{children}</>
  }

  return (
    <>
      {/* Responsive Background Columns */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "repeating-linear-gradient(to right, #3a2a21 0px, #3a2a21 40px, #141414 40px, #141414 80px)",
        }}
      />

      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <div className="relative z-10 min-h-screen">
        {children}
        <Footer />
      </div>
    </>
  )
}

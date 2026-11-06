import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import "./globals.css"

export const metadata: Metadata = {
  title: "HireLoop",
  description: "Find Your Dream Job Today",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="relative min-h-screen overflow-x-hidden bg-[#141414] font-sans text-white">
        {/* Background columns */}
        <div
          className="pointer-events-none fixed inset-0"
          style={{
            background:
              "repeating-linear-gradient(to right, #3a2a21 0px, #3a2a21 80px, #141414 80px, #141414 160px)",
          }}
        />

        {/* Bottom glow */}
        <div className="pointer-events-none fixed bottom-0 left-1/2 h-[350px] w-[800px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[150px]" />

        {/* Glowing globe */}
        <div
          className="pointer-events-none fixed -bottom-[580px] left-1/2 h-[760px] w-[760px] -translate-x-1/2 rounded-full border border-indigo-400/40"
          style={{
            background:
              "radial-gradient(circle at 50% 32%, rgba(129,140,248,0.35) 0%, rgba(59,76,202,0.18) 42%, rgba(10,12,35,0.95) 78%)",
            boxShadow:
              "0 -24px 110px rgba(99,102,241,0.55), inset 0 24px 90px rgba(129,140,248,0.28)",
          }}
        />

        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  )
}

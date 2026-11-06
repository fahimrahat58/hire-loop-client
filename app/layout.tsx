import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import Footer from "@/components/footer"
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
        {/* Background columns — fixed so they continue behind every section, including the transparent footer */}
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
      </body>
    </html>
  )
}

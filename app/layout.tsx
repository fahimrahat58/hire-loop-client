import type { Metadata } from "next"
import { SiteChrome } from "@/components/site-chrome"
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
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  )
}

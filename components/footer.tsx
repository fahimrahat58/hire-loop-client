import React from "react"
import Link from "next/link"
import { Globe } from "lucide-react"

export default function Footer() {
  return (
    <footer className="relative bg-transparent py-16 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          {/* Brand Info & Socials */}
          <div className="flex flex-col justify-between lg:col-span-2">
            <div>
              <Link
                href="/"
                className="flex items-center gap-1 text-2xl font-black tracking-tight text-white"
              >
                <span>hireloop</span>
                <span className="flex gap-0.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  <span className="h-2 w-2 rounded-full bg-pink-500" />
                </span>
              </Link>

              <p className="mt-4 max-w-sm text-xs leading-relaxed text-gray-400">
                The AI-native career platform. Built for people who take their
                work seriously.
              </p>
            </div>

            {/* Social Icons */}
            <div className="mt-8 flex items-center gap-5">
              {/* Facebook */}
              <Link
                href="#"
                aria-label="Facebook"
                className="text-gray-400 transition-colors hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M13.5 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.5 1.6-1.5h1.7V3.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.3v3.2h2.8V21h3.4z" />
                </svg>
              </Link>

              {/* Website */}
              <Link
                href="#"
                aria-label="Website"
                className="text-gray-400 transition-colors hover:text-white"
              >
                <Globe className="h-5 w-5" />
              </Link>

              {/* LinkedIn */}
              <Link
                href="#"
                aria-label="LinkedIn"
                className="text-gray-400 transition-colors hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52zM7.93 18.6H4.95V9h2.98v9.6zM6.44 7.69a1.73 1.73 0 1 1 0-3.46 1.73 1.73 0 0 1 0 3.46zM19.05 18.6h-2.97v-4.67c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.75H9.77V9h2.85v1.31h.04c.4-.75 1.37-1.55 2.82-1.55 3.01 0 3.57 1.98 3.57 4.55v5.29z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Product */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">
              Product
            </h3>
            <ul className="space-y-3 text-xs">
              <li>
                <Link href="#" className="transition-colors hover:text-white">
                  Job discovery
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-white">
                  Worker AI
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-white">
                  Companies
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-white">
                  Salary data
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigations */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">
              Navigations
            </h3>
            <ul className="space-y-3 text-xs">
              <li>
                <Link href="#" className="transition-colors hover:text-white">
                  Help center
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-white">
                  Career library
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">
              Resources
            </h3>
            <ul className="space-y-3 text-xs">
              <li>
                <Link href="#" className="transition-colors hover:text-white">
                  Brand Guideline
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-white">
                  Newsroom
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between pt-8 text-[11px] text-gray-500 sm:flex-row">
          <p>Copyright 2024 — Programming Hero</p>

          <div className="mt-4 flex items-center gap-6 sm:mt-0">
            <Link href="#" className="transition-colors hover:text-gray-300">
              Terms & Policy
            </Link>

            <Link href="#" className="transition-colors hover:text-gray-300">
              Privacy Guideline
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

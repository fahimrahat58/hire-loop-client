"use client";

import { Flame, MapPin, Search } from "lucide-react";

export function Banner() {
  return (
    <main className="relative z-10 flex flex-col items-center px-4 pb-40 pt-14 md:pt-20">
      <div className="w-full max-w-3xl px-5 py-10 text-center md:px-10 md:py-12">

        {/* Badge */}
        <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.18em] text-amber-400">
          <Flame className="h-4 w-4 text-orange-500" />
          <span>56,800+ NEW JOBS THIS MONTH</span>
        </div>

        {/* Heading */}
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white md:text-[44px] md:leading-[1.1]">
          Find Your Dream Job Today
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-gray-400 md:text-[15px]">
          HireLoop connects top talent with world-class companies. Browse
          thousands of curated opportunities and land your next role — faster.
        </p>

        {/* Search bar */}
        <form className="mx-auto mt-8 flex w-full max-w-2xl items-center gap-1 rounded-lg border border-white/10 bg-[#1a1a1a]/90 p-1.5">
          <label className="flex min-w-0 flex-1 items-center gap-2.5 px-3">
            <Search className="h-4 w-4 shrink-0 text-gray-400" />
            <input
              type="text"
              placeholder="Job title, skill or company"
              className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
            />
          </label>

          <span className="h-6 w-px shrink-0 bg-white/10" />

          <label className="flex min-w-0 flex-1 items-center gap-2.5 px-3">
            <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
            <input
              type="text"
              placeholder="Location or Remote"
              className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
            />
          </label>

          <button
            type="submit"
            aria-label="Search"
            className="flex h-10 w-11 shrink-0 items-center justify-center rounded-md bg-[#7b61ff] text-white transition hover:bg-[#6a4fff]"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>

        {/* Trending */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-gray-500">Trending Position:</span>

          {["Product Designer", "AI Engineering", "DevOps Engineer"].map(
            (item) => (
              <span
                key={item}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-gray-300"
              >
                {item}
              </span>
            )
          )}
        </div>
      </div>
    </main>
  );
}
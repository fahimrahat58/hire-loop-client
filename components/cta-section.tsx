import React from "react";

export default function CtaSection() {
  return (
    <section className="relative overflow-hidden py-32 text-center">
     

      {/* Wireframe Globe & Glow Background */}
      <div className="pointer-events-none absolute -bottom-[650px] left-1/2 h-[1100px] w-[1400px] -translate-x-1/2 overflow-hidden rounded-full">
        {/* Radial Ambient Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.4)_0%,rgba(30,27,75,0.25)_45%,transparent_75%)] blur-3xl" />

        {/* Wireframe SVG Grid Arcs */}
        <svg
          className="absolute inset-0 h-full w-full opacity-40"
          viewBox="0 0 1000 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Latitude Rings */}
          <ellipse cx="500" cy="1000" rx="350" ry="280" stroke="#818cf8" strokeWidth="1" strokeDasharray="4 4" />
          <ellipse cx="500" cy="1000" rx="550" ry="440" stroke="#818cf8" strokeWidth="1" />
          <ellipse cx="500" cy="1000" rx="750" ry="600" stroke="#818cf8" strokeWidth="1" />
          <ellipse cx="500" cy="1000" rx="950" ry="750" stroke="#818cf8" strokeWidth="1" />

          {/* Longitude Lines */}
          <path d="M500 0L500 1000" stroke="#818cf8" strokeWidth="1" />
          <path d="M500 0C380 350 180 700 0 1000" stroke="#818cf8" strokeWidth="1" />
          <path d="M500 0C620 350 820 700 1000 1000" stroke="#818cf8" strokeWidth="1" />
          <path d="M500 0C250 350 80 750 0 1000" stroke="#818cf8" strokeWidth="0.5" opacity="0.6" />
          <path d="M500 0C750 350 920 750 1000 1000" stroke="#818cf8" strokeWidth="0.5" opacity="0.6" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-3xl px-4">
        <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
          Your next role is
          <br />
          already looking for you
        </h2>

        <p className="mt-4 text-sm text-gray-400 sm:text-base">
          Build a profile in three minutes. The matches start arriving tomorrow morning.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            className="rounded-full bg-white px-7 py-3.5 text-xs font-semibold text-black shadow-lg transition-all hover:bg-gray-100"
          >
            Create a free account
          </button>
          <button
            type="button"
            className="rounded-full border border-white/10 bg-white/5 px-7 py-3.5 text-xs font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10"
          >
            View pricing
          </button>
        </div>
      </div>
    </section>
  );
}
export function Globe() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* Purple halo above the rim */}
      <div className="absolute top-[460px] left-1/2 h-[300px] w-[1200px] -translate-x-1/2 rounded-full bg-[#7c5cff]/30 blur-[90px]" />
      <div className="absolute top-[500px] left-1/2 h-[220px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-500/25 blur-[70px]" />

      {/* Planet — large arc, top just above the "Assisting over…" text */}
      <div
        className="absolute top-[560px] left-1/2 h-[1600px] w-[1600px] -translate-x-1/2 overflow-hidden rounded-full"
        style={{
          background: [
            "radial-gradient(ellipse 1100px 260px at 50% 0%, rgba(196,181,253,0.65) 0%, rgba(139,92,246,0.35) 45%, transparent 72%)",
            "radial-gradient(circle at 36% 18%, rgba(100,116,139,0.16) 0%, transparent 32%)",
            "radial-gradient(circle at 63% 14%, rgba(71,85,105,0.14) 0%, transparent 28%)",
            "radial-gradient(circle at 52% 28%, rgba(30,27,75,0.4), transparent 55%)",
            "linear-gradient(to bottom, rgba(27,24,64,0.88) 0%, rgba(13,13,43,0.86) 26%, rgba(6,6,20,0.9) 62%, rgba(3,3,8,0.94) 100%)",
          ].join(","),
          boxShadow:
            "inset 0 24px 60px rgba(167,139,250,0.5), inset 0 -80px 120px rgba(0,0,0,0.9), 0 -8px 50px rgba(139,92,246,0.6), 0 -40px 110px rgba(99,102,241,0.4)",
        }}
      >
        {/* Faint surface patches */}
        <div className="absolute top-[8%] left-[24%] h-32 w-56 rounded-full bg-slate-400/5 blur-xl" />
        <div className="absolute top-[14%] left-[38%] h-24 w-44 rounded-full bg-indigo-300/5 blur-lg" />
        <div className="absolute top-[7%] left-[56%] h-28 w-52 rounded-full bg-slate-400/5 blur-xl" />
        <div className="absolute top-[18%] left-[66%] h-20 w-36 rounded-full bg-indigo-400/5 blur-lg" />
        <div className="absolute top-[24%] left-[46%] h-16 w-48 rounded-full bg-slate-500/5 blur-xl" />

        {/* Tiny stars */}
        <span className="absolute top-[11%] left-[31%] h-1 w-1 rounded-full bg-white/40" />
        <span className="absolute top-[6%] left-[44%] h-0.5 w-0.5 rounded-full bg-white/30" />
        <span className="absolute top-[10%] left-[58%] h-1 w-1 rounded-full bg-white/35" />
        <span className="absolute top-[13%] left-[70%] h-0.5 w-0.5 rounded-full bg-white/25" />
        <span className="absolute top-[20%] left-[39%] h-0.5 w-0.5 rounded-full bg-white/25" />

        {/* Bright rim arc — fades out at the sides */}
        <svg viewBox="0 0 1600 1600" className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="globe-rim" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
              <stop offset="18%" stopColor="#a78bfa" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#ddd6fe" stopOpacity="1" />
              <stop offset="82%" stopColor="#a78bfa" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle
            cx="800"
            cy="800"
            r="797"
            fill="none"
            stroke="url(#globe-rim)"
            strokeWidth="4"
          />
        </svg>

        {/* Inner glow band just below the rim */}
        <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-violet-300/40 to-transparent blur-[6px]" />
      </div>
    </div>
  )
}

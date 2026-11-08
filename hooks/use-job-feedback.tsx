"use client"

import { useCallback, useEffect, useState } from "react"

type Feedback = {
  type: "success" | "error"
  message: string
} | null

export function useJobFeedback() {
  const [feedback, setFeedback] = useState<Feedback>(null)

  const notify = useCallback((type: "success" | "error", message: string) => {
    setFeedback({ type, message })
  }, [])

  useEffect(() => {
    if (!feedback) return

    const timeout = window.setTimeout(() => setFeedback(null), 3500)

    return () => window.clearTimeout(timeout)
  }, [feedback])

  const Toast = feedback ? (
    <div
      role="status"
      aria-live="polite"
      className={`fixed right-4 bottom-4 z-[100] max-w-sm rounded-xl border px-4 py-3 text-sm shadow-2xl ${
        feedback.type === "success"
          ? "border-emerald-500/30 bg-[#10251c] text-emerald-200"
          : "border-red-500/30 bg-[#2a1518] text-red-200"
      }`}
    >
      {feedback.message}
    </div>
  ) : null

  return { notify, Toast }
}

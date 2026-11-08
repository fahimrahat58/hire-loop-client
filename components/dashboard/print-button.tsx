"use client"

import { FileDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { secondaryButton } from "./ui"

export function PrintButton({
  label = "Export PDF",
  className,
}: {
  label?: string
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={cn(secondaryButton, className)}
    >
      <FileDown className="size-3.5" />
      {label}
    </button>
  )
}

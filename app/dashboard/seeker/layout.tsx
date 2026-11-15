import { SessionGuard } from "@/components/shared/SessionGuard"

export default function SeekerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionGuard requiredRole="seeker">
      {children}
    </SessionGuard>
  )
}

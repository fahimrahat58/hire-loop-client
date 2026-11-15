import { SessionGuard } from "@/components/shared/SessionGuard"

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionGuard requiredRole="recruiter">
      {children}
    </SessionGuard>
  )
}

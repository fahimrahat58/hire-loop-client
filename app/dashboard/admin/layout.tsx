import { SessionGuard } from "@/components/shared/SessionGuard"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionGuard requiredRole="admin">
      {children}
    </SessionGuard>
  )
}

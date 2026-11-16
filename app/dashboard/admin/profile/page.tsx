import { ProfileSettings } from "@/components/dashboard/profile-settings"

export default function AdminProfilePage() {
  return (
    <ProfileSettings
      pageTitle="Admin Profile"
      description="Review your administrator account details."
      roleLabel="Administrator"
      showSecurity={false}
    />
  )
}

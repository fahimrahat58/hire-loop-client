import { ProfileSettings } from "@/components/dashboard/profile-settings"

export default function AdminSettingsPage() {
  return (
    <ProfileSettings
      pageTitle="Admin Settings"
      description="Update your administrator profile and account credentials."
      roleLabel="Administrator"
    />
  )
}

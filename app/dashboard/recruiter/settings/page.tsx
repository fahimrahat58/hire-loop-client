import { ProfileSettings } from "@/components/dashboard/profile-settings"

export default function RecruiterSettingsPage() {
  return (
    <ProfileSettings
      pageTitle="Recruiter Settings"
      description="Update your personal information and manage your account."
      roleLabel="Recruiter"
      showProfessional={false}
      showResume={false}
    />
  )
}

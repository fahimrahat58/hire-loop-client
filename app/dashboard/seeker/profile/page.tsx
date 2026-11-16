import { ProfileSettings } from "@/components/dashboard/profile-settings"

export default function SeekerProfilePage() {
  return (
    <ProfileSettings
      pageTitle="Seeker Profile"
      description="Review your account details and update how you appear on HireLoop."
      roleLabel="Job Seeker"
      showSecurity={false}
    />
  )
}

import { ProfileSettings } from "@/components/dashboard/profile-settings"

export default function RecruiterProfilePage() {
  return (
    <ProfileSettings
      pageTitle="Recruiter Profile"
      description="Review your account details and update how you appear on HireLoop."
      roleLabel="Recruiter"
      showSecurity={false}
    />
  )
}

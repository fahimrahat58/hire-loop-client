import { seekerProfile } from "@/app/lib/dashboard-data"
import { ProfileSettings } from "@/components/dashboard/profile-settings"

export default function SeekerSettingsPage() {
  return (
    <ProfileSettings
      initialName={seekerProfile.name}
      initialEmail={seekerProfile.email}
      roleLabel="Job Seeker"
      headline={seekerProfile.headline}
      bio={seekerProfile.bio}
      skills={seekerProfile.skills}
      resume={seekerProfile.resume}
    />
  )
}

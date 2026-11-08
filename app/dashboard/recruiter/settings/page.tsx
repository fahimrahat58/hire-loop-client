import { ProfileSettings } from "@/components/dashboard/profile-settings"

export default function RecruiterSettingsPage() {
  return (
    <ProfileSettings
      pageTitle="Recruiter Settings"
      description="Update your personal information and manage the company linked to your account."
      initialName="Alex Sterling"
      initialEmail="alex.sterling@techflow.io"
      roleLabel="Recruiter"
      showProfessional={false}
      showResume={false}
      linkedCompany={{
        name: "TechFlow Inc.",
        href: "/dashboard/recruiter/company",
        status: "Approved",
      }}
    />
  )
}

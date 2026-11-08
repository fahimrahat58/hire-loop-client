"use client"

import { useEffect, useState } from "react"
import { Check, FileText, KeyRound, Plus, Trash2, X } from "lucide-react"

import { authClient } from "@/app/lib/auth-client"

import {
  Avatar,
  FieldLabel,
  PageHeader,
  SectionCard,
  StatusBadge,
  inputClass,
  primaryButton,
  secondaryButton,
} from "@/components/dashboard/ui"

import { cn } from "@/lib/utils"

interface ProfileSettingsProps {
  pageTitle?: string
  description?: string
  initialName?: string
  initialEmail?: string
  roleLabel: string
  headline?: string
  bio?: string
  skills?: string[]
  showProfessional?: boolean
  showResume?: boolean
  resume?: { name: string; meta: string }
}

export function ProfileSettings({
  pageTitle = "Settings",
  description = "Manage your account details and professional profile.",
  initialName = "",
  initialEmail = "",
  roleLabel,
  headline,
  bio,
  skills = [],
  showProfessional = true,
  showResume = true,
  resume,
}: ProfileSettingsProps) {
  const { data: session, isPending } = authClient.useSession()

  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)
  const [imageUrl, setImageUrl] = useState("")

  const [headlineValue, setHeadlineValue] = useState(headline ?? "")
  const [bioValue, setBioValue] = useState(bio ?? "")
  const [skillList, setSkillList] = useState<string[]>(skills)
  const [newSkill, setNewSkill] = useState("")
  const [resumeFile, setResumeFile] = useState(resume)

  const [notice, setNotice] = useState("")
  const [saving, setSaving] = useState(false)

  // Load logged-in user information
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "")
      setEmail(session.user.email || "")
      setImageUrl(session.user.image || "")
    }
  }, [session])

  const flash = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(""), 4000)
  }

  // Update profile
  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      flash("Please enter your full name.")
      return
    }

    if (imageUrl.trim()) {
      try {
        const parsedUrl = new URL(imageUrl.trim())

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          flash("Please enter a valid image URL.")
          return
        }
      } catch {
        flash("Please enter a valid image URL.")
        return
      }
    }

    try {
      setSaving(true)
      setNotice("")

      const result = await authClient.updateUser({
        name: name.trim(),
        image: imageUrl.trim() || null,
      })

      if (result.error) {
        throw new Error(result.error.message || "Profile update failed.")
      }

      flash("Profile updated successfully.")
    } catch (error) {
      flash(error instanceof Error ? error.message : "Something went wrong.")
    } finally {
      setSaving(false)
    }
  }

  // Add skill
  const addSkill = () => {
    const value = newSkill.trim()

    if (!value) return

    setSkillList((current) =>
      current.some((skill) => skill.toLowerCase() === value.toLowerCase())
        ? current
        : [...current, value]
    )

    setNewSkill("")
  }

  if (isPending) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-[#8b8b95]">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={pageTitle}
        description={description}
        actions={<StatusBadge status={roleLabel} />}
      />

      {notice ? (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-[#22c55e]/30 bg-[#22c55e]/10 px-4 py-2.5 text-[13px] text-[#86efac]"
        >
          <Check className="size-4" />
          {notice}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Profile Information */}
        <SectionCard
          title="Profile information"
          description="This is how you appear across HireLoop."
          bodyClassName="p-5"
        >
          {/* Profile Image URL */}
          <div className="flex items-center gap-4">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name || "Profile"}
                className="size-16 shrink-0 rounded-full border border-white/10 object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = "none"
                }}
              />
            ) : (
              <Avatar name={name || "User"} size="xl" />
            )}

            <div className="min-w-0 flex-1">
              <FieldLabel htmlFor="profile-image">Profile Image URL</FieldLabel>

              <input
                id="profile-image"
                type="url"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://example.com/profile.jpg"
                className={inputClass}
              />

              <p className="mt-2 text-[11px] text-[#6e6e78]">
                Paste your profile image URL.
              </p>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="mt-5 space-y-4">
            <div>
              <FieldLabel htmlFor="profile-name">Full name</FieldLabel>

              <input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your full name"
                className={inputClass}
              />
            </div>

            <div>
              <FieldLabel htmlFor="profile-email">Email address</FieldLabel>

              <input
                id="profile-email"
                type="email"
                value={email}
                readOnly
                className={cn(inputClass, "cursor-not-allowed opacity-70")}
              />

              <p className="mt-1 text-[11px] text-[#6e6e78]">
                Email address cannot be changed here.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleUpdateProfile}
              disabled={saving}
              className={cn(
                primaryButton,
                saving && "cursor-not-allowed opacity-60"
              )}
            >
              {saving ? "Updating..." : "Update profile"}
            </button>

            <button
              type="button"
              onClick={() =>
                flash("Use the password reset option on the login page.")
              }
              className={secondaryButton}
            >
              <KeyRound className="size-3.5" />
              Reset password
            </button>
          </div>
        </SectionCard>

        {/* Professional Details */}
        {showProfessional ? (
          <SectionCard
            title="Professional details"
            description="Help recruiters understand what you do best."
            bodyClassName="p-5"
          >
            <div>
              <FieldLabel htmlFor="headline">Professional headline</FieldLabel>

              <input
                id="headline"
                value={headlineValue}
                onChange={(event) => setHeadlineValue(event.target.value)}
                placeholder="e.g. Senior UX/UI Designer"
                className={inputClass}
              />
            </div>

            <div className="mt-4">
              <FieldLabel htmlFor="bio">Bio</FieldLabel>

              <textarea
                id="bio"
                rows={4}
                value={bioValue}
                onChange={(event) => setBioValue(event.target.value)}
                className={cn(inputClass, "resize-none")}
              />
            </div>

            <div className="mt-4">
              <FieldLabel>Skills</FieldLabel>

              <div className="flex flex-wrap gap-1.5">
                {skillList.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#8f88ff]/25 bg-[#5c53fe]/10 py-1 pr-1.5 pl-2.5 text-[11px] text-[#c7c2ff]"
                  >
                    {skill}

                    <button
                      type="button"
                      onClick={() =>
                        setSkillList((current) =>
                          current.filter((item) => item !== skill)
                        )
                      }
                      aria-label={`Remove ${skill}`}
                      className="rounded-full p-0.5 transition hover:bg-white/10"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="mt-2 flex gap-2">
                <input
                  value={newSkill}
                  onChange={(event) => setNewSkill(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      addSkill()
                    }
                  }}
                  placeholder="Add a skill..."
                  className={inputClass}
                />

                <button
                  type="button"
                  onClick={addSkill}
                  aria-label="Add skill"
                  className={secondaryButton}
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                flash("Professional details are not connected to the API yet.")
              }
              className={`${primaryButton} mt-5`}
            >
              Save details
            </button>
          </SectionCard>
        ) : null}
      </div>

      {/* Resume */}
      {showResume ? (
        <SectionCard title="Resume" bodyClassName="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#5c53fe]/15 text-[#b8b2ff]">
                <FileText className="size-5" />
              </span>

              <div>
                <p className="text-[13px] font-medium text-[#ededef]">
                  {resumeFile?.name ?? "No resume uploaded"}
                </p>

                <p className="mt-0.5 text-[11px] text-[#6e6e78]">
                  {resumeFile?.meta ??
                    "Upload a PDF to enable one-click applications."}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <label
                htmlFor="resume-upload"
                className={cn(secondaryButton, "cursor-pointer")}
              >
                <Upload className="size-3.5" />
                Replace
              </label>

              <input
                id="resume-upload"
                type="file"
                accept=".pdf"
                className="sr-only"
              />

              {resumeFile ? (
                <button
                  type="button"
                  onClick={() => {
                    setResumeFile(undefined)
                    flash("Resume removed from this page.")
                  }}
                  className={secondaryButton}
                >
                  <Trash2 className="size-3.5" />
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        </SectionCard>
      ) : null}
    </div>
  )
}

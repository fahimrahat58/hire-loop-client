"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  Building2,
  Check,
  FileText,
  KeyRound,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react"
import {
  Avatar,
  DashboardCard,
  FieldLabel,
  PageHeader,
  SectionCard,
  StatusBadge,
  inputClass,
  primaryButton,
  secondaryButton,
} from "@/components/dashboard/ui"
import { cn } from "@/lib/utils"

export function ProfileSettings({
  pageTitle = "Settings",
  description = "Manage your account details and professional profile.",
  initialName,
  initialEmail,
  roleLabel,
  headline,
  bio,
  skills = [],
  showProfessional = true,
  showResume = true,
  resume,
  linkedCompany,
}: {
  pageTitle?: string
  description?: string
  initialName: string
  initialEmail: string
  roleLabel: string
  headline?: string
  bio?: string
  skills?: string[]
  showProfessional?: boolean
  showResume?: boolean
  resume?: { name: string; meta: string }
  linkedCompany?: { name: string; href: string; status: string }
}) {
  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)
  const [headlineValue, setHeadlineValue] = useState(headline ?? "")
  const [bioValue, setBioValue] = useState(bio ?? "")
  const [skillList, setSkillList] = useState<string[]>(skills)
  const [newSkill, setNewSkill] = useState("")
  const [resumeFile, setResumeFile] = useState(resume)
  const [notice, setNotice] = useState("")

  const flash = (message: string) => {
    setNotice(message)
  }

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
        <SectionCard
          title="Profile information"
          description="This is how you appear across HireLoop."
          bodyClassName="p-5"
        >
          <div className="flex items-center gap-4">
            <Avatar name={name} size="xl" />
            <div>
              <label
                htmlFor="avatar-upload"
                className={cn(secondaryButton, "cursor-pointer")}
              >
                <Upload className="size-3.5" />
                Change avatar
              </label>
              <input id="avatar-upload" type="file" accept="image/*" className="sr-only" />
              <p className="mt-2 max-w-[200px] text-[11px] leading-relaxed text-[#6e6e78]">
                JPG, GIF or PNG. Max size of 5MB.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <FieldLabel htmlFor="profile-name">Full name</FieldLabel>
              <input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel htmlFor="profile-email">Email address</FieldLabel>
              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => flash("Profile updated successfully.")}
              className={primaryButton}
            >
              Update profile
            </button>
            <button
              type="button"
              onClick={() => flash(`Password reset link sent to ${email}.`)}
              className={secondaryButton}
            >
              <KeyRound className="size-3.5" />
              Reset password
            </button>
          </div>
        </SectionCard>

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
              onClick={() => flash("Professional details saved.")}
              className={`${primaryButton} mt-5`}
            >
              Save details
            </button>
          </SectionCard>
        ) : null}
      </div>

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
              <input id="resume-upload" type="file" accept=".pdf" className="sr-only" />
              {resumeFile ? (
                <button
                  type="button"
                  onClick={() => {
                    setResumeFile(undefined)
                    flash("Resume removed.")
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

      {linkedCompany ? (
        <DashboardCard className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#5c53fe]/15 text-[#b8b2ff]">
              <Building2 className="size-5" />
            </span>
            <div>
              <p className="text-[13px] font-medium text-[#ededef]">
                {linkedCompany.name}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <StatusBadge status={linkedCompany.status} />
                <span className="text-[11px] text-[#6e6e78]">
                  Linked company profile
                </span>
              </div>
            </div>
          </div>
          <Link href={linkedCompany.href} className={secondaryButton}>
            Manage company
            <ArrowUpRight className="size-3.5" />
          </Link>
        </DashboardCard>
      ) : null}
    </div>
  )
}

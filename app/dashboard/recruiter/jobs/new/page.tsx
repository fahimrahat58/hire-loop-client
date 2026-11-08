"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react"
import { recruiterCompany } from "@/app/lib/dashboard-data"
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

const initialForm = {
  title: "",
  category: "Design",
  type: "Full-time",
  salaryMin: "",
  salaryMax: "",
  currency: "USD",
  location: "",
  deadline: "",
  responsibilities: "",
  requirements: "",
  benefits: "",
}

export default function RecruiterNewJobPage() {
  const [form, setForm] = useState(initialForm)
  const [remote, setRemote] = useState(false)
  const [result, setResult] = useState<"published" | "draft" | null>(null)

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  if (result) {
    const isDraft = result === "draft"

    return (
      <div className="space-y-6">
        <PageHeader
          title={isDraft ? "Draft saved" : "Job published"}
          description={
            isDraft
              ? "Your job post is saved as a draft. Publish it whenever you are ready."
              : "Your role is now live on HireLoop and visible to job seekers."
          }
        />
        <DashboardCard className="flex flex-col items-center px-6 py-14 text-center">
          <span
            className={cn(
              "flex size-14 items-center justify-center rounded-full",
              isDraft
                ? "bg-[#f59e0b]/15 text-[#fcd34d]"
                : "bg-[#22c55e]/15 text-[#86efac]"
            )}
          >
            {isDraft ? (
              <Clock className="size-7" />
            ) : (
              <CheckCircle2 className="size-7" />
            )}
          </span>
          <h2 className="mt-4 text-lg font-semibold text-[#ededef]">
            {form.title || "Untitled role"} {isDraft ? "saved as draft" : "is live"}
          </h2>
          <p className="mt-1 max-w-md text-sm text-[#8b8b96]">
            {isDraft
              ? "No job slot has been used yet. You can finish the details from Manage Jobs before publishing."
              : "Applications will start arriving in your dashboard. You can edit or close the post at any time from Manage Jobs."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/dashboard/recruiter/jobs" className={primaryButton}>
              Go to Manage Jobs
            </Link>
            <button
              type="button"
              onClick={() => {
                setForm(initialForm)
                setRemote(false)
                setResult(null)
              }}
              className={secondaryButton}
            >
              Post another job
            </button>
          </div>
        </DashboardCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Post a Job"
        description="Reach qualified candidates. Your company details are filled in automatically."
        actions={
          <Link href="/dashboard/recruiter/jobs" className={secondaryButton}>
            <ArrowLeft className="size-3.5" />
            Back to jobs
          </Link>
        }
      />

      <form
        onSubmit={(event) => {
          event.preventDefault()
          setResult("published")
        }}
        className="grid gap-4 lg:grid-cols-3"
      >
        <div className="space-y-4 lg:col-span-2">
          <SectionCard
            title="Job info"
            description="The essentials candidates see first."
            bodyClassName="p-5"
          >
            <div className="space-y-4">
              <div>
                <FieldLabel htmlFor="job-title">Job title *</FieldLabel>
                <input
                  id="job-title"
                  required
                  value={form.title}
                  onChange={(event) => update("title", event.target.value)}
                  placeholder="e.g. Senior Product Designer"
                  className={inputClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="job-category">Job category</FieldLabel>
                  <select
                    id="job-category"
                    value={form.category}
                    onChange={(event) => update("category", event.target.value)}
                    className={inputClass}
                  >
                    <option>Design</option>
                    <option>Engineering</option>
                    <option>Product</option>
                    <option>Marketing</option>
                    <option>Sales</option>
                    <option>Operations</option>
                  </select>
                </div>
                <div>
                  <FieldLabel htmlFor="job-type">Job type</FieldLabel>
                  <select
                    id="job-type"
                    value={form.type}
                    onChange={(event) => update("type", event.target.value)}
                    className={inputClass}
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Remote</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <FieldLabel htmlFor="salary-min">Salary min</FieldLabel>
                  <input
                    id="salary-min"
                    inputMode="numeric"
                    value={form.salaryMin}
                    onChange={(event) => update("salaryMin", event.target.value)}
                    placeholder="120000"
                    className={inputClass}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="salary-max">Salary max</FieldLabel>
                  <input
                    id="salary-max"
                    inputMode="numeric"
                    value={form.salaryMax}
                    onChange={(event) => update("salaryMax", event.target.value)}
                    placeholder="160000"
                    className={inputClass}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="currency">Currency</FieldLabel>
                  <select
                    id="currency"
                    value={form.currency}
                    onChange={(event) => update("currency", event.target.value)}
                    className={inputClass}
                  >
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                    <option>BDT</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="job-location">Location</FieldLabel>
                  <input
                    id="job-location"
                    disabled={remote}
                    value={remote ? "Remote" : form.location}
                    onChange={(event) => update("location", event.target.value)}
                    placeholder="City, country"
                    className={cn(inputClass, remote && "opacity-60")}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="job-deadline">Application deadline</FieldLabel>
                  <input
                    id="job-deadline"
                    type="date"
                    value={form.deadline}
                    onChange={(event) => update("deadline", event.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <label className="flex w-fit cursor-pointer items-center gap-2 text-xs text-[#a0a0ab]">
                <input
                  type="checkbox"
                  checked={remote}
                  onChange={(event) => setRemote(event.target.checked)}
                  className="size-4 rounded border-white/20 bg-[#0f0f13] accent-[#5c53fe]"
                />
                This is a fully remote role
              </label>
            </div>
          </SectionCard>

          <SectionCard
            title="Job description"
            description="Give candidates enough detail to decide if the role is right for them."
            bodyClassName="p-5"
          >
            <div className="space-y-4">
              <div>
                <FieldLabel htmlFor="responsibilities">Responsibilities</FieldLabel>
                <textarea
                  id="responsibilities"
                  rows={5}
                  value={form.responsibilities}
                  onChange={(event) => update("responsibilities", event.target.value)}
                  placeholder="What will this person own day to day?"
                  className={cn(inputClass, "resize-none")}
                />
              </div>
              <div>
                <FieldLabel htmlFor="requirements">Requirements</FieldLabel>
                <textarea
                  id="requirements"
                  rows={5}
                  value={form.requirements}
                  onChange={(event) => update("requirements", event.target.value)}
                  placeholder="Skills, experience, and qualifications."
                  className={cn(inputClass, "resize-none")}
                />
              </div>
              <div>
                <FieldLabel htmlFor="benefits">Benefits (optional)</FieldLabel>
                <textarea
                  id="benefits"
                  rows={3}
                  value={form.benefits}
                  onChange={(event) => update("benefits", event.target.value)}
                  placeholder="Equity, remote budget, learning stipend..."
                  className={cn(inputClass, "resize-none")}
                />
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <DashboardCard className="p-5">
            <div className="flex items-center gap-3">
              <Avatar name={recruiterCompany.name} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#ededef]">
                  {recruiterCompany.name}
                </p>
                <p className="text-[11px] text-[#6e6e78]">
                  {recruiterCompany.industry}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <StatusBadge status={recruiterCompany.status} />
              <span className="text-[11px] text-[#6e6e78]">
                Company verified
              </span>
            </div>
            <div className="mt-4 space-y-2 border-t border-white/[0.06] pt-3 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-[#6e6e78]">Active posts</span>
                <span className="font-medium text-[#ededef]">3 / 10</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6e6e78]">Plan</span>
                <span className="font-medium text-[#ededef]">Growth</span>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard className="p-5">
            <h2 className="text-sm font-semibold text-[#ededef]">Ready to publish?</h2>
            <ul className="mt-3 space-y-2 text-[11px] text-[#8b8b96]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[#22c55e]" />
                Company is approved to post publicly
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[#22c55e]" />
                Plan limit not reached
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="mt-0.5 size-3.5 shrink-0 text-[#b8b2ff]" />
                Featured placement available on Enterprise
              </li>
            </ul>

            <button type="submit" className={`${primaryButton} mt-5 w-full`}>
              <BriefcaseBusiness className="size-4" />
              Publish job
            </button>
            <button
              type="button"
              onClick={() => setResult("draft")}
              className={`${secondaryButton} mt-2 w-full`}
            >
              <Clock className="size-4" />
              Save as draft
            </button>
            <p className="mt-3 text-center text-[10px] leading-relaxed text-[#6e6e78]">
              Posting will use one of your 10 active job slots.
            </p>
          </DashboardCard>

          <DashboardCard className="flex items-start gap-2 p-4 text-[11px] text-[#7c7c86]">
            <Building2 className="mt-0.5 size-4 shrink-0 text-[#6e6e78]" />
            Company information is managed from My Company. Update it there to
            keep every job post accurate.
          </DashboardCard>
        </div>
      </form>
    </div>
  )
}

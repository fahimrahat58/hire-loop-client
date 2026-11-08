"use client"

import { useState } from "react"
import {
  Building2,
  CalendarDays,
  Check,
  Globe,
  MapPin,
  Pencil,
  Upload,
  UsersRound,
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

export default function RecruiterCompanyPage() {
  const [editing, setEditing] = useState(false)
  const [status, setStatus] = useState(recruiterCompany.status)
  const [notice, setNotice] = useState("")
  const [form, setForm] = useState({
    name: recruiterCompany.name,
    industry: recruiterCompany.industry,
    website: recruiterCompany.website,
    location: recruiterCompany.location,
    employees: recruiterCompany.employees,
    description: recruiterCompany.description,
  })

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const save = () => {
    setEditing(false)
    setStatus("Pending")
    setNotice("Company changes submitted. An admin will review them shortly.")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Company"
        description="Manage your company profile. Approved companies appear in the public directory and can publish jobs."
        actions={
          editing ? null : (
            <button
              type="button"
              onClick={() => {
                setEditing(true)
                setNotice("")
              }}
              className={primaryButton}
            >
              <Pencil className="size-3.5" />
              Edit company
            </button>
          )
        }
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

      {editing ? (
        <SectionCard
          title="Edit company profile"
          description="Changes are reviewed by a HireLoop admin before they go live."
          bodyClassName="p-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="company-name">Company name</FieldLabel>
              <input
                id="company-name"
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel htmlFor="company-industry">Industry / category</FieldLabel>
              <input
                id="company-industry"
                value={form.industry}
                onChange={(event) => update("industry", event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel htmlFor="company-website">Website URL</FieldLabel>
              <input
                id="company-website"
                value={form.website}
                onChange={(event) => update("website", event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel htmlFor="company-location">Location</FieldLabel>
              <input
                id="company-location"
                value={form.location}
                onChange={(event) => update("location", event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel htmlFor="company-employees">Employee count</FieldLabel>
              <select
                id="company-employees"
                value={form.employees}
                onChange={(event) => update("employees", event.target.value)}
                className={inputClass}
              >
                <option>1 - 10 employees</option>
                <option>11 - 50 employees</option>
                <option>51 - 200 employees</option>
                <option>201 - 500 employees</option>
                <option>500+ employees</option>
              </select>
            </div>
            <div>
              <FieldLabel>Company logo</FieldLabel>
              <label
                htmlFor="company-logo"
                className={cn(secondaryButton, "w-full cursor-pointer")}
              >
                <Upload className="size-3.5" />
                Upload image
              </label>
              <input id="company-logo" type="file" accept="image/*" className="sr-only" />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="company-description">Short description</FieldLabel>
              <textarea
                id="company-description"
                rows={4}
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                className={cn(inputClass, "resize-none")}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={save} className={primaryButton}>
              Save changes
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className={secondaryButton}
            >
              Cancel
            </button>
          </div>
        </SectionCard>
      ) : (
        <>
          <DashboardCard className="relative overflow-hidden p-5">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-10 size-64 rounded-full bg-[#5c53fe]/10 blur-3xl"
            />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar name={form.name} size="xl" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-[#ededef]">
                      {form.name}
                    </h2>
                    <StatusBadge status={status} />
                  </div>
                  <p className="mt-1 text-xs text-[#a0a0ab]">{form.industry}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#7c7c86]">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3" /> {form.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Globe className="size-3" /> techflow.io
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className={secondaryButton}
              >
                <Pencil className="size-3.5" />
                Edit
              </button>
            </div>

            <p className="relative mt-5 max-w-3xl text-[13px] leading-relaxed text-[#8b8b96]">
              {form.description}
            </p>
          </DashboardCard>

          <div className="grid gap-4 sm:grid-cols-3">
            <DashboardCard className="flex items-center gap-3 p-4">
              <span className="flex size-9 items-center justify-center rounded-lg bg-[#5c53fe]/15 text-[#b8b2ff]">
                <UsersRound className="size-4" />
              </span>
              <div>
                <p className="text-[11px] text-[#7c7c86]">Team size</p>
                <p className="text-sm font-semibold text-[#ededef]">
                  {form.employees}
                </p>
              </div>
            </DashboardCard>
            <DashboardCard className="flex items-center gap-3 p-4">
              <span className="flex size-9 items-center justify-center rounded-lg bg-[#60a5fa]/15 text-[#93c5fd]">
                <Building2 className="size-4" />
              </span>
              <div>
                <p className="text-[11px] text-[#7c7c86]">Industry</p>
                <p className="text-sm font-semibold text-[#ededef]">
                  {form.industry}
                </p>
              </div>
            </DashboardCard>
            <DashboardCard className="flex items-center gap-3 p-4">
              <span className="flex size-9 items-center justify-center rounded-lg bg-[#22c55e]/15 text-[#86efac]">
                <CalendarDays className="size-4" />
              </span>
              <div>
                <p className="text-[11px] text-[#7c7c86]">Founded</p>
                <p className="text-sm font-semibold text-[#ededef]">
                  {recruiterCompany.founded}
                </p>
              </div>
            </DashboardCard>
          </div>

          <SectionCard title="Company overview" bodyClassName="p-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-[11px] text-[#6e6e78]">Company name</p>
                <p className="mt-1 text-[13px] text-[#ededef]">{form.name}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#6e6e78]">Website</p>
                <p className="mt-1 text-[13px] text-[#ededef]">{form.website}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#6e6e78]">Location</p>
                <p className="mt-1 text-[13px] text-[#ededef]">{form.location}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#6e6e78]">Recruiter</p>
                <p className="mt-1 text-[13px] text-[#ededef]">
                  {recruiterCompany.recruiter} · {recruiterCompany.recruiterEmail}
                </p>
              </div>
            </div>
          </SectionCard>
        </>
      )}
    </div>
  )
}

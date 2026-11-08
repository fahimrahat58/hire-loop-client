
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react"

import { authClient } from "@/app/lib/auth-client"

import {
  getJob,
  createJob,
  updateJob,
  getJobsErrorMessage,
  type JobUser,
  type JobInput,
} from "@/app/lib/jobs-api"

import { rememberJobOwner } from "@/app/lib/job-ownership"

import {
  DashboardCard,
  FieldLabel,
  PageHeader,
  SectionCard,
  inputClass,
  primaryButton,
  secondaryButton,
} from "@/components/dashboard/ui"

import { toast } from "@/components/ui/toast"
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

type FormData = typeof initialForm

type ResultType = "published" | "draft" | "updated" | null

export default function RecruiterNewJobPage() {
  const { data: session, isPending: sessionPending } = authClient.useSession()

  const user = session?.user

  const currentUser: JobUser | null = user
    ? {
      id: user.id,
      email: user.email,
      role: user.role,
    }
    : null

  const [form, setForm] = useState<FormData>(initialForm)
  const [remote, setRemote] = useState(false)
  const [result, setResult] = useState<ResultType>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editModeReady, setEditModeReady] = useState(false)
  const [jobLoaded, setJobLoaded] = useState(false)
  const [loadingJob, setLoadingJob] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)

  const activeRequestRef = useRef<string | null>(null)

  // --------------------------------
  // DETECT EDIT MODE
  // --------------------------------

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get("edit")

    setEditId(id)
    setEditModeReady(true)
  }, [])

  // --------------------------------
  // FORM UPDATE
  // --------------------------------

  const update = (field: keyof FormData, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  // --------------------------------
  // FETCH JOB FOR EDITING
  // --------------------------------

  const loadExistingJob = useCallback(async () => {
    if (!editId || !currentUser) return

    const requestKey = `${editId}-${currentUser.id}-${currentUser.email}`

    if (activeRequestRef.current === requestKey) return

    activeRequestRef.current = requestKey

    setLoadingJob(true)
    setJobLoaded(false)
    setPageError(null)

    try {
      const job = await getJob(editId, {
        user: currentUser,
      })

      const role = currentUser.role?.toLowerCase()

      if (role !== "admin" && role !== "recruiter") {
        throw new Error("You cannot edit this job.")
      }

      // Verify job ownership
      if (role === "recruiter") {
        const owner =
          job.recruiterId ||
          job.createdBy ||
          job.ownerId ||
          job.userId ||
          job.ownerEmail ||
          ""

        const ownerValue = String(owner).toLowerCase()

        const ownsJob =
          ownerValue === currentUser.id?.toLowerCase() ||
          ownerValue === currentUser.email?.toLowerCase()

        if (!ownsJob) {
          throw new Error("You can only edit your own job posts.")
        }
      }

      // --------------------------------
      // SALARY
      // --------------------------------

      const salary = job.salary || ""

      const salaryMatch = salary.match(
        /(\d[\d,]*)\s*(?:-|to)\s*(\d[\d,]*)/i
      )

      const salaryMin =
        job.salaryMin?.toString() ||
        (salaryMatch ? salaryMatch[1].replaceAll(",", "") : "")

      const salaryMax =
        job.salaryMax?.toString() ||
        (salaryMatch ? salaryMatch[2].replaceAll(",", "") : "")

      // --------------------------------
      // DESCRIPTION
      // --------------------------------

      const description = job.description || ""

      const responsibilitiesMatch = description.match(
        /Responsibilities\s*\n([\s\S]*?)(?=\n\nRequirements|\n\nBenefits|$)/i
      )

      const requirementsMatch = description.match(
        /Requirements\s*\n([\s\S]*?)(?=\n\nBenefits|$)/i
      )

      const benefitsMatch = description.match(
        /Benefits\s*\n([\s\S]*?)$/i
      )

      // --------------------------------
      // PREFILL FORM
      // --------------------------------

      setForm({
        title: job.title || "",
        category: job.category || "Design",
        type: job.type || "Full-time",
        salaryMin,
        salaryMax,
        currency: job.currency || "USD",
        location: job.location || "",
        deadline:
          job.deadline?.slice(0, 10) ||
          job.applicationDeadline?.slice(0, 10) ||
          "",
        responsibilities:
          responsibilitiesMatch?.[1]?.trim() || description,
        requirements: requirementsMatch?.[1]?.trim() || "",
        benefits: benefitsMatch?.[1]?.trim() || "",
      })

      setRemote(
        job.type === "Remote" ||
        job.location?.toLowerCase() === "remote"
      )
    } catch (error) {
      console.error("LOAD JOB ERROR:", error)

      setPageError(
        getJobsErrorMessage(error, "Unable to load the job for editing.")
      )
    } finally {
      activeRequestRef.current = null
      setLoadingJob(false)
      setJobLoaded(true)
    }
  }, [
    editId,
    currentUser?.id,
    currentUser?.email,
    currentUser?.role,
  ])

  // --------------------------------
  // INITIAL EDIT FETCH
  // --------------------------------

  useEffect(() => {
    if (!editModeReady || sessionPending) return

    if (!editId) {
      setJobLoaded(true)
      return
    }

    if (!currentUser) {
      setPageError("Please sign in to edit this job.")
      setJobLoaded(true)
      return
    }

    void loadExistingJob()
  }, [
    editModeReady,
    sessionPending,
    editId,
    currentUser?.id,
    currentUser?.email,
    currentUser?.role,
    loadExistingJob,
  ])

  // --------------------------------
  // VALIDATION
  // --------------------------------

  const validateForm = () => {
    if (!form.title.trim()) {
      toast.add({
        title: "Job title required",
        description: "Please enter a job title.",
        type: "error",
      })

      return false
    }

    if (!form.location.trim() && !remote) {
      toast.add({
        title: "Location required",
        description: "Please enter the job location.",
        type: "error",
      })

      return false
    }

    const min = Number(form.salaryMin)
    const max = Number(form.salaryMax)

    if (form.salaryMin && (!Number.isFinite(min) || min < 0)) {
      toast.add({
        title: "Invalid minimum salary",
        description: "Enter a valid minimum salary.",
        type: "error",
      })

      return false
    }

    if (form.salaryMax && (!Number.isFinite(max) || max < 0)) {
      toast.add({
        title: "Invalid maximum salary",
        description: "Enter a valid maximum salary.",
        type: "error",
      })

      return false
    }

    if (form.salaryMin && form.salaryMax && max < min) {
      toast.add({
        title: "Invalid salary range",
        description: "Maximum salary must be greater than minimum salary.",
        type: "error",
      })

      return false
    }

    if (form.deadline) {
      const deadline = new Date(`${form.deadline}T23:59:59`)

      if (deadline < new Date()) {
        toast.add({
          title: "Invalid application deadline",
          description: "The deadline cannot be in the past.",
          type: "error",
        })

        return false
      }
    }

    return true
  }

  // --------------------------------
  // BUILD API PAYLOAD
  // --------------------------------

  const buildPayload = (status: "active" | "draft"): JobInput => {
    const symbols: Record<string, string> = {
      USD: "$",
      BDT: "৳",
      EUR: "€",
      GBP: "£",
    }

    const symbol = symbols[form.currency] || ""

    const salaryParts = [
      form.salaryMin ? `${symbol}${form.salaryMin}` : "",
      form.salaryMax ? `${symbol}${form.salaryMax}` : "",
    ].filter(Boolean)

    const salary = salaryParts.join(" - ")

    const description = [
      form.responsibilities.trim()
        ? `Responsibilities\n${form.responsibilities.trim()}`
        : "",

      form.requirements.trim()
        ? `Requirements\n${form.requirements.trim()}`
        : "",

      form.benefits.trim()
        ? `Benefits\n${form.benefits.trim()}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n")

    return {
      title: form.title.trim(),
      category: form.category,
      type: remote ? "Remote" : form.type,
      location: remote ? "Remote" : form.location.trim(),
      salary,
      salaryMin: form.salaryMin
        ? Number(form.salaryMin)
        : undefined,
      salaryMax: form.salaryMax
        ? Number(form.salaryMax)
        : undefined,
      currency: form.currency,
      deadline: form.deadline || undefined,
      description,
      status,
      closed: status === "draft",
    }
  }

  // --------------------------------
  // SUBMIT FORM
  // --------------------------------

  const handleSubmit = async (status: "active" | "draft") => {
    if (!currentUser) {
      toast.add({
        title: "Authentication required",
        description: "Please sign in before posting a job.",
        type: "error",
      })

      return
    }

    if (
      currentUser.role?.toLowerCase() !== "recruiter" &&
      currentUser.role?.toLowerCase() !== "admin"
    ) {
      toast.add({
        title: "Access denied",
        description: "Only recruiters can publish jobs.",
        type: "error",
      })

      return
    }

    if (!validateForm()) return

    setSubmitting(true)

    try {
      const payload = buildPayload(status)

      if (editId) {
        // Company field is not sent during update.
        // Existing database company remains unchanged.

        await updateJob(editId, payload, {
          user: currentUser,
        })

        toast.add({
          title: "Job updated successfully!",
          description: "Your changes have been saved.",
          type: "success",
        })

        setResult("updated")
      } else {
        const createdJob = await createJob(payload, {
          user: currentUser,
        })

        rememberJobOwner(createdJob, currentUser)

        toast.add({
          title:
            status === "draft"
              ? "Draft saved successfully!"
              : "Job published successfully!",

          description:
            status === "draft"
              ? "Your draft has been saved."
              : "Your job is now available.",

          type: "success",
        })

        setResult(status === "draft" ? "draft" : "published")
      }
    } catch (error) {
      console.error("SAVE JOB ERROR:", error)

      toast.add({
        title: "Unable to save job",
        description: getJobsErrorMessage(error),
        type: "error",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // --------------------------------
  // SUCCESS SCREEN
  // --------------------------------

  if (result) {
    const isDraft = result === "draft"
    const isUpdated = result === "updated"

    return (
      <div className="space-y-6">
        <PageHeader
          title={
            isUpdated
              ? "Job updated"
              : isDraft
                ? "Draft saved"
                : "Job published"
          }
          description={
            isUpdated
              ? "Your job post has been updated successfully."
              : isDraft
                ? "Your job post has been saved as a draft."
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
            {form.title || "Untitled role"}
            {isDraft
              ? " saved as draft"
              : isUpdated
                ? " updated successfully"
                : " is live"}
          </h2>

          <p className="mt-1 max-w-md text-sm text-[#8b8b96]">
            {isDraft
              ? "You can publish this job when you are ready."
              : isUpdated
                ? "Your updated job information is now saved."
                : "Applications can now arrive in your dashboard."}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              href="/dashboard/recruiter/jobs"
              className={primaryButton}
            >
              Go to Manage Jobs
            </Link>

            {!editId && (
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
            )}
          </div>
        </DashboardCard>
      </div>
    )
  }

  // --------------------------------
  // LOADING
  // --------------------------------

  if (
    sessionPending ||
    !editModeReady ||
    loadingJob ||
    (editId && !jobLoaded && !pageError)
  ) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 animate-pulse rounded bg-white/10" />

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <DashboardCard className="space-y-5 p-5">
              {Array.from({ length: 7 }).map((_, index) => (
                <div
                  key={index}
                  className="h-10 animate-pulse rounded bg-white/[0.06]"
                />
              ))}
            </DashboardCard>
          </div>

          <DashboardCard className="h-64 animate-pulse" />
        </div>
      </div>
    )
  }

  // --------------------------------
  // ERROR SCREEN
  // --------------------------------

  if (pageError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Unable to load job"
          description="We couldn't retrieve the job information."
        />

        <DashboardCard className="flex flex-col items-center gap-3 p-8 text-center">
          <AlertCircle className="size-9 text-red-400" />

          <p className="max-w-md text-sm text-[#a0a0ab]">
            {pageError}
          </p>

          <button
            type="button"
            onClick={() => void loadExistingJob()}
            className={primaryButton}
          >
            Try again
          </button>

          <Link
            href="/dashboard/recruiter/jobs"
            className={secondaryButton}
          >
            Back to jobs
          </Link>
        </DashboardCard>
      </div>
    )
  }

  // --------------------------------
  // MAIN FORM
  // --------------------------------

  return (
    <div className="space-y-6">
      <PageHeader
        title={editId ? "Edit Job" : "Post a Job"}
        description={
          editId
            ? "Update your job details and save your changes."
            : "Reach qualified candidates by creating a new job post."
        }
        actions={
          <Link
            href="/dashboard/recruiter/jobs"
            className={secondaryButton}
          >
            <ArrowLeft className="size-3.5" />
            Back to jobs
          </Link>
        }
      />

      <form
        onSubmit={(event) => {
          event.preventDefault()
          void handleSubmit("active")
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
                <FieldLabel htmlFor="job-title">
                  Job title *
                </FieldLabel>

                <input
                  id="job-title"
                  required
                  maxLength={120}
                  value={form.title}
                  onChange={(event) =>
                    update("title", event.target.value)
                  }
                  placeholder="e.g. Senior Product Designer"
                  className={inputClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="job-category">
                    Job category
                  </FieldLabel>

                  <select
                    id="job-category"
                    value={form.category}
                    onChange={(event) =>
                      update("category", event.target.value)
                    }
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
                  <FieldLabel htmlFor="job-type">
                    Job type
                  </FieldLabel>

                  <select
                    id="job-type"
                    value={form.type}
                    onChange={(event) =>
                      update("type", event.target.value)
                    }
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
                  <FieldLabel htmlFor="salary-min">
                    Salary min
                  </FieldLabel>

                  <input
                    id="salary-min"
                    type="number"
                    min="0"
                    value={form.salaryMin}
                    onChange={(event) =>
                      update("salaryMin", event.target.value)
                    }
                    placeholder="120000"
                    className={inputClass}
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="salary-max">
                    Salary max
                  </FieldLabel>

                  <input
                    id="salary-max"
                    type="number"
                    min="0"
                    value={form.salaryMax}
                    onChange={(event) =>
                      update("salaryMax", event.target.value)
                    }
                    placeholder="160000"
                    className={inputClass}
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="currency">
                    Currency
                  </FieldLabel>

                  <select
                    id="currency"
                    value={form.currency}
                    onChange={(event) =>
                      update("currency", event.target.value)
                    }
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
                  <FieldLabel htmlFor="job-location">
                    Location
                  </FieldLabel>

                  <input
                    id="job-location"
                    required={!remote}
                    disabled={remote}
                    value={remote ? "Remote" : form.location}
                    onChange={(event) =>
                      update("location", event.target.value)
                    }
                    placeholder="City, country"
                    className={cn(
                      inputClass,
                      remote && "opacity-60"
                    )}
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="job-deadline">
                    Application deadline
                  </FieldLabel>

                  <input
                    id="job-deadline"
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={form.deadline}
                    onChange={(event) =>
                      update("deadline", event.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <label className="flex w-fit cursor-pointer items-center gap-2 text-xs text-[#a0a0ab]">
                <input
                  type="checkbox"
                  checked={remote}
                  onChange={(event) => {
                    const checked = event.target.checked

                    setRemote(checked)

                    if (checked) {
                      update("location", "Remote")
                    } else {
                      update("location", "")
                    }
                  }}
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
                <FieldLabel htmlFor="responsibilities">
                  Responsibilities
                </FieldLabel>

                <textarea
                  id="responsibilities"
                  rows={5}
                  value={form.responsibilities}
                  onChange={(event) =>
                    update("responsibilities", event.target.value)
                  }
                  placeholder="What will this person own day to day?"
                  className={cn(inputClass, "resize-none")}
                />
              </div>

              <div>
                <FieldLabel htmlFor="requirements">
                  Requirements
                </FieldLabel>

                <textarea
                  id="requirements"
                  rows={5}
                  value={form.requirements}
                  onChange={(event) =>
                    update("requirements", event.target.value)
                  }
                  placeholder="Skills, experience, and qualifications."
                  className={cn(inputClass, "resize-none")}
                />
              </div>

              <div>
                <FieldLabel htmlFor="benefits">
                  Benefits (optional)
                </FieldLabel>

                <textarea
                  id="benefits"
                  rows={3}
                  value={form.benefits}
                  onChange={(event) =>
                    update("benefits", event.target.value)
                  }
                  placeholder="Equity, remote budget, learning stipend..."
                  className={cn(inputClass, "resize-none")}
                />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* RIGHT SIDEBAR */}

        <div className="space-y-4">
          <DashboardCard className="p-5">
            <h2 className="text-sm font-semibold text-[#ededef]">
              Ready to publish?
            </h2>

            <ul className="mt-3 space-y-2 text-[11px] text-[#8b8b96]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[#22c55e]" />
                Job information is ready
              </li>

              <li className="flex items-start gap-2">
                <Sparkles className="mt-0.5 size-3.5 shrink-0 text-[#b8b2ff]" />
                Featured placement available on Enterprise
              </li>
            </ul>

            <button
              type="submit"
              disabled={submitting}
              className={cn(primaryButton, "mt-5 w-full")}
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <BriefcaseBusiness className="size-4" />
              )}

              {submitting
                ? "Saving..."
                : editId
                  ? "Update job"
                  : "Publish job"}
            </button>

            {!editId && (
              <button
                type="button"
                disabled={submitting}
                onClick={() => void handleSubmit("draft")}
                className={cn(secondaryButton, "mt-2 w-full")}
              >
                <Clock className="size-4" />
                Save as draft
              </button>
            )}

            <p className="mt-3 text-center text-[10px] leading-relaxed text-[#6e6e78]">
              Your job information will be saved to HireLoop.
            </p>
          </DashboardCard>
        </div>
      </form>
    </div>
  )
}

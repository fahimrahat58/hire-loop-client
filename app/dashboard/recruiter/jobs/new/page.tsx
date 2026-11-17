"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type FormEvent,
} from "react"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react"

import { authClient } from "@/app/lib/auth-client"

import {
  getJob,
  createJob,
  updateJob,
  getJobsErrorMessage,
  getBillingSummary,
  isJobsApiError,
  type JobUser,
  type JobInput,
  type ApiJob,
} from "@/app/lib/jobs-api"

import { rememberJobOwner } from "@/app/lib/job-ownership"

import { toast } from "sonner"

import { cn } from "@/lib/utils"

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#ccff00]/40 disabled:cursor-not-allowed disabled:opacity-50"

const primaryButton =
  "rounded-xl bg-[#ccff00] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#d7ff33] disabled:cursor-not-allowed disabled:opacity-60"

const secondaryButton =
  "rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/5"

function DashboardCard({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#151515] p-5">
      {children}
    </section>
  )
}

function SectionCard({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#151515] p-6">
      {children}
    </section>
  )
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-2 block text-sm font-medium text-white/80">
      {children}
    </label>
  )
}

function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-white">{title}</h1>
        <p className="mt-2 text-sm text-white/50">{description}</p>
      </div>
      {action}
    </header>
  )
}

type ResultType = "published" | "draft" | "updated" | null

type FormState = {
  title: string
  company: string
  category: string
  salaryMin: string
  salaryMax: string
  currency: string
  location: string
  responsibilities: string
  requirements: string
  benefits: string
}

const initialForm: FormState = {
  title: "",
  company: "",
  category: "Design",
  salaryMin: "",
  salaryMax: "",
  currency: "USD",
  location: "",
  responsibilities: "",
  requirements: "",
  benefits: "",
}

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "")

function UpgradeDialog({
  open,
  onClose,
  upgrading,
  onUpgrade,
}: {
  open: boolean
  onClose: () => void
  upgrading: boolean
  onUpgrade: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#151515] p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          disabled={upgrading}
          className="absolute top-4 right-4 rounded-lg p-2 text-white/50 transition hover:bg-white/5 hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#ccff00]/10">
          <Sparkles className="h-6 w-6 text-[#ccff00]" />
        </div>

        <h2 className="text-xl font-semibold text-white">
          Free Plan Limit Reached
        </h2>

        <p className="mt-2 text-sm leading-6 text-white/60">
          You have reached the maximum of 5 active jobs on the free plan.
          Upgrade to Premium to publish more jobs.
        </p>

        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Free Plan</span>
            <span className="text-sm font-medium text-white">5 jobs</span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-white/60">Premium</span>
            <span className="text-sm font-medium text-[#ccff00]">
              More job postings
            </span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={upgrading}
            className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onUpgrade}
            disabled={upgrading}
            className="flex-1 rounded-xl bg-[#ccff00] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#d7ff33] disabled:opacity-60"
          >
            {upgrading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirecting...
              </span>
            ) : (
              "Upgrade to Premium"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RecruiterNewJobPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const editId = searchParams.get("edit")

  const [session, setSession] = useState<any>(null)
  const [sessionLoading, setSessionLoading] = useState(true)

  const [form, setForm] = useState<FormState>(initialForm)
  const [remote, setRemote] = useState(false)

  const [result, setResult] = useState<ResultType>(null)

  const [loadingJob, setLoadingJob] = useState(Boolean(editId))

  const [submitting, setSubmitting] = useState(false)
  const [upgrading, setUpgrading] = useState(false)

  const [pageError, setPageError] = useState("")

  const [jobStatus, setJobStatus] = useState<"active" | "draft">("active")

  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)

  const activeRequestRef = useRef<AbortController | null>(null)

  const currentUser: JobUser = {
    id: session?.user?.id ?? session?.user?._id ?? null,
    email: session?.user?.email ?? null,
    role: session?.user?.role ?? session?.user?.userType ?? null,
  }

  // Load authenticated user
  const loadSession = useCallback(async () => {
    try {
      setSessionLoading(true)

      const { data, error } = await authClient.getSession()

      if (error) {
        throw new Error(error.message || "Unable to load session.")
      }

      setSession(data?.session ? data : null)
    } catch (error) {
      console.error("Session loading error:", error)
      setSession(null)
    } finally {
      setSessionLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSession()
  }, [loadSession])

  // Load existing job for editing
  const loadExistingJob = useCallback(async () => {
    if (!editId) {
      setLoadingJob(false)
      return
    }

    if (sessionLoading) return

    if (!currentUser.id && !currentUser.email) {
      setPageError("You must be logged in to edit a job.")
      setLoadingJob(false)
      return
    }

    try {
      setLoadingJob(true)
      setPageError("")

      const job = await getJob(editId)

      const userRole = String(currentUser.role || "").toLowerCase()

      if (userRole && userRole !== "recruiter" && userRole !== "admin") {
        throw new Error("Only recruiters can edit jobs.")
      }

      const jobOwnerId =
        job.recruiterId || job.createdBy || job.ownerId || job.userId

      const jobOwnerEmail = job.ownerEmail

      const isAdmin = userRole === "admin"

      const ownsJob =
        isAdmin ||
        (!!currentUser.id &&
          !!jobOwnerId &&
          String(currentUser.id) === String(jobOwnerId)) ||
        (!!currentUser.email &&
          !!jobOwnerEmail &&
          currentUser.email.toLowerCase() ===
            String(jobOwnerEmail).toLowerCase())

      if (!ownsJob) {
        throw new Error("You are not allowed to edit this job.")
      }

      // FIX: rememberJobOwner expects ApiJob, not a string ID.
      rememberJobOwner(job, currentUser)

      const status =
        String(job.status || "").toLowerCase() === "draft" ? "draft" : "active"

      setJobStatus(status)

      const description = String(job.description || "")

      const getSection = (name: string) => {
        const regex = new RegExp(
          `${name}:\\s*([\\s\\S]*?)(?=\\n\\n[A-Za-z ]+:|$)`,
          "i"
        )

        const match = description.match(regex)

        return match?.[1]?.trim() || ""
      }

      const salary = String(job.salary || "")

      let salaryMin = ""
      let salaryMax = ""

      const salaryNumbers = salary.match(/\d+(?:\.\d+)?/g)

      if (salaryNumbers?.length) {
        salaryMin = salaryNumbers[0] || ""
        salaryMax = salaryNumbers[1] || ""
      }

      const jobLocation = String(job.location || "")

      const isRemote =
        jobLocation.toLowerCase() === "remote" ||
        jobLocation.toLowerCase().includes("remote")

      setRemote(isRemote)

      setForm({
        title: String(job.title || ""),
        company: String(job.company || ""),
        category: String(job.category || "Design"),
        salaryMin,
        salaryMax,
        currency: String(job.currency || "USD"),
        location: isRemote ? "" : jobLocation,
        responsibilities: getSection("Responsibilities"),
        requirements: getSection("Requirements"),
        benefits: getSection("Benefits"),
      })
    } catch (error) {
      console.error("Load job error:", error)

      setPageError(
        getJobsErrorMessage(error, "Unable to load this job. Please try again.")
      )
    } finally {
      setLoadingJob(false)
    }
  }, [
    editId,
    sessionLoading,
    currentUser.id,
    currentUser.email,
    currentUser.role,
  ])

  useEffect(() => {
    loadExistingJob()
  }, [loadExistingJob])

  // Form change
  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))

    setPageError("")
  }

  // Form validation
  const validateForm = () => {
    if (!form.title.trim()) {
      return "Please enter a job title."
    }

    if (!form.company.trim()) {
      return "Please enter the company name."
    }

    if (!remote && !form.location.trim()) {
      return "Please enter a location or enable Remote."
    }

    if (form.salaryMin.trim() && Number.isNaN(Number(form.salaryMin))) {
      return "Minimum salary must be a valid number."
    }

    if (form.salaryMax.trim() && Number.isNaN(Number(form.salaryMax))) {
      return "Maximum salary must be a valid number."
    }

    if (
      form.salaryMin.trim() &&
      form.salaryMax.trim() &&
      Number(form.salaryMax) < Number(form.salaryMin)
    ) {
      return "Maximum salary cannot be lower than minimum salary."
    }

    return null
  }

  // Build salary
  const buildSalary = () => {
    const min = form.salaryMin.trim()
    const max = form.salaryMax.trim()

    if (!min && !max) return ""

    const symbolMap: Record<string, string> = {
      USD: "$",
      BDT: "৳",
      EUR: "€",
      GBP: "£",
    }

    const symbol = symbolMap[form.currency] || form.currency

    if (min && max) return `${symbol}${min}k - ${symbol}${max}k`

    if (min) return `${symbol}${min}k+`

    return `Up to ${symbol}${max}k`
  }

  // Build description
  const buildDescription = () => {
    const sections: string[] = []

    if (form.responsibilities.trim()) {
      sections.push(`Responsibilities:\n${form.responsibilities.trim()}`)
    }

    if (form.requirements.trim()) {
      sections.push(`Requirements:\n${form.requirements.trim()}`)
    }

    if (form.benefits.trim()) {
      sections.push(`Benefits:\n${form.benefits.trim()}`)
    }

    return sections.join("\n\n")
  }

  // Build API payload
  const buildPayload = (status: "active" | "draft"): JobInput => ({
    title: form.title.trim(),
    company: form.company.trim(),
    category: form.category,
    location: remote ? "Remote" : form.location.trim(),
    salary: buildSalary(),
    description: buildDescription(),
    status,
    closed: status === "draft",
  })

  // Premium upgrade
  const handleUpgrade = async () => {
    try {
      setUpgrading(true)

      const { data, error } = await authClient.token()

      if (error || !data?.token) {
        throw new Error("Unable to authenticate your account.")
      }

      const response = await fetch(
        `${API_URL}/api/billing/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`,
          },
          credentials: "include",
          body: JSON.stringify({
            plan: "premium",
          }),
        }
      )

      const body = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          body?.message || "Unable to create the checkout session."
        )
      }

      if (!body?.url) {
        throw new Error("Checkout URL was not returned.")
      }

      window.location.href = body.url
    } catch (error) {
      console.error("Upgrade error:", error)

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to start the upgrade process."
      )

      setUpgrading(false)
    }
  }

  // Submit job
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (submitting) return

    setPageError("")

    const validationError = validateForm()

    if (validationError) {
      setPageError(validationError)
      toast.error(validationError)
      return
    }

    if (!currentUser.id && !currentUser.email) {
      const message = "Please log in before publishing a job."

      setPageError(message)
      toast.error(message)
      return
    }

    const controller = new AbortController()

    activeRequestRef.current?.abort()
    activeRequestRef.current = controller

    setSubmitting(true)

    const targetStatus = jobStatus
    const isPublishing = targetStatus === "active"

    try {
      const payload = buildPayload(targetStatus)

      let savedJob: ApiJob

      if (editId) {
        savedJob = await updateJob(editId, payload, {
          signal: controller.signal,
        })
      } else {
        savedJob = await createJob(payload, {
          signal: controller.signal,
        })
      }

      // FIX: pass the complete ApiJob object.
      if (savedJob?._id) {
        rememberJobOwner(savedJob, currentUser)
      }

      if (targetStatus === "draft") {
        setResult("draft")

        toast.success(
          editId ? "Job draft updated successfully." : "Job saved as draft."
        )

        router.refresh()
        return
      }

      setResult(editId ? "updated" : "published")

      toast.success("Job published successfully!")

      // Backend is the source of truth for the 5-job limit.
      try {
        await getBillingSummary({
          signal: controller.signal,
        })
      } catch (billingError) {
        console.warn(
          "Billing summary refresh failed after publishing:",
          billingError
        )
      }

      router.refresh()
    } catch (error) {
      console.error("Job submit error:", error)

      if (error instanceof DOMException && error.name === "AbortError") {
        return
      }

      if (isJobsApiError(error) && error.status === 429) {
        setShowUpgradeDialog(true)
        return
      }

      const message = getJobsErrorMessage(
        error,
        isPublishing
          ? "Unable to publish this job. Please try again."
          : "Unable to save this job. Please try again."
      )

      setPageError(message)
      toast.error(message)
    } finally {
      if (activeRequestRef.current === controller) {
        activeRequestRef.current = null
      }

      setSubmitting(false)
    }
  }

  // Loading state
  if (sessionLoading || loadingJob) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-white/60">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  // Success state
  if (result) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-[#151515] p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ccff00]/10">
            <CheckCircle2 className="h-8 w-8 text-[#ccff00]" />
          </div>

          <h1 className="mt-5 text-2xl font-semibold text-white">
            {result === "draft"
              ? "Job Saved as Draft"
              : result === "updated"
                ? "Job Published Successfully"
                : "Job Published Successfully"}
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/60">
            {result === "draft"
              ? "Your job has been saved as a draft. You can publish it later."
              : "Your job has been published successfully."}
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/recruiter/jobs"
              className={cn(
                primaryButton,
                "inline-flex items-center justify-center"
              )}
            >
              View My Jobs
            </Link>

            <button
              type="button"
              onClick={() => {
                setResult(null)

                if (!editId) {
                  setForm(initialForm)
                  setRemote(false)
                  setJobStatus("active")
                }
              }}
              className={cn(
                secondaryButton,
                "inline-flex items-center justify-center"
              )}
            >
              {result === "draft" ? "Continue Editing" : "Post Another Job"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <UpgradeDialog
        open={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        upgrading={upgrading}
        onUpgrade={handleUpgrade}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title={editId ? "Edit Job" : "Post a Job"}
          description={
            editId
              ? "Update your job posting and publish the latest changes."
              : "Find the right candidate by creating a clear and compelling job post."
          }
          action={
            <Link
              href="/recruiter/jobs"
              className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Jobs
            </Link>
          }
        />

        {pageError && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">
              <p>{pageError}</p>
            </div>

            <button
              type="button"
              onClick={() => setPageError("")}
              className="text-red-300/60 transition hover:text-red-200"
              aria-label="Close error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
        >
          <div className="space-y-6">
            <SectionCard>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ccff00]/10">
                  <BriefcaseBusiness className="h-5 w-5 text-[#ccff00]" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Job Information
                  </h2>

                  <p className="text-sm text-white/50">
                    Basic information about the position.
                  </p>
                </div>
              </div>

              <div className="grid gap-5">
                <div>
                  <FieldLabel>Job Title</FieldLabel>

                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="e.g. Senior UI/UX Designer"
                    className={inputClass}
                    disabled={submitting}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Company</FieldLabel>

                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => handleChange("company", e.target.value)}
                      placeholder="Company name"
                      className={inputClass}
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <FieldLabel>Category</FieldLabel>

                    <select
                      value={form.category}
                      onChange={(e) => handleChange("category", e.target.value)}
                      className={inputClass}
                      disabled={submitting}
                    >
                      <option value="Design">Design</option>
                      <option value="Development">Development</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Writing">Writing</option>
                      <option value="Finance">Finance</option>
                      <option value="Sales">Sales</option>
                      <option value="Customer Support">Customer Support</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <FieldLabel>Location</FieldLabel>

                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                      placeholder="e.g. Dhaka, Bangladesh"
                      className={cn(inputClass, remote && "opacity-50")}
                      disabled={submitting || remote}
                    />

                    <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm text-white/60">
                      <input
                        type="checkbox"
                        checked={remote}
                        onChange={(e) => {
                          setRemote(e.target.checked)

                          if (e.target.checked) {
                            handleChange("location", "")
                          }
                        }}
                        disabled={submitting}
                        className="h-4 w-4 accent-[#ccff00]"
                      />
                      Remote
                    </label>
                  </div>
                </div>

                <div>
                  <FieldLabel>Salary</FieldLabel>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <input
                      type="number"
                      min="0"
                      value={form.salaryMin}
                      onChange={(e) =>
                        handleChange("salaryMin", e.target.value)
                      }
                      placeholder="Min"
                      className={inputClass}
                      disabled={submitting}
                    />

                    <input
                      type="number"
                      min="0"
                      value={form.salaryMax}
                      onChange={(e) =>
                        handleChange("salaryMax", e.target.value)
                      }
                      placeholder="Max"
                      className={inputClass}
                      disabled={submitting}
                    />

                    <select
                      value={form.currency}
                      onChange={(e) => handleChange("currency", e.target.value)}
                      className={inputClass}
                      disabled={submitting}
                    >
                      <option value="USD">USD</option>
                      <option value="BDT">BDT</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white">
                  Job Description
                </h2>

                <p className="mt-1 text-sm text-white/50">
                  Give candidates a clear idea of what the role involves.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <FieldLabel>Responsibilities</FieldLabel>

                  <textarea
                    value={form.responsibilities}
                    onChange={(e) =>
                      handleChange("responsibilities", e.target.value)
                    }
                    placeholder="Describe the main responsibilities of this role..."
                    rows={6}
                    className={cn(inputClass, "resize-y py-3")}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <FieldLabel>Requirements</FieldLabel>

                  <textarea
                    value={form.requirements}
                    onChange={(e) =>
                      handleChange("requirements", e.target.value)
                    }
                    placeholder="List the required skills, experience and qualifications..."
                    rows={6}
                    className={cn(inputClass, "resize-y py-3")}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <FieldLabel>Benefits</FieldLabel>

                  <textarea
                    value={form.benefits}
                    onChange={(e) => handleChange("benefits", e.target.value)}
                    placeholder="Mention salary benefits, flexible hours, remote work, etc."
                    rows={5}
                    className={cn(inputClass, "resize-y py-3")}
                    disabled={submitting}
                  />
                </div>
              </div>
            </SectionCard>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/recruiter/jobs"
                className={cn(
                  secondaryButton,
                  "inline-flex items-center justify-center"
                )}
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  primaryButton,
                  "inline-flex min-w-[160px] items-center justify-center gap-2"
                )}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {jobStatus === "draft" ? "Saving..." : "Publishing..."}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    {jobStatus === "draft"
                      ? "Save Draft"
                      : editId
                        ? "Publish Changes"
                        : "Publish Job"}
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <DashboardCard>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
                  <Clock className="h-5 w-5 text-white/70" />
                </div>

                <div>
                  <h3 className="font-medium text-white">Job Visibility</h3>

                  <p className="mt-1 text-sm leading-6 text-white/50">
                    Published jobs are visible to job seekers. Draft jobs remain
                    private until published.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={() => setJobStatus("active")}
                  disabled={submitting}
                  className={cn(
                    "w-full rounded-xl border px-4 py-3 text-left transition",
                    jobStatus === "active"
                      ? "border-[#ccff00]/40 bg-[#ccff00]/10"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">
                      Publish immediately
                    </span>

                    {jobStatus === "active" && (
                      <CheckCircle2 className="h-4 w-4 text-[#ccff00]" />
                    )}
                  </div>

                  <p className="mt-1 text-xs text-white/40">
                    Job seekers can discover and apply.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setJobStatus("draft")}
                  disabled={submitting}
                  className={cn(
                    "w-full rounded-xl border px-4 py-3 text-left transition",
                    jobStatus === "draft"
                      ? "border-[#ccff00]/40 bg-[#ccff00]/10"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">
                      Save as draft
                    </span>

                    {jobStatus === "draft" && (
                      <CheckCircle2 className="h-4 w-4 text-[#ccff00]" />
                    )}
                  </div>

                  <p className="mt-1 text-xs text-white/40">
                    Keep it private and finish later.
                  </p>
                </button>
              </div>
            </DashboardCard>

            <DashboardCard>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ccff00]/10">
                  <Sparkles className="h-5 w-5 text-[#ccff00]" />
                </div>

                <div>
                  <h3 className="font-medium text-white">Free Plan</h3>

                  <p className="mt-1 text-sm leading-6 text-white/50">
                    Free recruiter accounts can publish up to 5 active jobs.
                    Premium gives you more publishing capacity.
                  </p>
                </div>
              </div>
            </DashboardCard>
          </div>
        </form>
      </div>
    </>
  )
}

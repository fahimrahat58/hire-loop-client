"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Check,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react"
import { toast } from "sonner"

import { authClient } from "@/app/lib/auth-client"
import {
  Avatar,
  DashboardCard,
  EmptyState,
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
  roleLabel: string
}

function isValidImageUrl(value: string) {
  if (!value) return true

  try {
    const parsed = new URL(value)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

export function ProfileSettings({
  pageTitle = "Settings",
  description = "Manage the account information supported by HireLoop.",
  roleLabel,
}: ProfileSettingsProps) {
  const router = useRouter()

  const { data: session, isPending, refetch } = authClient.useSession()

  const [name, setName] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [savingProfile, setSavingProfile] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    if (!session?.user) return

    setName(session.user.name || "")
    setImageUrl(session.user.image || "")
  }, [session])

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      toast.error("Please enter your full name.")
      return
    }

    if (!isValidImageUrl(imageUrl.trim())) {
      toast.error("Please enter a valid image URL starting with http or https.")
      return
    }

    setSavingProfile(true)

    try {
      const result = await authClient.updateUser({
        name: name.trim(),
        image: imageUrl.trim() || null,
      })

      if (result.error) {
        throw new Error(result.error.message || "Profile update failed.")
      }

      await refetch()
      toast.success("Profile updated successfully.")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update your profile."
      )
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error("Enter your current password.")
      return
    }

    if (newPassword.length < 8) {
      toast.error("Your new password must be at least 8 characters.")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("The new passwords do not match.")
      return
    }

    setChangingPassword(true)

    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      })

      if (result.error) {
        throw new Error(result.error.message || "Password change failed.")
      }

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success("Password changed successfully.")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to change your password."
      )
    } finally {
      setChangingPassword(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await authClient.signOut()
      router.push("/")
      router.refresh()
    } catch {
      toast.error("Unable to sign out. Please try again.")
    }
  }

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-white/[0.06]" />

        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="h-72 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.03]"
            />
          ))}
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <DashboardCard>
        <EmptyState
          title="Sign in to manage your settings"
          description="Account settings are managed through your HireLoop session."
          action={
            <Link href="/sign-in" className={primaryButton}>
              Sign in
            </Link>
          }
        />
      </DashboardCard>
    )
  }

  const memberSince = session.user.createdAt
    ? new Date(session.user.createdAt as Date | string).toLocaleDateString(
        "en-US",
        {
          month: "long",
          year: "numeric",
        }
      )
    : "—"

  return (
    <div className="space-y-6">
      <PageHeader
        title={pageTitle}
        description={description}
        actions={<StatusBadge status={roleLabel} />}
      />

      <div className="flex flex-col gap-3 rounded-xl border border-[#5c53fe]/25 bg-[#5c53fe]/10 px-4 py-3 text-[13px] text-[#c7c2ff] sm:flex-row sm:items-start">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" />

        <div>
          <p className="font-medium">Only supported account fields are shown</p>
          <p className="mt-0.5 text-[12px] text-[#a79fff]">
            Name, profile image, and password are handled by Better Auth. The
            backend does not store headline, bio, skills, resume, notification
            preferences, or job preferences, so those fields are not presented
            as working settings.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Profile information"
          description="This is how you appear across HireLoop."
          bodyClassName="p-5"
        >
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
              <FieldLabel htmlFor="profile-image">Profile image URL</FieldLabel>

              <input
                id="profile-image"
                type="url"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://example.com/profile.jpg"
                className={inputClass}
              />

              <p className="mt-2 text-[11px] text-[#6e6e78]">
                Paste a public image URL, or leave it empty to use your
                initials.
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
                placeholder="Enter your full name"
                className={inputClass}
              />
            </div>

            <div>
              <FieldLabel htmlFor="profile-email">Email address</FieldLabel>

              <input
                id="profile-email"
                type="email"
                value={session.user.email}
                readOnly
                className={cn(inputClass, "cursor-not-allowed opacity-70")}
              />

              <p className="mt-1 text-[11px] text-[#6e6e78]">
                Email changes are not enabled in the current authentication
                configuration.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleUpdateProfile()}
            disabled={savingProfile}
            className={cn(primaryButton, "mt-5")}
          >
            {savingProfile ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Check className="size-3.5" />
            )}
            {savingProfile ? "Updating..." : "Update profile"}
          </button>
        </SectionCard>

        <SectionCard
          title="Password"
          description="Change the password used to sign in."
          bodyClassName="p-5"
        >
          <div className="space-y-4">
            <div>
              <FieldLabel htmlFor="current-password">
                Current password
              </FieldLabel>

              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Enter your current password"
                className={inputClass}
              />
            </div>

            <div>
              <FieldLabel htmlFor="new-password">New password</FieldLabel>

              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="At least 8 characters"
                className={inputClass}
              />
            </div>

            <div>
              <FieldLabel htmlFor="confirm-password">
                Confirm new password
              </FieldLabel>

              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat your new password"
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleChangePassword()}
            disabled={changingPassword}
            className={cn(primaryButton, "mt-5")}
          >
            {changingPassword ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <KeyRound className="size-3.5" />
            )}
            {changingPassword ? "Changing..." : "Change password"}
          </button>

          <p className="mt-3 text-[11px] leading-relaxed text-[#6e6e78]">
            Changing your password also revokes other active sessions.
          </p>
        </SectionCard>
      </div>

      <SectionCard
        title="Account"
        description="Read-only details from your verified session."
        bodyClassName="p-5"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-white/[0.06] bg-[#0f0f13] p-3">
            <p className="flex items-center gap-1.5 text-[11px] text-[#7c7c86]">
              <UserRound className="size-3.5" />
              Name
            </p>
            <p className="mt-1 truncate text-[13px] font-medium text-[#ededef]">
              {session.user.name || "—"}
            </p>
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-[#0f0f13] p-3">
            <p className="flex items-center gap-1.5 text-[11px] text-[#7c7c86]">
              <Mail className="size-3.5" />
              Email
            </p>
            <p className="mt-1 truncate text-[13px] font-medium text-[#ededef]">
              {session.user.email}
            </p>
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-[#0f0f13] p-3">
            <p className="flex items-center gap-1.5 text-[11px] text-[#7c7c86]">
              <ShieldCheck className="size-3.5" />
              Member since
            </p>
            <p className="mt-1 truncate text-[13px] font-medium text-[#ededef]">
              {memberSince}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-[#6e6e78]">
            Signed in as{" "}
            <span className="text-[#a0a0ab]">{session.user.email}</span>
          </p>

          <button
            type="button"
            onClick={() => void handleSignOut()}
            className={secondaryButton}
          >
            <LogOut className="size-3.5" />
            Sign out
          </button>
        </div>
      </SectionCard>
    </div>
  )
}

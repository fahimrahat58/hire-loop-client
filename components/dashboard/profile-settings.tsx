"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Check,
  ImagePlus,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  ShieldCheck,
  Trash2,
  Upload,
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
  /**
   * The Profile page reuses this component but only shows account details.
   * Settings keeps the password form.
   */
  showSecurity?: boolean
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
])

type ImgbbUploadResponse = {
  success?: boolean
  data?: {
    url?: string
    display_url?: string
  }
  error?: {
    message?: string
  }
}

async function uploadToImgbb(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY

  if (!apiKey) {
    throw new Error(
      "Image upload is not configured. Please set NEXT_PUBLIC_IMGBB_API_KEY."
    )
  }

  const formData = new FormData()
  formData.append("key", apiKey)
  formData.append("image", file)

  const response = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: formData,
  })

  let payload: ImgbbUploadResponse | null = null

  try {
    payload = (await response.json()) as ImgbbUploadResponse
  } catch {
    payload = null
  }

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.error?.message || "Failed to upload profile image to ImgBB."
    )
  }

  const imageUrl = payload.data?.display_url || payload.data?.url

  if (!imageUrl) {
    throw new Error("ImgBB did not return an image URL.")
  }

  return imageUrl
}

export function ProfileSettings({
  pageTitle = "Settings",
  description = "Manage the account information supported by HireLoop.",
  roleLabel,
  showSecurity = true,
}: ProfileSettingsProps) {
  const router = useRouter()

  const { data: session, isPending, refetch } = authClient.useSession()

  const [name, setName] = useState("")
  const [savedImage, setSavedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!session?.user) return

    setName(session.user.name || "")
    setSavedImage(session.user.image || null)
  }, [session])

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const clearSelectedImage = () => {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }

    setSelectedFile(null)
    setPreviewUrl(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      toast.error("Please select a JPEG, JPG, PNG, or WebP image.")
      event.target.value = ""
      return
    }

    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image is too large. Maximum allowed size is 5 MB.")
      event.target.value = ""
      return
    }

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleUploadImage = async () => {
    if (!selectedFile) {
      toast.error("Please select a profile image to upload.")
      return
    }

    setUploadingImage(true)

    try {
      const imageUrl = await uploadToImgbb(selectedFile)

      const result = await authClient.updateUser({
        image: imageUrl,
      })

      if (result.error) {
        throw new Error(
          result.error.message || "Failed to save the profile image."
        )
      }

      setSavedImage(imageUrl)
      clearSelectedImage()
      await refetch()
      router.refresh()
      toast.success("Profile image updated successfully.")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to upload the profile image."
      )
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = async () => {
    setUploadingImage(true)

    try {
      const result = await authClient.updateUser({
        image: null,
      })

      if (result.error) {
        throw new Error(result.error.message || "Failed to remove image.")
      }

      setSavedImage(null)
      clearSelectedImage()
      await refetch()
      router.refresh()
      toast.success("Profile image removed.")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to remove the profile image."
      )
    } finally {
      setUploadingImage(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      toast.error("Please enter your full name.")
      return
    }

    setSavingProfile(true)

    try {
      const result = await authClient.updateUser({
        name: name.trim(),
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

  const displayImage = previewUrl || savedImage

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
            {showSecurity
              ? "Name, profile image, and password are handled by supported account flows. Profile images are uploaded to ImgBB from the frontend and the returned URL is saved to your user profile."
              : "Name and profile image are handled by supported account flows. Profile images are uploaded to ImgBB from the frontend and the returned URL is saved to your user profile."}
          </p>
        </div>
      </div>

      <div
        className={cn("grid gap-4", showSecurity && "lg:grid-cols-2")}
      >
        <SectionCard
          title="Profile information"
          description="This is how you appear across HireLoop."
          bodyClassName="p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {displayImage ? (
              <img
                src={displayImage}
                alt={name || "Profile"}
                className="size-20 shrink-0 rounded-full border border-white/10 object-cover"
              />
            ) : (
              <Avatar name={name || session.user.name || "User"} size="xl" />
            )}

            <div className="min-w-0 flex-1">
              <FieldLabel htmlFor="profile-image-file">Profile picture</FieldLabel>

              <input
                ref={fileInputRef}
                id="profile-image-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageSelect}
                className={cn(inputClass, "py-2 file:mr-3 file:rounded-md file:border-0 file:bg-white/[0.08] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[#ededef]")}
              />

              <p className="mt-2 text-[11px] text-[#6e6e78]">
                Choose a JPEG, JPG, PNG, or WebP image up to 5 MB. A preview is shown before upload.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleUploadImage()}
                  disabled={uploadingImage || !selectedFile}
                  className={primaryButton}
                >
                  {uploadingImage ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Upload className="size-3.5" />
                  )}
                  {uploadingImage ? "Uploading..." : "Upload image"}
                </button>

                {selectedFile ? (
                  <button
                    type="button"
                    onClick={clearSelectedImage}
                    disabled={uploadingImage}
                    className={secondaryButton}
                  >
                    <ImagePlus className="size-3.5" />
                    Clear selection
                  </button>
                ) : null}

                {!selectedFile && savedImage ? (
                  <button
                    type="button"
                    onClick={() => void handleRemoveImage()}
                    disabled={uploadingImage}
                    className={secondaryButton}
                  >
                    <Trash2 className="size-3.5" />
                    Remove image
                  </button>
                ) : null}
              </div>

              {selectedFile ? (
                <p className="mt-2 text-[11px] text-[#a0a0ab]">
                  Selected: {selectedFile.name}
                </p>
              ) : null}
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

        {showSecurity && (
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
        )}
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

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signUp } from "@/app/lib/auth-client"
import { Eye, EyeOff, ImagePlus, Loader2, UserRound, X } from "lucide-react"

type UserRole = "seeker" | "recruiter"

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

export default function SignUpPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<UserRole>("seeker")

  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState<string | null>(null)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    return () => {
      if (profilePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(profilePreview)
      }
    }
  }, [profilePreview])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setError("Please select a valid image file (JPG, JPEG, PNG, or WEBP).")
      e.target.value = ""
      return
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image size must be 5MB or less.")
      e.target.value = ""
      return
    }

    if (profilePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(profilePreview)
    }

    setError("")
    setProfileImage(file)
    setProfilePreview(URL.createObjectURL(file))
  }

  const clearImage = () => {
    if (profilePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(profilePreview)
    }

    setProfileImage(null)
    setProfilePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    try {
      setLoading(true)

      let imageUrl: string | undefined

      if (profileImage) {
        try {
          setUploadingImage(true)
          imageUrl = await uploadToImgbb(profileImage)
        } finally {
          setUploadingImage(false)
        }
      }

      const { error } = await signUp.email({
        name,
        email,
        password,
        role,
        ...(imageUrl ? { image: imageUrl } : {}),
        callbackURL: "/",
      })

      if (error) {
        setError(error.message || "Something went wrong.")
        return
      }

      router.push("/")
      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your account. Please try again."
      )
    } finally {
      setUploadingImage(false)
      setLoading(false)
    }
  }

  return (
    <main className="relative z-10 flex min-h-[85vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1a1a]/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold text-white">Create an account</h1>

          <p className="mt-2 text-sm text-gray-400">
            Join HireLoop and find your dream job.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Profile Image (optional) */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Profile Image <span className="text-gray-500">(optional)</span>
            </label>

            <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-[#111] p-3">
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt="Profile preview"
                  className="size-16 rounded-full border border-white/10 object-cover"
                />
              ) : (
                <span className="inline-flex size-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-gray-400">
                  <UserRound className="size-7" />
                </span>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-[#1a1a1f] px-3 py-2 text-xs font-medium text-[#d4d4d8] transition hover:border-white/20 hover:bg-[#222228]">
                    <ImagePlus className="size-3.5" />
                    {profileImage ? "Change image" : "Choose image"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  {profileImage ? (
                    <button
                      type="button"
                      onClick={clearImage}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-transparent px-3 py-2 text-xs font-medium text-gray-300 transition hover:border-white/20 hover:text-white"
                    >
                      <X className="size-3.5" />
                      Remove
                    </button>
                  ) : null}
                </div>

                <p className="mt-2 text-[11px] text-gray-500">
                  JPG, JPEG, PNG, or WEBP. Max 5MB.
                </p>
                {profileImage ? (
                  <p className="mt-1 truncate text-[11px] text-gray-400">
                    Selected: {profileImage.name}
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-gray-500">
                    No image selected — default avatar will be used.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              minLength={2}
              autoComplete="name"
              className="w-full rounded-lg border border-white/10 bg-[#111] px-4 py-3 text-sm text-white transition outline-none placeholder:text-gray-500 focus:border-[#7b61ff]"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-white/10 bg-[#111] px-4 py-3 text-sm text-white transition outline-none placeholder:text-gray-500 focus:border-[#7b61ff]"
            />
          </div>

          {/* Role */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-300">
              Select Your Role
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("seeker")}
                className={`rounded-lg border p-3 text-left transition ${
                  role === "seeker"
                    ? "border-[#7b61ff] bg-[#7b61ff]/10"
                    : "border-white/10 bg-[#111] hover:border-white/30"
                }`}
              >
                <span className="block text-sm font-semibold text-white">
                  Job Seeker
                </span>
                <span className="mt-1 block text-xs text-gray-400">
                  Find your dream job
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole("recruiter")}
                className={`rounded-lg border p-3 text-left transition ${
                  role === "recruiter"
                    ? "border-[#7b61ff] bg-[#7b61ff]/10"
                    : "border-white/10 bg-[#111] hover:border-white/30"
                }`}
              >
                <span className="block text-sm font-semibold text-white">
                  Recruiter
                </span>
                <span className="mt-1 block text-xs text-gray-400">
                  Hire talented people
                </span>
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-lg border border-white/5 bg-[#111] px-3 py-2.5 opacity-60">
              <div>
                <p className="text-sm font-medium text-gray-300">Admin</p>
                <p className="text-xs text-gray-500">Assigned by platform</p>
              </div>

              <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] text-gray-400">
                Restricted
              </span>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-lg border border-white/10 bg-[#111] px-4 py-3 pr-12 text-sm text-white transition outline-none placeholder:text-gray-500 focus:border-[#7b61ff]"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                autoComplete="new-password"
                className="w-full rounded-lg border border-white/10 bg-[#111] px-4 py-3 pr-12 text-sm text-white transition outline-none placeholder:text-gray-500 focus:border-[#7b61ff]"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-white"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#7b61ff] py-3 text-sm font-semibold text-white transition hover:bg-[#6a4fff] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {uploadingImage ? "Uploading image..." : "Creating Account..."}
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-[#7b61ff] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}

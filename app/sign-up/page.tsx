"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signUp } from "@/app/lib/auth-client"
import { Eye, EyeOff } from "lucide-react"

type UserRole = "seeker" | "recruiter"

export default function SignUpPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<UserRole>("seeker")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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

      const { error } = await signUp.email({
        name,
        email,
        password,
        role,
        callbackURL: "/",
      })

      if (error) {
        setError(error.message || "Something went wrong.")
        return
      }

      router.push("/")
      router.refresh()
    } catch {
      setError("Unable to create your account. Please try again.")
    } finally {
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
            className="w-full rounded-lg bg-[#7b61ff] py-3 text-sm font-semibold text-white transition hover:bg-[#6a4fff] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Account"}
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

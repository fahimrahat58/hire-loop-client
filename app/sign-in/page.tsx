"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "@/app/lib/auth-client"
import { Eye, EyeOff } from "lucide-react"

export default function SignInPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (!email.trim() || !password) {
      setError("Please enter your email and password.")
      return
    }

    try {
      setLoading(true)

      const { error } = await signIn.email({
        email,
        password,
        callbackURL: "/",
      })

      if (error) {
        setError(
          error.status === 401
            ? "Invalid email or password. Please try again."
            : error.message || "Unable to sign in. Please try again."
        )
        return
      }

      router.push("/")
      router.refresh()
    } catch {
      setError("Unable to sign in. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative z-10 flex min-h-[85vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1a1a]/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>

          <p className="mt-2 text-sm text-gray-400">
            Sign in to your HireLoop account to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-white/10 bg-[#111] px-4 py-3 text-sm text-white transition outline-none placeholder:text-gray-500 focus:border-[#7b61ff]"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
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
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-[#7b61ff] hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}

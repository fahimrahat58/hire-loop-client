import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignInPage() {
  return (
    <main className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#1a1a1a] p-6 shadow-xl sm:p-8">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>

        <p className="mt-2 text-sm text-gray-400">
          Sign in to your HireLoop account to continue.
        </p>

        <form className="mt-6 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-gray-300">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              className="border-white/10 bg-white/5 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password" className="text-gray-300">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              className="border-white/10 bg-white/5 text-white placeholder:text-gray-500"
            />
          </div>

          <button
            type="submit"
            className="mt-2 rounded-md bg-[#7b61ff] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6a4fff]"
          >
            Sign in
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

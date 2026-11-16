"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type SignInProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSwitchToSignUp?: () => void
}

export function SignIn({ open, onOpenChange, onSwitchToSignUp }: SignInProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-xl border border-white/10 bg-[#1a1a1a] p-5 text-white sm:p-6">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="text-lg font-bold text-white sm:text-xl">
            Welcome back
          </DialogTitle>

          <DialogDescription className="text-xs leading-relaxed text-gray-400 sm:text-sm">
            Sign in to your HireLoop account to continue.
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-4 py-2 sm:gap-5"
          onSubmit={(event) => {
            event.preventDefault()
            onOpenChange(false)
          }}
        >
          <div className="grid gap-2">
            <Label
              htmlFor="sign-in-email"
              className="text-xs text-gray-300 sm:text-sm"
            >
              Email
            </Label>

            <Input
              id="sign-in-email"
              type="email"
              required
              placeholder="you@example.com"
              className="h-10 border-white/10 bg-white/5 text-sm text-white placeholder:text-gray-500 sm:h-11"
            />
          </div>

          <div className="grid gap-2">
            <Label
              htmlFor="sign-in-password"
              className="text-xs text-gray-300 sm:text-sm"
            >
              Password
            </Label>

            <Input
              id="sign-in-password"
              type="password"
              required
              placeholder="••••••••"
              className="h-10 border-white/10 bg-white/5 text-sm text-white placeholder:text-gray-500 sm:h-11"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full cursor-pointer rounded-md bg-[#7b61ff] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6a4fff] sm:py-3"
          >
            Sign in
          </button>
        </form>

        <p className="text-center text-xs leading-relaxed text-gray-400 sm:text-sm">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="cursor-pointer font-semibold whitespace-nowrap text-[#7b61ff] hover:underline"
          >
            Sign up
          </button>
        </p>
      </DialogContent>
    </Dialog>
  )
}

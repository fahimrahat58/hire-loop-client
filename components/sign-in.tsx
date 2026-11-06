"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SignInProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignUp?: () => void;
};

export function SignIn({ open, onOpenChange, onSwitchToSignUp }: SignInProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#1a1a1a] text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Welcome back
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Sign in to your HireLoop account to continue.
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-4 py-2"
          onSubmit={(event) => {
            event.preventDefault();
            onOpenChange(false);
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="sign-in-email" className="text-gray-300">
              Email
            </Label>
            <Input
              id="sign-in-email"
              type="email"
              required
              placeholder="you@example.com"
              className="border-white/10 bg-white/5 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sign-in-password" className="text-gray-300">
              Password
            </Label>
            <Input
              id="sign-in-password"
              type="password"
              required
              placeholder="••••••••"
              className="border-white/10 bg-white/5 text-white placeholder:text-gray-500"
            />
          </div>

          <button
            type="submit"
            className="mt-2 cursor-pointer rounded-md bg-[#7b61ff] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6a4fff]"
          >
            Sign in
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="cursor-pointer font-semibold text-[#7b61ff] hover:underline"
          >
            Sign up
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
